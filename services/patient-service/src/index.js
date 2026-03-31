require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const redis = require('./config/redis');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
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
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Patient service is healthy' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PATIENT_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Patient Service running on port ${PORT}`);
});
