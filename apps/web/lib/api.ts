import axios from "axios";

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  dateOfBirth?: string;
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

// Auth
export const loginUser = (email: string, password: string) =>
  patientApi.post("/api/auth/login", { email, password });

export const registerUser = (data: RegisterData) =>
  patientApi.post("/api/auth/register", data);

export const getMe = () =>
  patientApi.get("/api/auth/me");

export const logoutUser = () =>
  patientApi.post("/api/auth/logout");

// Tests
export const getAllTests = (params?: Record<string, unknown>) =>
  bookingApi.get("/api/tests", { params });

// Bookings
export const createBooking = (data: Record<string, unknown>) =>
  bookingApi.post("/api/bookings", data);

export const getMyBookings = (page = 1, limit = 10) =>
  bookingApi.get("/api/bookings/my", { params: { page, limit } });

export const getAvailableSlots = (date: string) =>
  bookingApi.get("/api/bookings/slots", { params: { date } });

export const cancelBooking = (id: string) =>
  bookingApi.delete(`/api/bookings/${id}`);
