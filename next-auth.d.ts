import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/constants/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      roleLabel: string;
      clubId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    roleLabel: string;
    clubId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    roleLabel?: string;
    clubId?: string | null;
  }
}
