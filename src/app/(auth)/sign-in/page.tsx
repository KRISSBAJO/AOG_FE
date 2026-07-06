"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialButtons } from "@/components/auth/SocialButtons";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Input,
  PasswordInput,
} from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { saveAuthSession, signIn } from "@/lib/auth";
import { isEmail, required } from "@/lib/validation";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    const next: typeof errors = {};
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!required(password)) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const session = await signIn(email, password);
      saveAuthSession(session);
      router.push("/dashboard");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your AOG Services workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-amber-600 hover:text-amber-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <SocialButtons />
        <Divider label="or continue with email" />

        {formError && <Alert tone="error">{formError}</Alert>}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            name="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email}
          />
          <div>
            <PasswordInput
              name="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
            />
            <div className="mt-2 flex items-center justify-between">
              <Checkbox name="remember" label="Remember me" />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
