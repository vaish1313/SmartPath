import axios from "axios";

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  dateOfBirth?: string;
  role?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface CreateBookingData {
  patientId: string;
  patientName: string;
  patientPhone: string;
  tests: string[];
  bookingType: "walk-in" | "home-collection";
  appointmentDate: string;
  appointmentSlot: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  notes?: string;
  paymentMethod?: "cash" | "online" | "insurance";
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
export const loginUser = (email: string, password: string) =>
  patientApi.post("/api/auth/login", { email, password });

export const registerUser = (data: RegisterData) =>
  patientApi.post("/api/auth/register", data);

export const getMe = () =>
  patientApi.get("/api/auth/me");

export const logoutUser = () =>
  patientApi.post("/api/auth/logout");

// ── Patient (staff) ──
export const getProfile = () =>
  patientApi.get("/api/patients/profile");

export const updateProfile = (data: UpdateProfileData) =>
  patientApi.put("/api/patients/profile", data);

export const getAllPatients = (params?: { page?: number; limit?: number; search?: string }) =>
  patientApi.get("/api/patients", { params });

export const getPatientById = (id: string) =>
  patientApi.get(`/api/patients/${id}`);

export const createPatient = (data: {
  fullName: string; email: string; phone: string; password?: string;
  gender?: string; dateOfBirth?: string; bloodGroup?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
}) => patientApi.post("/api/patients", data);

export const updatePatient = (id: string, data: {
  fullName?: string; phone?: string; dateOfBirth?: string; gender?: string;
  bloodGroup?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string };
  medicalHistory?: { condition: string; diagnosedDate?: string; notes?: string }[];
}) => patientApi.put(`/api/patients/${id}`, data);

export const deletePatient = (id: string) =>
  patientApi.delete(`/api/patients/${id}`);

// ── Tests (patient-service port 3001) ──
export const getAllTests = (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
  patientApi.get("/api/tests", { params });

export const getTestCatalog = () =>
  patientApi.get("/api/tests/catalog");

export const getTestById = (id: string) =>
  patientApi.get(`/api/tests/${id}`);

export const createTest = (data: {
  testName: string; category: string; sampleType: string;
  price: number; discountedPrice?: number; turnaroundTime: number;
  description?: string;
  normalRange?: { male?: string; female?: string; unit?: string };
}) => patientApi.post("/api/tests", data);

export const updateTest = (id: string, data: Record<string, unknown>) =>
  patientApi.put(`/api/tests/${id}`, data);

export const deleteTest = (id: string) =>
  patientApi.delete(`/api/tests/${id}`);

// ── Packages (patient-service port 3001) ──
export const getAllPackages = () =>
  patientApi.get("/api/packages");

export const getPackageById = (id: string) =>
  patientApi.get(`/api/packages/${id}`);

export const createPackage = (data: {
  packageName: string; description?: string;
  tests: string[]; discountedPrice?: number;
}) => patientApi.post("/api/packages", data);

export const updatePackage = (id: string, data: Record<string, unknown>) =>
  patientApi.put(`/api/packages/${id}`, data);

export const deletePackage = (id: string) =>
  patientApi.delete(`/api/packages/${id}`);

// ── Bookings ──
export const createBooking = (data: {
  patientId: string; patientName: string; patientPhone: string;
  tests?: { testId: string; testName: string; testCode?: string; price: number }[];
  packages?: { packageId: string; packageName: string; price: number }[];
  collectionType: "walk-in" | "home-collection";
  collectionAddress?: { street?: string; city?: string; state?: string; pincode?: string };
  scheduledDate: string; scheduledTime: string;
  notes?: string; paymentMethod?: "cash" | "online" | "insurance";
}) => bookingApi.post("/api/bookings", data);

export const getAllBookings = (params?: {
  page?: number; limit?: number; status?: string;
  date?: string; search?: string; collectionType?: string;
}) => bookingApi.get("/api/bookings", { params });

export const getMyBookings = (page = 1, limit = 10) =>
  bookingApi.get("/api/bookings/my", { params: { page, limit } });

export const getPatientBookings = (patientId: string, page = 1, limit = 10) =>
  bookingApi.get(`/api/bookings/patient/${patientId}`, { params: { page, limit } });

export const getBookingById = (id: string) =>
  bookingApi.get(`/api/bookings/${id}`);

export const updateBookingStatus = (id: string, status: string) =>
  bookingApi.put(`/api/bookings/${id}/status`, { status });

export const assignTechnician = (id: string, technicianId: string) =>
  bookingApi.put(`/api/bookings/${id}/assign`, { technicianId });

export const cancelBooking = (id: string) =>
  bookingApi.delete(`/api/bookings/${id}`);

export const getAvailableSlots = (date: string) =>
  bookingApi.get("/api/bookings/slots", { params: { date } });
