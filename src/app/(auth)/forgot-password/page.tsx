"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { Alert, Button, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { forgotPassword } from "@/lib/auth";
import { isEmail } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [resetToken, setResetToken] = useState<string | undefined>();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setResetToken(response.resetToken);
      setSent(true);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? `We sent a password reset link to ${email}.`
          : "Enter the email tied to your account and we'll send you a reset link."
      }
      footer={
        <Link
          href="/sign-in"
          className="font-semibold text-amber-600 hover:text-amber-700"
        >
          ← Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <Alert tone="success">
            If an account exists for that address, the link is on its way. It
            expires in 30 minutes.
          </Alert>
          {resetToken && (
            <Alert tone="info">
              Local dev reset link: /reset-password?token={resetToken}
            </Alert>
          )}
          <Button
            variant="outline"
            fullWidth
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            name="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
