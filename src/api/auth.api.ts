import { api } from "./axios";

export interface SignupData {
  userName: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  gender: "male" | "female";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

export const signupUser = async (data: SignupData) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const googleSignup = async (idToken: string) => {
  const response = await api.post("/auth/google/signup", { idToken });
  return response.data;
};

export const loginUser = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const googleLogin = async (idToken: string) => {
  const response = await api.post("/auth/google/login", { idToken });
  return response.data;
};

export const verifyEmail = async (data: VerifyEmailData) => {
  const response = await api.post("/auth/verify-email", data);
  return response.data;
};

export const forgotPasswordApi = async (data: ForgotPasswordData) => {
  const response = await api.patch("/auth/forget-password", data);
  return response.data;
};

export const resetPasswordApi = async (data: ResetPasswordData) => {
  const response = await api.patch("/auth/reset-password", data);
  return response.data;
};
