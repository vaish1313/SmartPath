require('dotenv').config({ path: '../../.env' });
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const testRoutes = require('./routes/test.routes');
const bookingRoutes = require('./routes/booking.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Connect to databases
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);

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
