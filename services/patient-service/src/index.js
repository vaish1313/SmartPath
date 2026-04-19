require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('express-async-errors');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const testRoutes = require('./routes/test.routes');
const packageRoutes = require('./routes/package.routes');
const userRoutes = require('./routes/user.routes');
const reviewRoutes = require('./routes/review.routes');
const offerRoutes = require('./routes/offers');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Connect to databases
connectDB();

// Middleware
app.use(helmet());

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'https://smart-path-web-jtno.vercel.app',
  'https://smart-path.co.in',
  'https://www.smart-path.co.in',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Handle preflight requests
app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

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
