const express = require("express");
const router = express.Router();
const {
  uploadAndOCR,
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  deletePrescription,
} = require("../controllers/prescriptionController");
const { authMiddleware } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Upload and OCR prescription (no auth required for upload, but auth for saving)
router.post("/upload-ocr", uploadAndOCR);

// Create a new prescription
router.post("/", createPrescription);

// Get all prescriptions for a patient
router.get("/patient/:patientId", getPatientPrescriptions);

// Get a single prescription by ID
router.get("/:id", getPrescriptionById);

// Delete a prescription
router.delete("/:id", deletePrescription);

module.exports = router;
