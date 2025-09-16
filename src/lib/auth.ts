import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Authorization attempt for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          console.log("🔍 Searching user in database...");

          const user = await prisma.users.findUnique({
            where: { email: credentials.email },
            include: { divisi: true },
          });

          console.log("👤 User found:", !!user, user?.id_user);

          if (!user) {
            console.log("❌ User not found in database");
            return null;
          }

          console.log("🔒 Verifying password...");
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("✅ Password valid:", isValidPassword);

          if (!isValidPassword) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("📊 User status:", user.status);
          if (user.status !== "ACTIVE") {
            console.log("❌ User not active");
            return null;
          }

          const authUser = {
            id: user.id_user.toString(),
            email: user.email,
            name: user.nama,
            role: user.role,
            divisiId: user.divisi_id,
            divisi: user.divisi?.nama_divisi || "Unknown",
          };

          console.log("✅ User authenticated successfully:", authUser);
          return authUser as any;
        } catch (error) {
          console.error("❌ Database/Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // ✅ 30 days
    updateAge: 24 * 60 * 60, // ✅ Update every 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // ✅ 30 days
  },

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log("🔑 JWT Callback triggered:", {
        hasUser: !!user,
        hasSub: !!token.sub,
        trigger: trigger || "default",
      });

      if (user) {
        console.log("👤 Setting JWT token for user:", user.id);
        token.sub = user.id;
        token.role = (user as any).role;
        token.divisiId = (user as any).divisiId;
        token.divisi = (user as any).divisi;
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      }

      console.log("🔑 JWT token created/updated:", {
        sub: token.sub,
        role: token.role,
        exp: new Date((token.exp as number) * 1000).toISOString(),
      });

      return token;
    },

    async session({ session, token }) {
      console.log("📱 Session Callback triggered:", {
        hasToken: !!token,
        hasSession: !!session,
        tokenSub: token?.sub,
      });

      if (token && session.user) {
        session.user.id = token.sub!;
        (session.user as any).role = token.role;
        (session.user as any).divisiId = token.divisiId;
        (session.user as any).divisi = token.divisi;

        console.log("✅ Session created for user:", {
          id: session.user.id,
          email: session.user.email,
          role: (session.user as any).role,
        });
      } else {
        console.log("❌ Session callback - missing token or session.user");
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // ✅ Set to false for localhost
        domain: undefined, // ✅ Let browser handle domain
        maxAge: 30 * 24 * 60 * 60, // ✅ 30 days
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // ✅ Enable full debug logging
};
