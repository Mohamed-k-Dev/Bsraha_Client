import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, KeyRound, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Joi from "joi";
import { isAxiosError } from "axios";

import { Spinner } from "@/components/ui";
import { resetPasswordApi, ResetPasswordData } from "@/api/auth.api";
import { cn } from "@/utils";

// Frontend Joi Schema mirroring your backend resetPasswordSchema exactly
const resetSchema = Joi.object({
  otp: Joi.string()
    .required()
    .regex(/^[0-9]{6}$/)
    .messages({
      "string.pattern.base": "OTP must be a 6-digit number",
      "string.empty": "OTP is required",
    }),
  password: Joi.string()
    .required()
    .min(8)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 100 characters long",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Password and confirm password must match",
    "string.empty": "Confirm password is required",
  }),
});

interface ResetFormValues {
  otp: string;
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate("/forgot-password", { replace: true });
  }

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Omit<ResetPasswordData, "email">) =>
      resetPasswordApi({
        email,
        otp: data.otp,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: () => {
      navigate("/login", {
        state: { message: "Password reset successfully! Please log in." },
      });
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || "Failed to reset password."
        : err?.message;
      setApiError(msg);
    },
  });

  const formik = useFormik<ResetFormValues>({
    initialValues: { otp: "", password: "", confirmPassword: "" },
    validate: (values) => {
      const { error } = resetSchema.validate(values, { abortEarly: false });
      if (!error) return {};
      const errors: Record<string, string> = {};
      error.details.forEach((d) => {
        if (!errors[d.path[0]]) errors[d.path[0]] = d.message;
      });
      return errors;
    },
    onSubmit: (values) => {
      setApiError(null);
      mutate(values);
    },
  });

  const getInputProps = (name: keyof ResetFormValues) => ({
    id: name,
    name,
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    value: formik.values[name],
    className: cn(
      "w-full bg-paper-50 border rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors",
      formik.touched[name] && formik.errors[name]
        ? "border-rose-500 bg-rose-50/30"
        : "border-ink-200 focus:border-ember-500"
    ),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto pb-12"
    >
      <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">
        Set new password
      </h1>
      <p className="text-ink-500 mb-8">
        Enter the 6-digit code sent to{" "}
        <span className="font-bold text-ink-900">{email}</span> and your new
        password.
      </p>

      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium mb-5">
              {apiError}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="otp"
            className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
          >
            Verification Code (OTP)
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              {...getInputProps("otp")}
              className={cn(
                getInputProps("otp").className,
                "font-mono tracking-widest"
              )}
            />
          </div>
          {formik.touched.otp && formik.errors.otp && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.otp}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...getInputProps("password")}
              className={cn(getInputProps("password").className, "pr-10")}
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...getInputProps("confirmPassword")}
              className={cn(
                getInputProps("confirmPassword").className,
                "pr-10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || !formik.isValid}
          className="w-full bg-ember-500 hover:bg-ember-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              Reset password
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
