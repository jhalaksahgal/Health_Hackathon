import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
from pydantic import BaseModel
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

# Pydantic model for Patient
class patients(BaseModel):
    name: str
    age: int
    gender: str
    medical_history: str

# Pydantic model for Chat Requests
class ChatRequest(BaseModel):
    patient_id: int
    user_message: str

# Function to connect to PostgreSQL
def get_db_connection():
    try:
        return psycopg2.connect(**DATABASE_CONFIG)
    except Exception as e:
        print("Database connection failed:", str(e))
        raise HTTPException(status_code=500, detail="Database connection error")

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
    system_instruction="your role to take the provided information and give each reply according to that and try to be stright forward and simple"
)

#fn to add new patient
@app.post("/patients/")
def create_patient(patient: patients):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            try:
                cursor.execute("""
                    INSERT INTO patients (name, age, gender, medical_history)
                    VALUES (%s, %s, %s, %s) RETURNING patient_id
                """, (patient.name, patient.age, patient.gender, patient.medical_history))

                new_patient_id = cursor.fetchone()[0]
                conn.commit()
                return {"patient_id": new_patient_id, "message": "Patient added successfully"}
            except Exception as e:
                conn.rollback()
                raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

# fn to update patient details
@app.put("/patients/{patient_id}")
def update_patient(patient_id: int, patient: patients):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE Patients 
                SET name = %s, age = %s, gender = %s, medical_history = %s
                WHERE patient_id = %s
                RETURNING patient_id
            """, (patient.name, patient.age, patient.gender, patient.medical_history, patient_id))

            updated_patient = cursor.fetchone()
            if not updated_patient:
                raise HTTPException(status_code=404, detail="Patient not found")

            conn.commit()
            return {"message": "Patient updated successfully", "patient_id": updated_patient[0]}

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

# fn to delete patients
@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM Patients WHERE patient_id = %s RETURNING patient_id", (patient_id,))
            deleted_patient = cursor.fetchone()

            if not deleted_patient:
                raise HTTPException(status_code=404, detail="Patient not found")

            conn.commit()
            return {"message": "Patient deleted successfully", "patient_id": deleted_patient[0]}

#fn to delete chat history
@app.delete("/chat/{patient_id}")
def delete_chat_history(patient_id: int):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM ChatHistory WHERE patient_id = %s RETURNING patient_id", (patient_id,))
            deleted_chats = cursor.fetchall()

            if not deleted_chats:
                raise HTTPException(status_code=404, detail="No chat history found for this patient")

            conn.commit()
            return {"message": "Chat history deleted successfully", "patient_id": patient_id}

# fn for Chatbot interaction and store chat history
@app.post("/chat/chatWithBot")  
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

        # Handle token usage properly
        tokens_used = getattr(response.usage_metadata, "total_tokens", 0) if hasattr(response, "usage_metadata") else 0
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
                    # "tokens_used": tokens_used,
                    # "tokens_remaining": tokens_remaining,
                    "timestamp": timestamp
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
