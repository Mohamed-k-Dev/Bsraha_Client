import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import Joi from "joi";
import { isAxiosError } from "axios";

import { Spinner } from "@/components/ui";
import { forgotPasswordApi, ForgotPasswordData } from "@/api/auth.api";
import { cn } from "@/utils";

const forgotSchema = Joi.object({
  email: Joi.string()
    .required()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .messages({
      "string.pattern.base": "Please enter a valid email address",
      "string.empty": "Email is required",
    }),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPasswordApi(data),
    onSuccess: (_, variables) => {
      // Pass email along via route state to the reset-password page
      navigate("/reset-password", { state: { email: variables.email } });
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.message || "Failed to send reset code."
        : err?.message;
      setApiError(msg);
    },
  });

  const formik = useFormik<ForgotPasswordData>({
    initialValues: { email: "" },
    validate: (values) => {
      const { error } = forgotSchema.validate(values);
      if (!error) return {};
      return { email: error.details[0].message };
    },
    onSubmit: (values) => {
      setApiError(null);
      mutate(values);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <h1 className="font-display text-3xl font-semibold text-ink-900 mb-2">
        Reset password
      </h1>
      <p className="text-ink-500 mb-8">
        Enter your email address and we'll send you a recovery code.
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
            htmlFor="email"
            className="block text-xs font-bold text-ink-700 mb-1.5 uppercase tracking-wider"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="email"
              className={cn(
                "w-full bg-paper-50 border rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors",
                formik.touched.email && formik.errors.email
                  ? "border-rose-500 bg-rose-50/30"
                  : "border-ink-200 focus:border-ember-500"
              )}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">
              {formik.errors.email}
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
              Send recovery code
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-500">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="text-ember-600 font-bold hover:text-ember-700 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> Log in
        </Link>
      </p>
    </motion.div>
  );
}
