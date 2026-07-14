"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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
import { signupSchema } from "@/lib/validators/auth";
import { CLUB_SEED } from "@/lib/constants/clubs";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

type SignupFormValues = z.input<typeof signupSchema>;
type SignupFormOutput = z.output<typeof signupSchema>;

export function SignupForm({
  defaultRole = "student",
}: {
  defaultRole?: SignupFormValues["role"];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormValues, undefined, SignupFormOutput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: defaultRole,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
      department: "",
      graduationYear: undefined,
      clubSlug: "",
      designation: "",
      phone: "",
    },
  });

  const role = form.watch("role");
  const clubOptions = useMemo(() => CLUB_SEED, []);
  const errors = form.formState.errors;

  async function onSubmit(values: SignupFormOutput) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Registration failed");
      }

      toast.success("Account created successfully! Logging you in...");

      const loginResponse = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      if (loginResponse?.error) {
        toast.info("Registration complete. Please sign in manually.");
        router.push(`/login?role=${values.role}&email=${encodeURIComponent(values.email)}`);
      } else {
        toast.success("Welcome to Campus Club Hub!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }
  const onError = (formErrors: typeof errors) => {
    console.error("Form validation errors:", formErrors);
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
          Account type
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
                <SelectValue placeholder="Select account type">
                  {ROLE_LABELS[field.value as keyof typeof ROLE_LABELS]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-black/10 bg-white p-1 shadow-lg">
                {Object.entries(ROLE_LABELS)
                  .filter(([key]) => key !== "super_admin")
                  .map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="rounded-xl px-3 py-2 text-sm hover:bg-black/5 cursor-pointer"
                    >
                      {label}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>
            First name
          </Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            className="h-11 rounded-2xl border-black/10 bg-white"
            aria-invalid={!!errors.firstName}
            {...form.register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>
            Last name
          </Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            className="h-11 rounded-2xl border-black/10 bg-white"
            aria-invalid={!!errors.lastName}
            {...form.register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
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
      </div>

      {role === "student" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="studentId" className={errors.studentId ? "text-destructive" : ""}>
              Student ID
            </Label>
            <Input
              id="studentId"
              autoComplete="off"
              className="h-11 rounded-2xl border-black/10 bg-white"
              aria-invalid={!!errors.studentId}
              {...form.register("studentId")}
            />
            {errors.studentId && (
              <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.studentId.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department" className={errors.department ? "text-destructive" : ""}>
              Department
            </Label>
            <Input
              id="department"
              autoComplete="off"
              className="h-11 rounded-2xl border-black/10 bg-white"
              aria-invalid={!!errors.department}
              {...form.register("department")}
            />
            {errors.department && (
              <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.department.message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="clubSlug" className={errors.clubSlug ? "text-destructive" : ""}>
              Club
            </Label>
            <Controller
              control={form.control}
              name="clubSlug"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="clubSlug"
                    className={cn(
                      "h-11 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                      errors.clubSlug
                        ? "border-destructive focus-visible:ring-destructive/30"
                        : "border-black/10",
                    )}
                  >
                    <SelectValue placeholder="Select a club">
                      {clubOptions.find((c) => c.slug === field.value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-black/10 bg-white p-1 shadow-lg">
                    {clubOptions.map((club) => (
                      <SelectItem
                        key={club.slug}
                        value={club.slug}
                        className="rounded-xl px-3 py-2 text-sm hover:bg-black/5 cursor-pointer"
                      >
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.clubSlug && (
              <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.clubSlug.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="designation" className={errors.designation ? "text-destructive" : ""}>
              Designation
            </Label>
            <Input
              id="designation"
              className="h-11 rounded-2xl border-black/10 bg-white"
              placeholder="Coordinator / Secretary"
              aria-invalid={!!errors.designation}
              {...form.register("designation")}
            />
            {errors.designation && (
              <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {errors.designation.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>
          Phone number
        </Label>
        <Input
          id="phone"
          autoComplete="tel"
          className="h-11 rounded-2xl border-black/10 bg-white"
          aria-invalid={!!errors.phone}
          {...form.register("phone")}
        />
        {errors.phone && (
          <p className="text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.phone.message}
          </p>
        )}
      </div>

      <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : `Create ${ROLE_LABELS[role]}`}
      </Button>
    </form>
  );
}
