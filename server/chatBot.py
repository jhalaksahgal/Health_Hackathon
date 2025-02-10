import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv


# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if API key is loaded
if not GEMINI_API_KEY:
    raise RuntimeError("❌ Google API key is missing. Set 'GEMINI_API_KEY' in environment variables.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI
app = FastAPI()

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.healthDB  # Database Name
patients_collection = db.patients  # Patients Collection
chat_history_collection = db.chat_history  # Chat History Collection

# Pydantic model for Patient
class Patient(BaseModel):
    name: str
    age: int
    gender: str
    medical_history: str

# Pydantic model for Chat Requests
class ChatRequest(BaseModel):
    patient_id: str  # Now using MongoDB ObjectId as a string
    user_message: str

# Gemini model configuration
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

generation_config = {
    "temperature": 0.7,
    "top_p": 0.9,
    "max_output_tokens": 500,
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    safety_settings=safety_settings,
    generation_config=generation_config,
    system_instruction="your role to take the provided information and give each reply according to that and try to be straight forward and simple, try to provide a quick and simple solution (like first aid and such) before telling the patient to consult a doctor.",
)

# ✅ API to Add a New Patient
@app.post("/patients/")
def create_patient(patient: Patient):
    new_patient = {
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "medical_history": patient.medical_history
    }
    result = patients_collection.insert_one(new_patient)
    return {"patient_id": str(result.inserted_id), "message": "Patient added successfully"}

# ✅ API to Update Patient Details
@app.put("/patients/{patient_id}")
def update_patient(patient_id: str, patient: Patient):
    result = patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": patient.dict()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {"message": "Patient updated successfully"}

# ✅ API to Get Chat History for a Patient
@app.get("/chat/{patient_id}")
def get_chat_history(patient_id: str):
    chats = list(chat_history_collection.find({"patient_id": ObjectId(patient_id)}, {"_id": 0}))

    if not chats:
        raise HTTPException(status_code=404, detail="No chat history found for this patient")

    return {"chat_history": chats}

# ✅ API to Delete a Patient
@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: str):
    result = patients_collection.delete_one({"_id": ObjectId(patient_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {"message": "Patient deleted successfully"}

# ✅ API to Delete Chat History for a Patient
@app.delete("/chat/{patient_id}")
def delete_chat_history(patient_id: str):
    result = chat_history_collection.delete_many({"patient_id": ObjectId(patient_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No chat history found for this patient")

    return {"message": "Chat history deleted successfully"}

# ✅ API for Chatbot Interaction and Storing Chat History
@app.post("/chat/chatWithBot")
def chat_with_bot(chat_request: ChatRequest):
    patient_id = chat_request.patient_id
    user_message = chat_request.user_message

    # Fetch patient details
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Format patient details into context
    patient_context = (
        f"Patient Details:\n"
        f"- Name: {patient['name']}\n"
        f"- Age: {patient['age']}\n"
        f"- Gender: {patient['gender']}\n"
        f"- Medical History: {patient['medical_history']}\n\n"
        f"Now respond to the following message from the patient:"
    )

    # Combine patient context with user message
    full_prompt = f"{patient_context}\n\nUser: {user_message}"

    try:
        # Call the Gemini AI API with the full context
        response = model.generate_content(full_prompt)

        # ✅ Correct way to extract the response
        bot_response = response.text.strip() if hasattr(response, "text") else "Sorry, I couldn't generate a response."

        # Store chat in MongoDB
        chat_entry = {
            "patient_id": ObjectId(patient_id),
            "user_message": user_message,
            "bot_response": bot_response
        }
        chat_history_collection.insert_one(chat_entry)

        return {
            "patient_id": patient_id,
            "user_message": user_message,
            "bot_response": bot_response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
