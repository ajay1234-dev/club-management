import { NextResponse } from "next/server";

import { registerUser } from "@/lib/services/auth-service";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = signupSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid registration payload." },
        { status: 400 },
      );
    }

    const user = await registerUser({
      role: parsed.data.role,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      password: parsed.data.password,
      phone: parsed.data.phone,
      studentId: parsed.data.studentId,
      department: parsed.data.department,
      graduationYear: parsed.data.graduationYear,
      clubSlug: parsed.data.clubSlug,
      designation: parsed.data.designation,
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 },
    );
  }
}
