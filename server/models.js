import mongoose from "mongoose";

// Patient Schema
const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    medical_history: { type: String, default: "" } // Optional field
}, { timestamps: true });

const PatientModel = mongoose.model("patients", PatientSchema);

// Chat History Schema
const ChatHistorySchema = new mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "patients", required: true },
    user_message: { type: String, required: true },
    bot_response: { type: String, required: true },
    tokens_used: { type: Number, default: 0 }
}, { timestamps: true });

const ChatHistoryModel = mongoose.model("chat_history", ChatHistorySchema);

export { PatientModel, ChatHistoryModel };
