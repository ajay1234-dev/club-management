"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { resetPasswordSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordValues = {
  token: string;
  password: string;
  confirmPassword: string;
};

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: ResetPasswordValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to reset password");
      }

      toast.success("Password updated. Sign in with the new password.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }
  const onError = (formErrors: typeof errors) => {
    console.error("Reset password validation errors:", formErrors);
    const errorList = Object.entries(formErrors);
    if (errorList.length > 0) {
      const [field, errorObj] = errorList[0];
      toast.error(`${errorObj?.message ?? "Invalid value"} (${field})`);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit, onError)}>
      <input type="hidden" {...form.register("token")} />

      <div className="grid gap-2">
        <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
          New password
        </Label>
        <Input
          id="password"
          type="password"
          className="h-11 rounded-2xl border-black/10 bg-white"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
        {errors.password && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label
          htmlFor="confirmPassword"
          className={errors.confirmPassword ? "text-destructive" : ""}
        >
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          className="h-11 rounded-2xl border-black/10 bg-white"
          aria-invalid={!!errors.confirmPassword}
          {...form.register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={isSubmitting}>
        {isSubmitting ? "Updating password..." : "Reset password"}
      </Button>
    </form>
  );
}
