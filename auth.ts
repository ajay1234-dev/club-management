import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { ROLE_LABELS } from "@/lib/constants/roles";
import { getRoleById } from "@/lib/repositories/roles-repository";
import { loginSchema } from "@/lib/validators/auth";
import { getUserByEmail, touchUserLogin } from "@/lib/repositories/users-repository";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await getUserByEmail(parsed.data.email.toLowerCase());

        if (!user) {
          return null;
        }

        const role = await getRoleById(user.roleId);

        if (!role || role.slug !== parsed.data.role) {
          return null;
        }

        const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!passwordMatches) {
          return null;
        }

        await touchUserLogin(user.id);

        return {
          id: user.id,
          name: user.displayName,
          email: user.email,
          role: role.slug,
          roleLabel: ROLE_LABELS[role.slug as keyof typeof ROLE_LABELS],
          clubId: user.clubId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleLabel = user.roleLabel;
        token.clubId = user.clubId ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "student";
        session.user.roleLabel = token.roleLabel ?? ROLE_LABELS.student;
        session.user.clubId = token.clubId ?? null;
      }

      return session;
    },
  },
});
