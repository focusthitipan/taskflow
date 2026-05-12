"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import type { User } from "@/types";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  user: User;
  onClose: () => void;
  onDeleted: (userId: string) => void;
}

export function DeleteUserDialog({ user, onClose, onDeleted }: DeleteUserDialogProps) {
  const { t } = useT();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      onDeleted(user.id);
      toast.success(t.users.userDeleted);
      onClose();
    } catch {
      toast.error(t.users.failedDeleteUser);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-sm card-shadow p-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-secondaryGray-900 dark:text-white mb-2">
          {t.users.deleteUserConfirm}
        </h2>
        <p className="text-sm text-secondaryGray-600 font-normal leading-[150%] mb-6">
          {t.users.deleteUserWarning}{" "}
          <span className="font-bold text-secondaryGray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </span>
          ? {t.users.cannotUndone}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] rounded-full border border-secondaryGray-100 dark:border-white/10 text-sm font-bold text-secondaryGray-900 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 h-[44px] rounded-full text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-150 disabled:opacity-60"
          >
            {deleting ? t.users.deleting : t.users.deleteUserBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
