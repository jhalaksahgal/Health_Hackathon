import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import patientRoutes from "./routes/patients.js";
import chatRoutes from "./routes/chats.js";

const app = express();
const PORT = 3001; // Hardcoded Port
const MONGO_URI = "mongodb+srv://healthHack:healthHack1234@healthhack.5noaz.mongodb.net/healthDB?retryWrites=true&w=majority"; // Hardcoded MongoDB URI

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/patients", patientRoutes);
app.use("/chats", chatRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
