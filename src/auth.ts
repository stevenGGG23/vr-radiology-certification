import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@/lib/types";

/*
  "Sign in with Google" through Auth.js. Sessions are stateless: the signed-in
  user lives in an encrypted, httpOnly cookie for 30 days, so no database is
  needed yet. When the real backend lands, add a database adapter (or move to
  Supabase Auth) and keep the same Google client credentials.

  Required environment variables (see README):
    AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
  Optional:
    ADMIN_EMAILS  comma-separated Google emails that open the Studio
*/

declare module "next-auth" {
  interface Session {
    user: { role?: Role } & DefaultSession["user"];
  }
}

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth } = NextAuth({
  providers: [Google({ authorization: { params: { prompt: "select_account" } } })],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ account, profile }) {
      // Only accept Google accounts whose email address Google has verified.
      return account?.provider !== "google" || profile?.email_verified === true;
    },
    jwt({ token, profile }) {
      if (profile) {
        const email = (token.email ?? "").toLowerCase();
        token.role = adminEmails.includes(email) ? "admin" : "student";
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role === "admin" ? "admin" : "student";
      return session;
    },
  },
});
