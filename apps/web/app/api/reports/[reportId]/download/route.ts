import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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
  { params }: { params: { reportId: string } }
) {
  try {
    await connectDB();

    const report = await LabReport.findById(params.reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", report.pdfPath);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "PDF file not found on disk" },
        { status: 404 }
      );
    }

    const pdfBuffer = fs.readFileSync(filePath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="report.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
