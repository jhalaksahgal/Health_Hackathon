import express from "express";
import { PatientModel } from "../models.js";

const router = express.Router();

// ✅ Add a New Patient
router.post("/addPatients", async (req, res) => {
    try {
        const { name, age, gender, medical_history } = req.body;
        if (!name || !age || !gender) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newPatient = new PatientModel({ name, age, gender, medical_history });
        await newPatient.save();
        res.status(201).json({ message: "Patient added successfully", patient: newPatient });
    } catch (err) {
        console.error("Error adding patient:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Get All Patients
router.get("/getPatients", async (req, res) => {
    try {
        const patients = await PatientModel.find({});
        res.json(patients);
    } catch (err) {
        console.error("Error fetching patients:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Update a Patient
router.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPatient = await PatientModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedPatient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json({ message: "Patient updated successfully", patient: updatedPatient });
    } catch (err) {
        console.error("Error updating patient:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Delete a Patient
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPatient = await PatientModel.findByIdAndDelete(id);
        
        if (!deletedPatient) {
            return res.status(404).json({ error: "Patient not found" });
        }

        await ChatHistoryModel.deleteMany({ patient_id: id }); // Remove related chats
        res.json({ message: "Patient deleted successfully" });
    } catch (err) {
        console.error("Error deleting patient:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
