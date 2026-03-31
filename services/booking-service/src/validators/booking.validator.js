const { z } = require('zod');

const createTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  code: z.string().min(1, 'Test code is required'),
  category: z.enum(['hematology', 'biochemistry', 'microbiology', 'immunology', 'urology', 'radiology', 'other']),
  price: z.number().min(0, 'Price must be positive'),
  turnaroundTime: z.string().min(1, 'Turnaround time is required'),
  sampleType: z.enum(['blood', 'urine', 'stool', 'swab', 'other']),
  description: z.string().optional(),
  discountedPrice: z.number().min(0).optional(),
  preparationInstructions: z.string().optional(),
  normalRanges: z.array(z.object({
    parameter: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
    unit: z.string().optional(),
    gender: z.string().optional(),
  })).optional(),
  isHomeCollectionAvailable: z.boolean().optional(),
});

const createBookingSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(2, 'Patient name is required'),
  patientPhone: z.string().min(1, 'Phone is required'),
  tests: z.array(z.string()).min(1, 'At least one test is required'),
  bookingType: z.enum(['walk-in', 'home-collection']),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentSlot: z.string().min(1, 'Appointment slot is required'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }).optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash', 'online', 'insurance']).optional(),
}).refine((data) => {
  if (data.bookingType === 'home-collection') {
    return data.address && data.address.street && data.address.city && data.address.state && data.address.pincode;
  }
  return true;
}, {
  message: 'Address is required for home collection bookings',
  path: ['address'],
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'sample-collected', 'processing', 'completed', 'cancelled']),
});

const validate = (schema) => {
  return (req, res, next) => {
    // Debug: log every incoming request body and headers
    console.log('[BOOKING] Incoming request:', req.method, req.path);
    console.log('[BOOKING] Body:', JSON.stringify(req.body, null, 2));
    console.log('[BOOKING] Auth header present:', !!req.headers.authorization);

    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        console.log('[BOOKING] Validation failed:', JSON.stringify(errors, null, 2));
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errors.map((e) => `${e.field} — ${e.message}`).join('; ')}`,
          errors,
        });
      }
      next(error);
    }
  };
};

module.exports = {
  createTestSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  validate,
};
