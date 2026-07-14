export const ROLE_VALUES = ["student", "club_admin", "super_admin"] as const;

export type UserRole = (typeof ROLE_VALUES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  club_admin: "Club Admin",
  super_admin: "Super Admin",
};

export const PUBLIC_SIGNUP_ROLES: UserRole[] = ["student", "club_admin"];
export const PUBLIC_SIGNUP_ROLE_VALUES = ["student", "club_admin"] as const;
