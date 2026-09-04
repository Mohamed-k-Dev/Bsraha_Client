import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  AtSign,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import Joi from "joi";
import { isAxiosError } from "axios";
import { GoogleLogin } from "@react-oauth/google";

import { Spinner } from "@/components/ui";
import { signupUser, googleSignup, SignupData } from "@/api/auth.api";
import {
  setEmailForVerification,
  setCredentials,
} from "@/store/slices/authSlice";
import { cn } from "@/utils";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Frontend Joi Schema (Mirrors your Backend)
// ─────────────────────────────────────────────────────────────────────────────
const signupSchema = Joi.object({
  userName: Joi.string().required().trim().min(3).max(30).messages({
    "string.min": "Must be at least 3 characters",
    "string.max": "Must be at most 30 characters",
    "string.empty": "Username is required",
  }),
  displayName: Joi.string().required().messages({
    "string.empty": "Display name is required",
  }),
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
      "string.pattern.base":
        "Needs uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Passwords must match",
    "string.empty": "Confirm password is required",
  }),
  age: Joi.number().required().min(18).max(100).messages({
    "number.base": "Age must be a number",
    "number.min": "You must be at least 18",
    "number.max": "Age must be at most 100",
    "any.required": "Age is required",
  }),
  gender: Joi.string().valid("male", "female").required(),
});

const validateWithJoi = (values: SignupData) => {
  const { error } = signupSchema.validate(values, { abortEarly: false });
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
// 2. Component
// ─────────────────────────────────────────────────────────────────────────────
export function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Standard Form Mutation
  const {
    mutate: standardSignup,
    isPending,
    error: apiError,
  } = useMutation({
    mutationFn: (data: SignupData) => signupUser(data),
    onSuccess: (_, variables) => {
      dispatch(setEmailForVerification(variables.email));
      navigate("/verify");
    },
  });

  // Google Mutation
  const { mutate: googleMutate, isPending: isGooglePending } = useMutation({
    mutationFn: (idToken: string) => googleSignup(idToken),
    onSuccess: (data) => {
      const { accessToken, refreshToken } = data.data;
      dispatch(setCredentials({ accessToken }));
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      navigate("/dashboard");
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || "Google signup failed."
        : error?.message;
      setGoogleError(msg);
    },
  });

  // Formik Integration
  const formik = useFormik<SignupData>({
    initialValues: {
      userName: "mohamed khaled",
      displayName: "",
      email: "",
      password: "Mk@123456",
      confirmPassword: "Mk@123456",
      age: "18" as unknown as number,
      gender: "male",
    },
    validate: validateWithJoi,
    onSubmit: (values) => {
      const formattedValues = {
        ...values,
        userName: values.userName.toUpperCase(),
      };
      standardSignup(formattedValues);
    },
  });

  const errorMessage = isAxiosError(apiError)
    ? apiError.response?.data?.message ||
      "Registration failed. Please try again."
    : apiError?.message;

  const displayError = errorMessage || googleError;

  const getInputProps = (name: keyof SignupData) => ({
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
      className="w-full max-w-lg mx-auto pb-12"
    >
      <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">
        Create your account
      </h1>
      <p className="text-ink-500 mb-8">
        Join Bsraha. Say things without saying who.
      </p>

      {/* Combined Error State */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="userName"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="text"
                placeholder="unique_name"
                {...getInputProps("userName")}
              />
            </div>
            {formik.touched.userName && formik.errors.userName && (
              <p className="text-rose-500 text-xs font-medium mt-1.5">
                {formik.errors.userName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="text"
                placeholder="John Doe"
                {...getInputProps("displayName")}
              />
            </div>
            {formik.touched.displayName && formik.errors.displayName && (
              <p className="text-rose-500 text-xs font-medium mt-1.5">
                {formik.errors.displayName}
              </p>
            )}
          </div>
        </div>

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
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.email}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...getInputProps("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...getInputProps("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-rose-500 text-xs font-medium mt-1.5">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="age"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Age
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input
                type="number"
                placeholder="18+"
                min="18"
                max="100"
                {...getInputProps("age")}
              />
            </div>
            {formik.touched.age && formik.errors.age && (
              <p className="text-rose-500 text-xs font-medium mt-1.5">
                {formik.errors.age}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
            >
              Gender
            </label>
            <div className="relative">
              <select
                {...getInputProps("gender")}
                className={cn(
                  getInputProps("gender").className,
                  "appearance-none cursor-pointer pl-4"
                )}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending || isGooglePending || !formik.isValid}
            className="w-full bg-ember-500 hover:bg-ember-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                Create account
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

          {/* Google Button */}
          <div className="flex justify-center w-full ">
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
                    "Google Authentication failed entirely. Please try again."
                  );
                }}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text="signup_with"
                width="100%"
              />
            )}
          </div>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-ember-600 font-bold hover:text-ember-700 transition-colors"
        >
          Log in
        </Link>
      </p>
    </motion.div>
  );
}
