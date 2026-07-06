"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, Button, PasswordInput } from "@/components/ui";
import { mockRequest, passwordStrength } from "@/lib/validation";

type Errors = { password?: string; confirm?: string };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (passwordStrength(password).score < 2)
      next.password = "Choose a stronger password (8+ chars, mixed case).";
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await mockRequest();
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/sign-in"), 1600);
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Your new password must be different from previous ones."
      footer={
        <Link
          href="/sign-in"
          className="font-semibold text-amber-600 hover:text-amber-700"
        >
          ← Back to sign in
        </Link>
      }
    >
      {done ? (
        <Alert tone="success">
          Password updated. Redirecting you to sign in…
        </Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <PasswordInput
              name="password"
              label="New password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <PasswordStrengthMeter value={password} />
          </div>
          <PasswordInput
            name="confirm"
            label="Confirm password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />
          <Button type="submit" fullWidth loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
