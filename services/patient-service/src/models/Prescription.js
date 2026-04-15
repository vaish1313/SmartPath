const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      default: null,
    },
    parsed: {
      doctorName: { type: String, default: null },
      hospitalOrClinic: { type: String, default: null },
      patientName: { type: String, default: null },
      date: { type: String, default: null },
      suggestedTests: [
        {
          testName: { type: String, required: true },
          notes: { type: String, default: null },
        },
      ],
      medications: [
        {
          name: { type: String, required: true },
          dosage: { type: String, default: null },
          frequency: { type: String, default: null },
          duration: { type: String, default: null },
        },
      ],
      diagnosis: { type: String, default: null },
      additionalNotes: { type: String, default: null },
    },
    confidence: {
      type: String,
      enum: ["high", "medium", "low", "failed"],
      default: "medium",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate confidence based on parsed data
prescriptionSchema.pre("save", function (next) {
  if (this.parsed) {
    const hasTests = this.parsed.suggestedTests && this.parsed.suggestedTests.length > 0;
    const hasDoctor = this.parsed.doctorName !== null && this.parsed.doctorName !== "";

    if (hasTests && hasDoctor) {
      this.confidence = "high";
    } else if (hasTests || hasDoctor) {
      this.confidence = "medium";
    } else if (
      this.parsed.medications?.length > 0 ||
      this.parsed.diagnosis ||
      this.parsed.hospitalOrClinic
    ) {
      this.confidence = "low";
    } else {
      this.confidence = "failed";
    }
  } else {
    this.confidence = "failed";
  }
  next();
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
