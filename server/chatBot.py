from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
import google.generativeai as genai
import os
from bson import ObjectId  # Fix MongoDB ObjectId issue

# Load environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://healthHack:healthHack1234@healthhack.5noaz.mongodb.net/healthDB?retryWrites=true&w=majority")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.healthDB
patients_collection = db.patients
chat_history_collection = db.chat_history

# Initialize Gemini AI
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set! Please check your environment variables.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-pro")

# FastAPI Router
router = APIRouter()

# Request Model
class ChatRequest(BaseModel):
    patient_id: str
    user_message: str

@router.post("/chat/chatWithBot")
async def chat_with_bot(chat_request: ChatRequest):
    patient_id = chat_request.patient_id
    user_message = chat_request.user_message

    # Convert `patient_id` to ObjectId
    try:
        patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid patient ID format")

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Format patient details
    patient_context = (
        f"Patient Details:\n"
        f"- Name: {patient['name']}\n"
        f"- Age: {patient['age']}\n"
        f"- Gender: {patient['gender']}\n"
        f"- Medical History: {patient.get('medical_history', 'N/A')}\n\n"
        f"Now respond to the following message from the patient:"
    )

    full_prompt = f"{patient_context}\n\nUser: {user_message}"

    try:
        # ✅ Call Gemini API with full context
        response = model.generate_content(full_prompt)

        # ✅ Extract response safely
        bot_response = response.candidates[0].content.strip() if response.candidates else "Sorry, I couldn't generate a response."

        # ✅ Handle token usage (Avoid NoneType errors)
        tokens_used = getattr(response.usage_metadata, "total_tokens", 0) if hasattr(response, "usage_metadata") else 0
        tokens_remaining = max(0, 10000 - tokens_used)

        # ✅ Store chat in MongoDB
        chat_entry = {
            "patient_id": ObjectId(patient_id),
            "user_message": user_message,
            "bot_response": bot_response,
            "tokens_used": tokens_used,
            "tokens_remaining": tokens_remaining
        }
        chat_history_collection.insert_one(chat_entry)

        return {
            "patient_id": patient_id,
            "user_message": user_message,
            "bot_response": bot_response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
