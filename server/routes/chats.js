import express from "express";
import { ChatHistoryModel, PatientModel } from "../models.js";

const router = express.Router();

// ✅ Add Chat History for a Patient
router.post("/add", async (req, res) => {
    try {
        const { patient_id, user_message, bot_response, tokens_used } = req.body;
        const patient = await PatientModel.findById(patient_id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });

        const newChat = new ChatHistoryModel({ patient_id, user_message, bot_response, tokens_used });
        await newChat.save();
        res.status(201).json({ message: "Chat added successfully", chat: newChat });
    } catch (err) {
        console.error("Error adding chat:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch Chat History for a Patient
router.get("/get/:patient_id", async (req, res) => {
    try {
        const { patient_id } = req.params;
        const chats = await ChatHistoryModel.find({ patient_id });
        res.json(chats);
    } catch (err) {
        console.error("Error fetching chat history:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Delete Chat History
router.delete("/delete/:chat_id", async (req, res) => {
    try {
        const { chat_id } = req.params;
        const deletedChat = await ChatHistoryModel.findByIdAndDelete(chat_id);

        if (!deletedChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error("Error deleting chat:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
