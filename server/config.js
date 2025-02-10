import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check API Key
if (!GEMINI_API_KEY) {
    throw new Error("❌ Google API key is missing. Set 'GEMINI_API_KEY' in environment variables.");
}

// Configure Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 500
    },
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ],
    systemInstruction: "Your role is to take the provided information and give each reply accordingly. Try to be straightforward and simple, providing quick solutions (like first aid) before advising the patient to consult a doctor."
});

// Initialize Express App
const app = express();
app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(MONGO_URI);
let db, patientsCollection, chatHistoryCollection;

// Start Server and Initialize Database Connection
async function startServer() {
    try {
        await client.connect();
        db = client.db("healthDB");
        patientsCollection = db.collection("patients");
        chatHistoryCollection = db.collection("chat_history");
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
}

startServer(); // Call the function to connect

// Export modules properly
export { app, patientsCollection, chatHistoryCollection, model };
