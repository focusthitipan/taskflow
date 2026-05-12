import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) return null;
          if (user.status !== "active") return null;

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            avatarUrl: user.avatarUrl,
            avatarColor: user.avatarColor,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl;
        token.avatarColor = (user as { avatarColor?: string | null }).avatarColor;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { avatarUrl?: string | null }).avatarUrl = token.avatarUrl as string | null;
        (session.user as { avatarColor?: string | null }).avatarColor = token.avatarColor as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "taskflow-dev-secret-key-2024",
};

// ── Auth helpers for API routes ──

interface AuthResult {
  userId: string;
  role: string;
}

/** Require authenticated user — returns 401 if no session */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role || "member";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId, role };
}

/** Require admin role — returns 401 if no session, 403 if not admin */
export async function requireAdmin(): Promise<AuthResult | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}
