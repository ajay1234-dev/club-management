import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/services/auth-service";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = resetPasswordSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid reset payload." },
        { status: 400 },
      );
    }

    await resetPassword(parsed.data.token, parsed.data.password);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 400 },
    );
  }
}
