"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Palette,
  Building,
  Shield,
  Save,
  Moon,
  Sun,
  Monitor,
  Camera,
  Trash2,
} from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import type { Locale } from "@/lib/i18n/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog, WorkspaceSettings } from "@/types";
import { useAccent, ACCENT_PALETTES } from "@/components/layout/accent-provider";
import { useProfile } from "@/components/layout/profile-context";

type TabId = "profile" | "notifications" | "appearance" | "workspace" | "security";

const AVATAR_COLORS = [
  "#422AFB", "#01B574", "#FFB547", "#EE5D50", "#3965FF",
  "#7551FF", "#3311DB", "#1b3bbb",
];

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatarColor?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
}

function ProfileTab() {
  const { t, locale, setLocale } = useT();
  const { data: session } = useSession();
  const { refreshProfile } = useProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        toast.success(t.settings.profileUpdated);
        await refreshProfile();
      }
    } catch {
      toast.error(t.settings.failedUpdateProfile);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.settings.fileTooLarge);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.avatarUrl) {
        setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
        toast.success(t.settings.avatarUpdated);
        await refreshProfile();
      } else {
        toast.error(data.error || t.settings.failedUploadAvatar);
      }
    } catch {
      toast.error(t.settings.failedUploadAvatar);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/settings/avatar", { method: "DELETE" });
      if (res.ok) {
        setProfile((prev) => prev ? { ...prev, avatarUrl: undefined } : prev);
        toast.success(t.settings.avatarRemoved);
        await refreshProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || t.settings.failedRemoveAvatar);
      }
    } catch {
      toast.error(t.settings.failedRemoveAvatar);
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t.settings.passwordsDoNotMatch);
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(t.settings.passwordMinLength);
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        toast.success(t.settings.passwordChanged);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || t.settings.failedChangePassword);
      }
    } catch {
      toast.error(t.settings.failedChangePassword);
    } finally {
      setChangingPassword(false);
    }
  };

  // Sync locale when language changes
  const handleLanguageChange = (lang: string) => {
    setProfile((prev) => prev ? { ...prev, language: lang } : prev);
    if (lang === "en" || lang === "th") {
      setLocale(lang as Locale);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return <p className="text-sm text-secondaryGray-600">{t.settings.couldNotLoadProfile}</p>;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          {profile.avatarUrl ? (
            <div
              className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-navy-800 card-shadow"
            >
              <img
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-navy-800 card-shadow"
              style={{ backgroundColor: profile.avatarColor || "#EE5D50" }}
            >
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          {uploading && (
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-lg font-bold text-secondaryGray-900 dark:text-white">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-secondaryGray-600 font-normal">{profile.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-500">
              {profile.role}
            </span>
            {profile.avatarUrl && (
              <button
                onClick={handleAvatarRemove}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors duration-150"
              >
                <Trash2 className="w-3 h-3" />
                {t.settings.removeAvatar}
              </button>
            )}
          </div>
          <p className="text-[11px] text-secondaryGray-600 font-normal mt-2">
            {t.settings.avatarHint}
          </p>
        </div>
      </div>

      {/* Avatar Color */}
      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-3">
          Avatar Color
        </label>
        <div className="flex flex-wrap gap-3">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setProfile({ ...profile, avatarColor: color })}
              className={cn(
                "w-9 h-9 rounded-full border-4 transition-all duration-150",
                (profile.avatarColor || "#EE5D50") === color
                  ? "border-secondaryGray-900 dark:border-white scale-110"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.firstName}
          </label>
          <input
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.lastName}
          </label>
          <input
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.email}
          </label>
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            type="email"
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.timezone}
          </label>
          <select
            value={profile.timezone || "UTC+7"}
            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
            className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          >
            {["UTC-8", "UTC-5", "UTC+0", "UTC+1", "UTC+5:30", "UTC+7", "UTC+8", "UTC+9"].map(
              (tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              )
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.language}
          </label>
          <select
            value={profile.language || locale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          >
            <option value="en">{t.settings.english}</option>
            <option value="th">{t.settings.thai}</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 h-[44px] px-6 rounded-full text-sm font-bold text-white gradient-brand disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {saving ? t.common.saving : t.settings.saveChanges}
      </button>

      {/* Change Password */}
      <div className="pt-6 border-t border-secondaryGray-100 dark:border-white/10">
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white mb-4">
          {t.settings.changePassword}
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.settings.currentPassword}
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.settings.newPassword}
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.settings.confirmNewPassword}
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="flex items-center gap-2 h-[44px] px-6 rounded-full text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors duration-150 disabled:opacity-60"
          >
            {changingPassword ? t.settings.changing : t.settings.changePasswordBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { t } = useT();
  const [settings, setSettings] = useState({
    taskAssigned: true,
    taskDue: true,
    commentMention: true,
    teamActivity: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.preferences) setSettings(d.preferences);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try {
      await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {
      toast.error(t.settings.failedSavePreferences);
    } finally {
      setSaving(false);
    }
  };

  const toggles = [
    { key: "taskAssigned" as const, label: t.settings.taskAssigned, desc: t.settings.taskAssignedDesc },
    { key: "taskDue" as const, label: t.settings.taskDue, desc: t.settings.taskDueDesc },
    { key: "commentMention" as const, label: t.settings.commentMention, desc: t.settings.commentMentionDesc },
    { key: "teamActivity" as const, label: t.settings.teamActivity, desc: t.settings.teamActivityDesc },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondaryGray-600 font-normal">
        {t.settings.manageNotifications}
      </p>
      {toggles
        .filter((tg) => tg.key !== "taskDue" && tg.key !== "teamActivity")
        .map((tg) => (
        <div
          key={tg.key}
          className="flex items-center justify-between p-4 rounded-[20px] bg-secondaryGray-300 dark:bg-navy-700"
        >
          <div>
            <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">{tg.label}</p>
            <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">{tg.desc}</p>
          </div>
          <button
            onClick={() => handleToggle(tg.key)}
            disabled={saving}
            className={cn(
              "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
              settings[tg.key] ? "bg-brand-500" : "bg-secondaryGray-600"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                settings[tg.key] ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      ))}
      {/* Task Due — disabled / under development */}
      <div className="flex items-center justify-between p-4 rounded-[20px] bg-secondaryGray-300 dark:bg-navy-700 opacity-60">
        <div>
          <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">{t.settings.taskDue}</p>
          <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">{t.settings.underDevelopment}</p>
        </div>
        <div className="w-10 h-5 rounded-full p-0.5 flex items-center bg-secondaryGray-600 cursor-not-allowed">
          <div className="w-4 h-4 rounded-full bg-white/50 translate-x-0" />
        </div>
      </div>
      {/* Team Activity — disabled / under development */}
      <div className="flex items-center justify-between p-4 rounded-[20px] bg-secondaryGray-300 dark:bg-navy-700 opacity-60">
        <div>
          <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">{t.settings.teamActivity}</p>
          <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">{t.settings.underDevelopment}</p>
        </div>
        <div className="w-10 h-5 rounded-full p-0.5 flex items-center bg-secondaryGray-600 cursor-not-allowed">
          <div className="w-4 h-4 rounded-full bg-white/50 translate-x-0" />
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const { t } = useT();
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themes = [
    { id: "light", label: t.settings.light, icon: Sun },
    { id: "dark", label: t.settings.dark, icon: Moon },
    { id: "system", label: t.settings.system, icon: Monitor },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white mb-3">
          {t.settings.colorMode}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((th) => {
            const Icon = th.icon;
            return (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-[20px] border-2 transition-all duration-150",
                  theme === th.id
                    ? "border-brand-500 bg-brand-100 dark:bg-brand-900/20"
                    : "border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    theme === th.id ? "text-brand-500" : "text-secondaryGray-600"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    theme === th.id
                      ? "text-brand-500 font-bold"
                      : "text-secondaryGray-600"
                  )}
                >
                  {th.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white mb-3">
          {t.settings.accentColor}
        </h3>
        <div className="flex flex-wrap gap-3">
          {ACCENT_PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setAccent(p.id)}
              title={p.label}
              className={cn(
                "w-10 h-10 rounded-full border-4 transition-all duration-150",
                accent === p.id ? "border-secondaryGray-900 dark:border-white scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: p.hex }}
            />
          ))}
        </div>
        <p className="text-xs text-secondaryGray-600 font-normal mt-2">
          {t.settings.selected}: {ACCENT_PALETTES.find((p) => p.id === accent)?.label}
        </p>
      </div>
    </div>
  );
}

function WorkspaceTab() {
  const { t } = useT();
  const [form, setForm] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/workspace")
      .then((r) => r.json())
      .then((d) => {
        if (d.workspace) setForm(d.workspace);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    if (!form) return;
    setForm({
      ...form,
      workingDays: form.workingDays.includes(day)
        ? form.workingDays.filter((d) => d !== day)
        : [...form.workingDays, day],
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await fetch("/api/settings/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(t.settings.workspaceSaved);
    } catch {
      toast.error(t.settings.failedSaveWorkspace);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) return <p className="text-sm text-secondaryGray-600">{t.settings.couldNotLoadWorkspace}</p>;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
          {t.settings.workspaceName}
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
          {t.settings.defaultPriority}
        </label>
        <select
          value={form.defaultPriority}
          onChange={(e) =>
            setForm({ ...form, defaultPriority: e.target.value as typeof form.defaultPriority })
          }
          className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
        >
          <option value="urgent">{t.dashboard.urgent}</option>
          <option value="high">{t.dashboard.high}</option>
          <option value="medium">{t.dashboard.medium}</option>
          <option value="low">{t.dashboard.low}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-3">
          {t.settings.workingDays}
        </label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "px-3 py-2 rounded-[10px] text-xs font-medium transition-all duration-150",
                form.workingDays.includes(day)
                  ? "bg-brand-500 text-white font-bold"
                  : "bg-secondaryGray-300 dark:bg-navy-700 text-secondaryGray-600"
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.businessHoursStart}
          </label>
          <input
            type="time"
            value={form.businessHoursStart}
            onChange={(e) => setForm({ ...form, businessHoursStart: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            {t.settings.businessHoursEnd}
          </label>
          <input
            type="time"
            value={form.businessHoursEnd}
            onChange={(e) => setForm({ ...form, businessHoursEnd: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 h-[44px] px-6 rounded-full text-sm font-bold text-white gradient-brand disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {saving ? t.common.saving : t.settings.saveSettings}
      </button>
    </div>
  );
}

function SecurityTab() {
  const { t } = useT();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/audit-log?page=${p}&limit=15`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white">{t.settings.auditLog}</h3>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-sm text-secondaryGray-600 text-center py-10">
            {t.settings.noAuditLogs}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondaryGray-100 dark:border-white/10">
                <th className="text-left px-5 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  {t.users.user}
                </th>
                <th className="text-left px-4 py-4 text-xs font-normal text-secondaryGray-600 uppercase hidden md:table-cell">
                  Action
                </th>
                <th className="text-left px-4 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  Target
                </th>
                <th className="text-right px-5 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  {t.settings.when}
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-secondaryGray-100 dark:border-white/10 last:border-0"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden">
                        {log.user?.avatarUrl ? (
                          <img src={log.user.avatarUrl} alt={log.user.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: log.user?.avatarColor || "#EE5D50" }}
                          >
                            {log.user?.firstName?.[0]}
                            {log.user?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                        {log.user?.firstName} {log.user?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-secondaryGray-600 font-normal capitalize">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-secondaryGray-900 dark:text-white truncate max-w-[180px] block">
                      {log.targetTitle || log.targetType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs text-secondaryGray-600 font-normal">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150"
          >
            ‹
          </button>
          <span className="text-sm text-secondaryGray-600 font-normal">
            {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useT();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const TABS: { id: TabId; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
    { id: "profile", label: t.settings.profile, icon: User },
    { id: "notifications", label: t.settings.notifications, icon: Bell },
    { id: "appearance", label: t.settings.appearance, icon: Palette },
    { id: "workspace", label: t.settings.workspace, icon: Building, adminOnly: true },
    { id: "security", label: t.settings.security, icon: Shield, adminOnly: true },
  ];

  const visibleTabs = TABS.filter((tb) => !tb.adminOnly || isAdmin);

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "notifications": return <NotificationsTab />;
      case "appearance": return <AppearanceTab />;
      case "workspace": return <WorkspaceTab />;
      case "security": return <SecurityTab />;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-5">
      {/* Tab nav */}
      <div className="stagger stagger-1 bg-white dark:bg-navy-800 rounded-[20px] p-3 card-shadow h-fit xl:sticky xl:top-[140px]">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-[10px] text-sm transition-all duration-150 text-left relative",
                active
                  ? "text-secondaryGray-900 dark:text-white font-bold"
                  : "text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white font-normal"
              )}
            >
              <Icon className={cn("w-5 h-5", active ? "text-brand-500" : "text-secondaryGray-600")} />
              {tab.label}
              {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-9 rounded-[5px] bg-brand-500 dark:bg-brand-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="stagger stagger-2 bg-white dark:bg-navy-800 rounded-[20px] p-4 sm:p-6 card-shadow">
        <h2 className="text-xl sm:text-2xl font-bold text-secondaryGray-900 dark:text-white mb-6">
          {visibleTabs.find((tb) => tb.id === activeTab)?.label}
        </h2>
        {renderTab()}
      </div>
    </div>
  );
}
