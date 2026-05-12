"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface ProfileContextValue {
  avatarUrl: string | null;
  avatarColor: string | null;
  displayName: string;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue>({
  avatarUrl: null,
  avatarColor: null,
  displayName: "",
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/profile");
      const data = await res.json();
      if (data.profile) {
        setAvatarUrl(data.profile.avatarUrl ?? null);
        setAvatarColor(data.profile.avatarColor ?? null);
        setDisplayName(`${data.profile.firstName} ${data.profile.lastName}`.trim());
      }
    } catch {
      // fallback to session data silently
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      refreshProfile();
    }
  }, [session?.user, refreshProfile]);

  return (
    <ProfileContext.Provider value={{ avatarUrl, avatarColor, displayName, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
