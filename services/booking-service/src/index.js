const path = require("path");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../.env"),
});
require("express-async-errors");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const redis = require("./config/redis");
const testRoutes = require("./routes/test.routes");
const bookingRoutes = require("./routes/booking.routes");
const sampleRoutes = require("./routes/sample.routes");
const resultRoutes = require("./routes/result.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const paymentRoutes = require("./routes/payment.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Connect to databases
connectDB();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(helmet());

const allowedOrigins = [
  "https://smart-path-web-jtno.vercel.app",
  "https://smart-path.co.in",
  "https://www.smart-path.co.in",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Handle preflight requests
app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/tests", testRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);

// Serve generated PDF reports
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Booking service is healthy" });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.BOOKING_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
