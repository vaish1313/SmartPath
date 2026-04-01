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

// ── Tests ──
export const getAllTests = (params?: { category?: string; sampleType?: string; search?: string }) =>
  bookingApi.get("/api/tests", { params });

export const getTestById = (id: string) =>
  bookingApi.get(`/api/tests/${id}`);

export const createTest = (data: {
  name: string; code: string; category: string; sampleType: string;
  price: number; discountedPrice?: number; turnaroundTime: string;
  description?: string; preparationInstructions?: string;
  isHomeCollectionAvailable?: boolean;
}) => bookingApi.post("/api/tests", data);

// ── Bookings ──
export const createBooking = (data: CreateBookingData) =>
  bookingApi.post("/api/bookings", data);

export const getMyBookings = (page = 1, limit = 10) =>
  bookingApi.get("/api/bookings/my", { params: { page, limit } });

export const getBookingById = (id: string) =>
  bookingApi.get(`/api/bookings/${id}`);

export const cancelBooking = (id: string) =>
  bookingApi.delete(`/api/bookings/${id}`);

export const getAvailableSlots = (date: string) =>
  bookingApi.get("/api/bookings/slots", { params: { date } });

export const getAllBookings = (params?: { page?: number; limit?: number; status?: string; date?: string }) =>
  bookingApi.get("/api/bookings", { params });
