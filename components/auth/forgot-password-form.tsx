"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { forgotPasswordSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const errors = form.formState.errors;

  async function onSubmit(values: ForgotPasswordValues) {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      toast.error(payload.message ?? "Unable to send reset email");
      return;
    }

    setMessage("If the email exists in Campus Club Hub, a reset link has been sent.");
    toast.success("Reset instructions sent.");
    form.reset();
  }
  const onError = (formErrors: typeof errors) => {
    console.error("Forgot password validation errors:", formErrors);
    const errorList = Object.entries(formErrors);
    if (errorList.length > 0) {
      const [field, errorObj] = errorList[0];
      toast.error(`${errorObj?.message ?? "Invalid value"} (${field})`);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit, onError)}>
      <div className="grid gap-2">
        <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          className="h-11 rounded-2xl border-black/10 bg-white"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
        {errors.email && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" className="h-11 w-full rounded-full px-5">
        Send reset link
      </Button>

      {message ? <p className="text-sm leading-6 text-black/60">{message}</p> : null}
    </form>
  );
}
