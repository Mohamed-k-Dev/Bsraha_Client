import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import Joi from "joi";
import { isAxiosError } from "axios";
import { GoogleLogin } from "@react-oauth/google";

import { Spinner } from "@/components/ui";
import { loginUser, googleLogin, LoginData } from "@/api/auth.api";
import { setCredentials } from "@/store/slices/authSlice";
import { cn } from "@/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Frontend Joi Schema (Mirrors your Backend loginSchema)
// ─────────────────────────────────────────────────────────────────────────────
const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      "string.pattern.base": "Please fill a valid email address",
      "string.empty": "Email is required",
    }),
  password: Joi.string()
    .required()
    .min(8)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .messages({
      "string.min": "At least 8 characters long",
      "string.pattern.base": "Incorrect password format",
      "string.empty": "Password is required",
    }),
});

const validateWithJoi = (values: LoginData) => {
  const { error } = loginSchema.validate(values, { abortEarly: false });
  if (!error) return {};

  const errors: Record<string, string> = {};
  error.details.forEach((detail) => {
    if (!errors[detail.path[0]]) {
      errors[detail.path[0]] = detail.message;
    }
  });
  return errors;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Standard Login Mutation
  const {
    mutate: standardLogin,
    isPending,
    error: apiError,
  } = useMutation({
    mutationFn: (data: LoginData) => loginUser(data),
    onSuccess: (data) => {
      // 1. Extract tokens from your backend response structure
      const { accessToken, refreshToken } = data.data;

      // 2. Save tokens securely
      dispatch(setCredentials({ accessToken }));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // 3. Now safe to navigate to dashboard
      navigate("/dashboard");
    },
  });

  // Google Login Mutation
  const { mutate: googleMutate, isPending: isGooglePending } = useMutation({
    mutationFn: (idToken: string) => googleLogin(idToken),
    onSuccess: (data) => {
      // 1. Extract tokens from your backend response structure
      const { accessToken, refreshToken } = data.data;

      // 2. Save tokens securely
      dispatch(setCredentials({ accessToken }));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // 3. Now safe to navigate to dashboard
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "Google login failed."
        : error?.message;
      setGoogleError(msg);
    },
  });

  // Formik Setup
  const formik = useFormik<LoginData>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: validateWithJoi,
    onSubmit: (values) => {
      standardLogin(values);
    },
  });

  const errorMessage = isAxiosError(apiError)
    ? apiError.response?.data?.message || "Invalid email or password."
    : apiError?.message;

  const displayError = errorMessage || googleError;

  const getInputProps = (name: keyof LoginData) => ({
    id: name,
    name,
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    value: formik.values[name],
    className: cn(
      "w-full bg-paper-50 border rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors",
      formik.touched[name] && formik.errors[name]
        ? "border-rose-500 focus:border-rose-600 bg-rose-50/30"
        : "border-ink-200 focus:border-ember-500"
    ),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">
        Welcome back
      </h1>
      <p className="text-ink-500 mb-8">
        Log in to see what people have been saying.
      </p>

      {/* Error Alert */}
      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium mb-5">
              {displayError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="email"
              placeholder="you@example.com"
              {...getInputProps("email")}
              autoComplete="email"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-ink-700 uppercase tracking-wider"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-ember-600 hover:text-ember-700 font-medium"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              {...getInputProps("password")}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.password}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || isGooglePending}
            className="w-full bg-ember-500 hover:bg-ember-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                Log in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-ink-200"></div>
            <span className="flex-shrink-0 mx-4 text-ink-400 text-xs font-bold uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-ink-200"></div>
          </div>

          {/* Google Login Button (Matching exact button width via Tailwind override) */}
          <div className="w-full [&>div]:w-full [&>div>iframe]:w-full flex justify-center">
            {isGooglePending ? (
              <div className="py-2">
                <Spinner size="md" />
              </div>
            ) : (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    setGoogleError(null);
                    googleMutate(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  setGoogleError(
                    "Google Authentication failed. Please try again."
                  );
                }}
                useOneTap
                shape="pill"
                theme="outline"
                size="large"
                text="signin_with"
                width="100%"
              />
            )}
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        No account yet?{" "}
        <Link
          to="/signup"
          className="text-ember-600 font-bold hover:text-ember-700 transition-colors"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
