import { NextResponse } from "next/server";

import { createPasswordResetLink } from "@/lib/services/auth-service";
import { forgotPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = forgotPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid email address." },
        { status: 400 },
      );
    }

    await createPasswordResetLink(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create reset link." },
      { status: 400 },
    );
  }
}
