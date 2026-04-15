const Prescription = require("../models/Prescription");
const { extractTextFromImage, parsePrescriptionText } = require("../services/ocrService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/prescriptions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "rx-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (JPEG, PNG) and PDF files are allowed"));
  },
}).single("prescription");

// Upload and OCR prescription
exports.uploadAndOCR = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      // Read uploaded file and convert to base64
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString("base64");

      // Step 1: Extract raw text via Google Vision
      const rawText = await extractTextFromImage(base64Image);

      // Step 2: Parse structured fields from raw text
      const parsed = parsePrescriptionText(rawText);

      // Generate image URL (relative path)
      const imageUrl = `/uploads/prescriptions/${req.file.filename}`;

      // Return structured response
      res.status(200).json({
        success: true,
        parsed,
        rawText,
        imageUrl,
        error: parsed.confidence === "failed" ? "parse_failed" : null,
      });
    } catch (error) {
      console.error("OCR error:", error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Failed to process prescription",
        error: error.message,
      });
    }
  });
};

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, imageUrl, rawText, parsed } = req.body;

    if (!patientId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and image URL are required",
      });
    }

    const prescription = new Prescription({
      patientId,
      imageUrl,
      rawText: rawText || null,
      parsed: parsed || null,
    });

    await prescription.save();

    res.status(201).json({
      success: true,
      message: "Prescription saved successfully",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save prescription",
      error: error.message,
    });
  }
};

// Get all prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .sort({ uploadedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// Get a single prescription by ID
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id).lean();

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Get prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
      error: error.message,
    });
  }
};
