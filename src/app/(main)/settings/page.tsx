"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog, WorkspaceSettings } from "@/types";

type TabId = "profile" | "notifications" | "appearance" | "workspace" | "security";

const TABS: { id: TabId; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "workspace", label: "Workspace", icon: Building, adminOnly: true },
  { id: "security", label: "Security", icon: Shield, adminOnly: true },
];

const ACCENT_COLORS = [
  { value: "#422AFB", label: "Brand Violet" },
  { value: "#01B574", label: "Mint Green" },
  { value: "#FFB547", label: "Amber" },
  { value: "#EE5D50", label: "Coral" },
  { value: "#3965FF", label: "Royal Blue" },
  { value: "#7551FF", label: "Purple" },
];

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  avatarColor?: string;
  timezone?: string;
  language?: string;
}

function ProfileTab() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        toast.success("Profile updated successfully");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
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
        toast.success("Password changed successfully");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return <p className="text-sm text-secondaryGray-600">Could not load profile.</p>;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-navy-800 card-shadow"
          style={{ backgroundColor: profile.avatarColor || "#422AFB" }}
        >
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>
        <div>
          <p className="text-lg font-bold text-secondaryGray-900 dark:text-white">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-secondaryGray-600 font-normal">{profile.email}</p>
          <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-500">
            {profile.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            First Name
          </label>
          <input
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            Last Name
          </label>
          <input
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
            Email
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
            Timezone
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
            Language
          </label>
          <select
            value={profile.language || "en"}
            onChange={(e) => setProfile({ ...profile, language: e.target.value })}
            className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="th">Thai</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 h-[44px] px-6 rounded-full text-sm font-bold text-white gradient-brand disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {/* Change Password */}
      <div className="pt-6 border-t border-secondaryGray-100 dark:border-white/10">
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              Current Password
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
              New Password
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
              Confirm New Password
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
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
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
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggles = [
    { key: "taskAssigned" as const, label: "Task Assigned", desc: "When a task is assigned to you" },
    { key: "taskDue" as const, label: "Task Due Reminder", desc: "24 hours before task due date" },
    { key: "commentMention" as const, label: "Comment Mentions", desc: "When someone mentions you" },
    { key: "teamActivity" as const, label: "Team Activity", desc: "Weekly team digest email" },
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
        Manage how and when you receive notifications.
      </p>
      {toggles.map((t) => (
        <div
          key={t.key}
          className="flex items-center justify-between p-4 rounded-[20px] bg-secondaryGray-300 dark:bg-navy-700"
        >
          <div>
            <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">{t.label}</p>
            <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">{t.desc}</p>
          </div>
          <button
            onClick={() => handleToggle(t.key)}
            disabled={saving}
            className={cn(
              "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center",
              settings[t.key] ? "bg-brand-500" : "bg-secondaryGray-600"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white transition-transform duration-200",
                settings[t.key] ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = useState("#422AFB");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const themes = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
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
          Color Mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-[20px] border-2 transition-all duration-150",
                  theme === t.id
                    ? "border-brand-500 bg-brand-100 dark:bg-brand-900/20"
                    : "border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    theme === t.id ? "text-brand-500" : "text-secondaryGray-600"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    theme === t.id
                      ? "text-brand-500 font-bold"
                      : "text-secondaryGray-600"
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white mb-3">
          Accent Color
        </h3>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setAccent(c.value)}
              title={c.label}
              className={cn(
                "w-10 h-10 rounded-full border-4 transition-all duration-150",
                accent === c.value ? "border-secondaryGray-900 dark:border-white scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        <p className="text-xs text-secondaryGray-600 font-normal mt-2">
          Selected: {ACCENT_COLORS.find((c) => c.value === accent)?.label}
        </p>
      </div>
    </div>
  );
}

function WorkspaceTab() {
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
      toast.success("Workspace settings saved");
    } catch {
      toast.error("Failed to save workspace settings");
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

  if (!form) return <p className="text-sm text-secondaryGray-600">Could not load workspace.</p>;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
          Workspace Name
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
          Default Priority
        </label>
        <select
          value={form.defaultPriority}
          onChange={(e) =>
            setForm({ ...form, defaultPriority: e.target.value as typeof form.defaultPriority })
          }
          className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
        >
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-3">
          Working Days
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
            Business Hours Start
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
            Business Hours End
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
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function SecurityTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/audit-log")
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white">Audit Log</h3>
        <button className="text-xs text-brand-500 font-medium hover:opacity-80 transition-opacity">
          Export CSV
        </button>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-sm text-secondaryGray-600 text-center py-10">
            No audit logs found.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondaryGray-100 dark:border-white/10">
                <th className="text-left px-5 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  User
                </th>
                <th className="text-left px-4 py-4 text-xs font-normal text-secondaryGray-600 uppercase hidden md:table-cell">
                  Action
                </th>
                <th className="text-left px-4 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  Target
                </th>
                <th className="text-right px-5 py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  When
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
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: log.user?.avatarColor || "#422AFB" }}
                      >
                        {log.user?.firstName?.[0]}
                        {log.user?.lastName?.[0]}
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
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

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
      <div className="bg-white dark:bg-navy-800 rounded-[20px] p-3 card-shadow h-fit">
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
      <div className="bg-white dark:bg-navy-800 rounded-[20px] p-6 card-shadow">
        <h2 className="text-2xl font-bold text-secondaryGray-900 dark:text-white mb-6">
          {visibleTabs.find((t) => t.id === activeTab)?.label}
        </h2>
        {renderTab()}
      </div>
    </div>
  );
}
