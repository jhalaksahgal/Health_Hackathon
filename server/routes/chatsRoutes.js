import express from "express";
import { ObjectId } from "mongodb";
import { model, chatHistoryCollection, patientsCollection } from "../config.js";

const router = express.Router();

// ✅ Chatbot API
router.post("/chat/chatWithBot", async (req, res) => {
    try {
        const { patient_id, user_message } = req.body;

        // 🔹 Validate input
        if (!patient_id || !user_message) {
            return res.status(400).json({ error: "Missing patient_id or user_message" });
        }

        // 🔹 Check if patient_id is a valid MongoDB ObjectId
        if (!ObjectId.isValid(patient_id)) {
            return res.status(400).json({ error: "Invalid patient ID format" });
        }

        // 🔹 Fetch patient details from MongoDB
        const patient = await patientsCollection.findOne({ _id: new ObjectId(patient_id) });
        console.log("Received patient_id:", patient_id);
        
        
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
            
        }
        
        // 🔹 Prepare patient context for the chatbot
        const medicalHistory = patient.medical_history || "No medical history available";
        const patientContext = `
        Patient Details:
        - Name: ${patient.name}
        - Age: ${patient.age}
        - Gender: ${patient.gender}
        - Medical History: ${medicalHistory}
        
        Now respond to the following message from the patient:
        `;
        
        // 🔹 Send request to Gemini AI API
        const fullPrompt = `${patientContext}\n\nUser: ${user_message}`;
        const response = await model.generateContent(fullPrompt);

        // 🔹 Extract bot response safely
        const bot_response = response?.candidates?.[0]?.content?.parts?.[0]?.text || 
                             "Sorry, I couldn't generate a response.";

        // 🔹 Store chat in MongoDB
        await chatHistoryCollection.insertOne({
            patient_id: new ObjectId(patient_id),
            user_message,
            bot_response
        });

        // ✅ Return response to client
        return res.status(200).json({
            patient_id,
            user_message,
            bot_response
        });

    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ error: `Chatbot error: ${error.message}` });
    }
});

export default router;
