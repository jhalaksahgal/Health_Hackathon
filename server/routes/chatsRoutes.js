import express from "express";
import { ObjectId } from "mongodb";
import { model, chatHistoryCollection, patientsCollection } from "../config.js";

const router = express.Router();

// ✅ Chatbot API
router.post("/chat/chatWithBot", async (req, res) => {
    try {
        const { patient_id, user_message } = req.body;

        if (!patient_id || !user_message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const patient = await patientsCollection.findOne({ _id: new ObjectId(patient_id) });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        const patientContext = `
            Patient Details:
            - Name: ${patient.name}
            - Age: ${patient.age}
            - Gender: ${patient.gender}
            - Medical History: ${patient.medical_history || "No medical history available"}
        `;

        const fullPrompt = `${patientContext}\n\nUser: ${user_message}`;
        console.log("Sending to AI model:", fullPrompt); // Log the prompt

        const apiResponse = await model.generateContent(fullPrompt);
        console.log("API Response:", apiResponse); // Log the full response

        // Call the text function to get the response
        const bot_response = apiResponse.response.text();
        
        console.log("Bot Response:", bot_response); // Log the bot response

        await chatHistoryCollection.insertOne({
            patient_id: new ObjectId(patient_id),
            user_message,
            bot_response
        });

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
