"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { email: "admin@taskflow.io", password: "admin123", role: "Admin", color: "#422AFB" },
  { email: "sarah@taskflow.io", password: "member123", role: "Member", color: "#01B574" },
];

export default function LoginPage() {
  const { t } = useT();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t.login.validEmail),
    password: z.string().min(1, t.login.passwordRequired),
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t.login.invalidCredentials);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error(t.login.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-navy-900 flex items-center justify-center p-5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 gradient-brand" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 gradient-brand" />
      </div>

      <div className="w-full max-w-[440px] relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center gradient-brand">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-secondaryGray-900 dark:text-white leading-none">
              TaskFlow
            </p>
            <p className="text-sm text-secondaryGray-600 font-normal">Team Task Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-navy-800 rounded-[30px] p-5 sm:p-8 card-shadow">
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-secondaryGray-900 dark:text-white leading-none mb-2">
              {t.login.welcomeBack}
            </h1>
            <p className="text-sm text-secondaryGray-600 font-normal">
              {t.login.signInContinue}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.login.emailAddress}
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal text-sm font-medium transition-all duration-250 ease"
              />
              {errors.email && (
                <p className="flex items-center gap-1 mt-1 ms-[10px] text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.login.password}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder={t.login.enterPassword}
                  className="w-full h-[44px] px-4 pr-12 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal text-sm font-medium transition-all duration-250 ease"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 mt-1 ms-[10px] text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[44px] rounded-full text-white font-bold text-sm transition-all duration-250 ease flex items-center justify-center gap-2 mt-2 disabled:opacity-60 gradient-brand"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t.login.signIn}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-secondaryGray-100 dark:border-white/10">
            <p className="text-xs text-secondaryGray-600 text-center mb-3 font-normal">
              {t.login.demoAccounts}
            </p>
            <div className="grid grid-cols-1 2sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="flex items-center gap-2 p-3 rounded-[10px] bg-brand-50 dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150 text-left"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.role[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondaryGray-900 dark:text-white">
                      {acc.role}
                    </p>
                    <p className="text-[10px] text-secondaryGray-600 font-normal truncate">
                      {acc.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
