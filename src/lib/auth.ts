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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
          include: { divisi: true },
        });
        if (!user) return null;
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) return null;
        if (user.status !== "ACTIVE") return null;
        return {
          id: user.id_user.toString(),
          email: user.email,
          name: user.nama,
          role: user.role,
          divisiId: user.divisi_id,
          divisi: user.divisi?.nama_divisi || "Unknown",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 0,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.role = user.role;
        token.divisiId = user.divisiId;
        token.divisi = user.divisi;
        token.email = user.email;
        token.image = user.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub ?? "",
        name: token.name ?? "",
        role: token.role ?? "",
        divisiId:
          typeof token.divisiId === "number"
            ? token.divisiId
            : typeof token.divisiId === "string" &&
              !isNaN(Number(token.divisiId))
            ? Number(token.divisiId)
            : 0,
        divisi: typeof token.divisi === "string" ? token.divisi : "",
        email: token.email ?? "",
        image: typeof token.image === "string" ? token.image : null,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};
