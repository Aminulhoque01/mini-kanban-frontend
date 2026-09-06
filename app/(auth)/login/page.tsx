"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { useLoginMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [message, setMessage] = useState<LoginMessage>(null);

  // Password show/hide state
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setMessage(null);

    try {
      const response = await login(data).unwrap();

      const { user, token } = response.data;

      // Save token
      localStorage.setItem("token", token);

      // Save user + token in Redux
      dispatch(
        setCredentials({
          user,
          token,
        })
      );

      toast.success("Successfully logged in");

      // Redirect to dashboard
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
    } catch (error: any) {
      console.error("Login failed:", error);

      setMessage({
        type: "error",
        text:
          error?.data?.message ||
          error?.error ||
          "Invalid email or password. Please try again.",
      });

      toast.error(
        error?.data?.message ||
          error?.error ||
          "Invalid email or password."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to your Mini Kanban account
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>

            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>

            {/* Password input + eye button */}
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-white"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Create account
          </button>
        </p>
      </div>
    </main>
  );
}