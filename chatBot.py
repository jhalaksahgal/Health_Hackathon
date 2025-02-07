import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Check if API key is loaded
if not GEMINI_API_KEY:
    raise RuntimeError("Google API key is missing. Set 'GEMINI_API_KEY' in environment variables.")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI
app = FastAPI()

# Database Configuration
DATABASE_CONFIG = {
    "dbname": "healthMenta-Project",
    "user": "postgres",
    "password": "0458",
    "host": "localhost",
    "port": "5000"  # Ensure PostgreSQL is running on this port
}

# Function to connect to PostgreSQL
def get_db_connection():
    try:
        return psycopg2.connect(**DATABASE_CONFIG)
    except Exception as e:
        print("Database connection failed:", str(e))
        raise HTTPException(status_code=500, detail="Database connection error")

# Pydantic model for Chat Requests
class ChatRequest(BaseModel):
    patient_id: int
    user_message: str

# Gemini model configuration
safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_NONE",
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
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
    system_instruction="You are a doctor. Be short and brief in your response."
)

# API: Chatbot interaction and store chat history@app.post("/chat/")  
@app.post("/chat/")
def chat_with_bot(chat_request: ChatRequest):
    patient_id = chat_request.patient_id
    user_message = chat_request.user_message

    # Fetch patient details before sending message to Gemini
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM Patients WHERE patient_id = %s", (patient_id,))
            patient = cursor.fetchone()
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

        # Debugging: Print response object to inspect structure
        print("Raw Gemini Response:", response)

        # Extract response text safely
        bot_response = getattr(response, "text", "").strip() if hasattr(response, "text") else "Sorry, I couldn't generate a response."

        # Handle token usage safely
        tokens_used = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            print("Usage Metadata Found:", response.usage_metadata)  # Debugging
            tokens_used = response.usage_metadata.get("total_tokens", 0)  # Use `.get()` instead of direct access

        tokens_remaining = max(0, 10000 - tokens_used)  # Ensure it's not negative

        # Store chat in PostgreSQL
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO ChatHistory (patient_id, user_message, bot_response, tokens_used, tokens_remaining)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING chat_id, timestamp
                """, (patient_id, user_message, bot_response, tokens_used, tokens_remaining))

                chat_id, timestamp = cursor.fetchone()
                conn.commit()

                return {
                    "chat_id": chat_id,
                    "patient_id": patient_id,
                    "user_message": user_message,
                    "bot_response": bot_response,
                    "tokens_used": tokens_used,
                    "tokens_remaining": tokens_remaining,
                    "timestamp": timestamp
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")

# API: Get chat history for a patient
@app.get("/chat/{patient_id}")
def get_chat_history(patient_id: int):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            try:
                cursor.execute("SELECT * FROM ChatHistory WHERE patient_id = %s ORDER BY timestamp DESC", (patient_id,))
                chats = cursor.fetchall()

                if not chats:
                    raise HTTPException(status_code=404, detail="No chat history found for this patient")

                return {"chat_history": chats}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
