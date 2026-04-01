const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const testRoutes = require('./routes/test.routes');
const bookingRoutes = require('./routes/booking.routes');
const sampleRoutes = require('./routes/sample.routes');
const resultRoutes = require('./routes/result.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Connect to databases
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/invoices', invoiceRoutes);

// Serve generated PDF reports
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Booking service is healthy' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.BOOKING_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
