"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "@/lib/validators/auth";
import { ROLE_LABELS, ROLE_VALUES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LoginFormValues = {
  email: string;
  password: string;
  role: (typeof ROLE_VALUES)[number];
};

export function LoginForm({
  defaultRole = "student",
  defaultEmail = "",
}: {
  defaultRole?: LoginFormValues["role"];
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
      role: defaultRole,
    },
  });

  const selectedRole = form.watch("role") as keyof typeof ROLE_LABELS;
  const errors = form.formState.errors;

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const response = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (response?.error) {
        toast.error("Invalid credentials or role selection.");
        return;
      }

      toast.success("Welcome back.");
      router.replace(values.role === "super_admin" ? "/dashboard/admin" : "/dashboard");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }
  const onError = (formErrors: typeof errors) => {
    console.error("Login validation errors:", formErrors);
    const errorList = Object.entries(formErrors);
    if (errorList.length > 0) {
      const [field, errorObj] = errorList[0];
      toast.error(`${errorObj?.message ?? "Invalid value"} (${field})`);
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit, onError)}>
      <div className="grid gap-2">
        <Label htmlFor="role" className={errors.role ? "text-destructive" : ""}>
          Role
        </Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="role"
                className={cn(
                  "h-11 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                  errors.role
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : "border-black/10",
                )}
              >
                <SelectValue placeholder="Select role">
                  {ROLE_LABELS[field.value as keyof typeof ROLE_LABELS]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-black/10 bg-white p-1 shadow-lg">
                {ROLE_VALUES.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="rounded-xl px-3 py-2 text-sm hover:bg-black/5 cursor-pointer"
                  >
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.role.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="student@college.edu"
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

      <div className="grid gap-2">
        <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
          Password
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

      <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : `Sign in as ${ROLE_LABELS[selectedRole]}`}
      </Button>

      <Separator className="bg-black/10" />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
        <a href="/forgot-password" className="hover:text-black">
          Forgot password?
        </a>
        <a href="/signup" className="hover:text-black">
          Need an account?
        </a>
      </div>
    </form>
  );
}
