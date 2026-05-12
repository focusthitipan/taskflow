"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useT } from "@/components/layout/i18n-provider";
import type { User } from "@/types";
import { toast } from "sonner";

const AVATAR_COLORS = [
  "#422AFB", "#01B574", "#FFB547", "#EE5D50", "#3965FF",
  "#7551FF", "#3311DB", "#1b3bbb",
];

interface UserModalProps {
  readonly mode: "add" | "edit";
  readonly user?: User;
  readonly onClose: () => void;
  readonly onSaved: (user: User) => void;
}

export function UserModal({ mode, user, onClose, onSaved }: UserModalProps) {
  const { t } = useT();

  const schema = z.object({
    firstName: z.string().min(1, t.users.firstNameRequired),
    lastName: z.string().min(1, t.users.lastNameRequired),
    email: z.string().email(t.users.invalidEmail),
    role: z.enum(["admin", "member", "viewer"]),
    status: z.enum(["active", "inactive"]),
    password: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "member",
      status: "active",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      if (mode === "add") {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, avatarColor: randomColor }),
        });
        const result = await res.json();
        onSaved(result.user);
        toast.success(t.users.userCreated);
      } else if (user) {
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        onSaved(result.user);
        toast.success(t.users.userUpdated);
      }
      onClose();
    } catch {
      toast.error(mode === "add" ? t.users.failedCreateUser : t.users.failedUpdateUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default border-0 p-0"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-md card-shadow overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondaryGray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-secondaryGray-900 dark:text-white">
            {mode === "add" ? t.users.addNewUser : t.users.editUser}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.users.firstName} *
              </label>
              <input
                {...register("firstName")}
                placeholder="John"
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1 ms-[10px]">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.users.lastName} *
              </label>
              <input
                {...register("lastName")}
                placeholder="Doe"
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1 ms-[10px]">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.users.email} *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1 ms-[10px]">{errors.email.message}</p>
            )}
          </div>

          {mode === "add" && (
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.users.password}
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder={t.users.tempPassword}
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.users.role}
              </label>
              <select
                {...register("role")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="admin">{t.team.admin}</option>
                <option value="member">{t.team.member}</option>
                <option value="viewer">{t.team.viewer}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.users.status}
              </label>
              <select
                {...register("status")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="active">{t.users.active}</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] rounded-full border border-secondaryGray-100 dark:border-white/10 text-sm font-bold text-secondaryGray-900 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-[44px] rounded-full text-sm font-bold text-white gradient-brand disabled:opacity-60"
            >
              {(() => {
                if (isSubmitting) return t.users.saving;
                return mode === "add" ? t.users.addUser : t.users.saveChanges;
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
