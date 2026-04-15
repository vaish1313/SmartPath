import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/diagnostic-lab";
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

const LabReportSchema = new mongoose.Schema(
  {
    patientId: String,
    bookingId: String,
    reportDate: Date,
    doctorName: String,
    labTechnicianId: String,
    tests: Array,
    status: String,
    pdfPath: String,
  },
  { timestamps: true }
);

const LabReport = mongoose.models.LabReport || mongoose.model("LabReport", LabReportSchema);

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    await connectDB();

    const reports = await LabReport.find(
      { patientId: params.patientId },
      { pdfPath: 0 } // exclude pdfPath from list response
    ).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
