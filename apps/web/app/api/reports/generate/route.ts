import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import { CLINIC_CONFIG, getPathologist } from "@/lib/config/clinic.config";

// Register Handlebars helper
Handlebars.registerHelper("eq", (a, b) => a === b);

const PATIENT_SERVICE = process.env.PATIENT_SERVICE_URL || "https://patient-service-kfu5.onrender.com";
const BOOKING_SERVICE = process.env.BOOKING_SERVICE_URL || "https://smartpath-5wup.onrender.com";
const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/diagnostic-lab";
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected for reports");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// LabReport Schema
const LabReportSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    bookingId: { type: String, required: true },
    reportDate: { type: Date, default: Date.now },
    doctorName: { type: String, default: "Dr. Sandeep Mall" },
    labTechnicianId: { type: String },
    tests: [
      {
        testName: String,
        testCode: String,
        value: String,
        unit: String,
        referenceRange: String,
        flag: { type: String, enum: ["normal", "high", "low", "critical"] },
        method: String,
      },
    ],
    status: { type: String, enum: ["draft", "finalized"], default: "finalized" },
    pdfPath: String,
  },
  { timestamps: true }
);

const LabReport = mongoose.models.LabReport || mongoose.model("LabReport", LabReportSchema);

// Helper functions
function calcAge(dob: string | undefined): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString();
}

function mapFlag(status: string | undefined): string {
  if (status === "critical") return "critical";
  if (status === "abnormal") return "high";
  return "normal";
}

async function generateReportPDF(data: any): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), "lib", "templates", "report-template.html");
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(templateSource);
  const html = template(data);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true, // Changed from "new" to true for latest version
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "bookingId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch booking
    let booking: any;
    try {
      const bRes = await axios.get(`${BOOKING_SERVICE}/api/bookings/${bookingId}`);
      booking = bRes.data.booking;
    } catch {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // 2. Fetch result for this booking
    let result: any = null;
    try {
      const rRes = await axios.get(`${BOOKING_SERVICE}/api/results/booking/${bookingId}`);
      result = rRes.data.result;
    } catch {
      // Result may not exist yet
    }

    // 3. Fetch patient
    let patient: any = null;
    try {
      const pRes = await axios.get(`${PATIENT_SERVICE}/api/patients/${booking.patientId}`);
      patient = pRes.data.patient;
    } catch {
      // Non-critical
    }

    // 4. Build tests array
    const tests = result
      ? result.tests.map((t: any) => ({
          testName: t.testName || "—",
          testCode: t.testCode || "",
          value: t.value || "—",
          unit: t.unit || "—",
          referenceRange: t.normalRange?.male || t.normalRange?.female || "—",
          flag: mapFlag(t.status),
          method: t.method || "—",
        }))
      : (booking.tests || []).map((t: any) => ({
          testName: t.testName || "—",
          testCode: t.testCode || "",
          value: "—",
          unit: "—",
          referenceRange: "—",
          flag: "normal",
          method: "—",
        }));

    // 5. Build template data
    const now = new Date();
    const reportId = `RPT-${Date.now()}`;
    const pathologist = getPathologist();

    const data = {
      reportId,
      generatedAt: now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      status: "Finalized",
      patientName: booking.patientName || patient?.fullName || "—",
      patientId: booking.patientId || "—",
      bookingId: booking.bookingId || bookingId,
      phone: booking.patientPhone || patient?.phone || "—",
      age: calcAge(patient?.dateOfBirth),
      gender: patient?.gender
        ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
        : "—",
      reportDate: now.toLocaleDateString("en-IN", { dateStyle: "long" }),
      sampleDate: booking.scheduledDate
        ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { dateStyle: "long" })
        : "—",
      doctorName: pathologist.name,
      doctorQualification: pathologist.qualification,
      tests,
      // Clinic information from config
      clinic: {
        name: CLINIC_CONFIG.name,
        address: CLINIC_CONFIG.address.fullAddress,
        phone: CLINIC_CONFIG.contact.phone,
        email: CLINIC_CONFIG.contact.email,
        timings: CLINIC_CONFIG.contact.timings,
        accreditation: CLINIC_CONFIG.accreditation.displayText,
        disclaimer: CLINIC_CONFIG.report.footer.disclaimer
      }
    };

    // 6. Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateReportPDF(data);
    } catch (err) {
      console.error("PDF generation error:", err);
      return NextResponse.json(
        { success: false, message: "PDF generation failed" },
        { status: 500 }
      );
    }

    // 7. Save PDF to disk
    const filename = `${reportId}.pdf`;
    const pdfPath = path.join(GENERATED_DIR, filename);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // 8. Save LabReport to MongoDB
    const labReport = await LabReport.create({
      patientId: booking.patientId,
      bookingId: booking.bookingId || bookingId,
      reportDate: now,
      doctorName: pathologist.name,
      labTechnicianId: booking.assignedTechnician || null,
      tests,
      status: "finalized",
      pdfPath: `/generated/${filename}`,
    });

    return NextResponse.json({
      success: true,
      reportId: labReport._id,
      message: "Report generated",
    });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
