import axios from "axios";

export interface RegisterData {
  fullName: string; email: string; phone: string; password: string;
  gender?: string; dateOfBirth?: string; role?: string;
}
export interface UpdateProfileData {
  fullName?: string; phone?: string; dateOfBirth?: string; gender?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
}

function createInstance(baseURL: string) {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("smartpath_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("smartpath_token");
        localStorage.removeItem("smartpath_user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return instance;
}

export const patientApi = createInstance("http://localhost:3001");
export const bookingApi = createInstance("http://localhost:3002");

// ── Auth ──
export const loginUser = (email: string, password: string) => patientApi.post("/api/auth/login", { email, password });
export const registerUser = (data: RegisterData) => patientApi.post("/api/auth/register", data);
export const getMe = () => patientApi.get("/api/auth/me");
export const logoutUser = () => patientApi.post("/api/auth/logout");

// ── Patients ──
export const getProfile = () => patientApi.get("/api/patients/profile");
export const updateProfile = (data: UpdateProfileData) => patientApi.put("/api/patients/profile", data);
export const getAllPatients = (params?: { page?: number; limit?: number; search?: string }) => patientApi.get("/api/patients", { params });
export const getPatientById = (id: string) => patientApi.get(`/api/patients/${id}`);
export const createPatient = (data: { fullName: string; email: string; phone: string; password?: string; gender?: string; dateOfBirth?: string; bloodGroup?: string; address?: { street?: string; city?: string; state?: string; pincode?: string } }) => patientApi.post("/api/patients", data);
export const updatePatient = (id: string, data: { fullName?: string; phone?: string; dateOfBirth?: string; gender?: string; bloodGroup?: string; address?: { street?: string; city?: string; state?: string; pincode?: string }; medicalHistory?: { condition: string; diagnosedDate?: string; notes?: string }[] }) => patientApi.put(`/api/patients/${id}`, data);
export const deletePatient = (id: string) => patientApi.delete(`/api/patients/${id}`);

// ── Tests (patient-service) ──
export const getAllTests = (params?: { page?: number; limit?: number; search?: string; category?: string }) => patientApi.get("/api/tests", { params });
export const getTestCatalog = () => patientApi.get("/api/tests/catalog");
export const getTestById = (id: string) => patientApi.get(`/api/tests/${id}`);
export const createTest = (data: { testName: string; category: string; sampleType: string; price: number; discountedPrice?: number; turnaroundTime: number; description?: string; normalRange?: { male?: string; female?: string; unit?: string } }) => patientApi.post("/api/tests", data);
export const updateTest = (id: string, data: Record<string, unknown>) => patientApi.put(`/api/tests/${id}`, data);
export const deleteTest = (id: string) => patientApi.delete(`/api/tests/${id}`);

// ── Packages (patient-service) ──
export const getAllPackages = () => patientApi.get("/api/packages");
export const getPackageById = (id: string) => patientApi.get(`/api/packages/${id}`);
export const createPackage = (data: { packageName: string; description?: string; tests: string[]; discountedPrice?: number }) => patientApi.post("/api/packages", data);
export const updatePackage = (id: string, data: Record<string, unknown>) => patientApi.put(`/api/packages/${id}`, data);
export const deletePackage = (id: string) => patientApi.delete(`/api/packages/${id}`);

// ── Bookings ──
export const createBooking = (data: { patientId: string; patientName: string; patientPhone: string; tests?: { testId: string; testName: string; testCode?: string; price: number }[]; packages?: { packageId: string; packageName: string; price: number }[]; collectionType: "walk-in" | "home-collection"; collectionAddress?: { street?: string; city?: string; state?: string; pincode?: string }; scheduledDate: string; scheduledTime: string; notes?: string; paymentMethod?: "cash" | "online" | "insurance" }) => bookingApi.post("/api/bookings", data);
export const getAllBookings = (params?: { page?: number; limit?: number; status?: string; date?: string; search?: string; collectionType?: string }) => bookingApi.get("/api/bookings", { params });
export const getMyBookings = (page = 1, limit = 10) => bookingApi.get("/api/bookings/my", { params: { page, limit } });
export const getPatientBookings = (patientId: string, page = 1, limit = 10) => bookingApi.get(`/api/bookings/patient/${patientId}`, { params: { page, limit } });
export const getBookingById = (id: string) => bookingApi.get(`/api/bookings/${id}`);
export const updateBookingStatus = (id: string, status: string) => bookingApi.put(`/api/bookings/${id}/status`, { status });
export const assignTechnician = (id: string, technicianId: string) => bookingApi.put(`/api/bookings/${id}/assign`, { technicianId });
export const cancelBooking = (id: string) => bookingApi.delete(`/api/bookings/${id}`);
export const getAvailableSlots = (date: string) => bookingApi.get("/api/bookings/slots", { params: { date } });
export const getDashboardStats = () => bookingApi.get("/api/bookings/stats");

// ── Samples ──
export const createSample = (data: { bookingId: string; patientId: string; patientName: string }) => bookingApi.post("/api/samples", data);
export const getAllSamples = (params?: { status?: string; date?: string; page?: number; limit?: number }) => bookingApi.get("/api/samples", { params });
export const getSampleById = (id: string) => bookingApi.get(`/api/samples/${id}`);
export const getSampleByBooking = (bookingId: string) => bookingApi.get(`/api/samples/booking/${bookingId}`);
export const updateSampleStatus = (id: string, status: string, rejectionReason?: string) => bookingApi.put(`/api/samples/${id}/status`, { status, rejectionReason });

// ── Results ──
export const createResult = (data: { bookingId: string; sampleId?: string; patientId: string; patientName: string; tests: { testId?: string; testName: string; value: string; unit?: string; normalRange?: { male?: string; female?: string }; status?: string }[] }) => bookingApi.post("/api/results", data);
export const getAllResults = (params?: { page?: number; limit?: number }) => bookingApi.get("/api/results", { params });
export const getResultById = (id: string) => bookingApi.get(`/api/results/${id}`);
export const getResultByBooking = (bookingId: string) => bookingApi.get(`/api/results/booking/${bookingId}`);
export const getPatientResults = (patientId: string) => bookingApi.get(`/api/results/patient/${patientId}`);
export const approveResult = (id: string) => bookingApi.put(`/api/results/${id}/approve`);
export const rejectResult = (id: string, rejectionNote: string) => bookingApi.put(`/api/results/${id}/reject`, { rejectionNote });
export const generateReport = (id: string) => bookingApi.post(`/api/results/${id}/generate-report`);

// ── Invoices ──
export const createInvoice = (data: { bookingId: string; discount?: { type: "flat" | "percent"; value: number; reason?: string }; notes?: string; gstRate?: number }) => bookingApi.post("/api/invoices", data);
export const getAllInvoices = (params?: { page?: number; limit?: number; paymentStatus?: string; search?: string; startDate?: string; endDate?: string }) => bookingApi.get("/api/invoices", { params });
export const getInvoiceById = (id: string) => bookingApi.get(`/api/invoices/${id}`);
export const getInvoiceByBooking = (bookingId: string) => bookingApi.get(`/api/invoices/booking/${bookingId}`);
export const getPatientInvoices = (patientId: string) => bookingApi.get(`/api/invoices/patient/${patientId}`);
export const updateInvoice = (id: string, data: Record<string, unknown>) => bookingApi.put(`/api/invoices/${id}`, data);
export const recordPayment = (id: string, data: { amount: number; method: string; transactionId?: string }) => bookingApi.post(`/api/invoices/${id}/payment`, data);
export const generateInvoicePdf = (id: string) => bookingApi.post(`/api/invoices/${id}/generate-pdf`);

// ── Payments (Razorpay) ──
export const createPaymentOrder = (invoiceId: string) =>
  bookingApi.post("/api/payments/create-order", { invoiceId });

export const verifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  invoiceId: string;
}) => bookingApi.post("/api/payments/verify", data);

// ── Reviews ──
export const getReviews = (limit = 20) => patientApi.get("/api/reviews", { params: { limit } });
export const createReview = (data: { bookingId: string; rating: number; review: string }) => patientApi.post("/api/reviews", data);
export const getReviewByBooking = (bookingId: string) => patientApi.get(`/api/reviews/booking/${bookingId}`);
