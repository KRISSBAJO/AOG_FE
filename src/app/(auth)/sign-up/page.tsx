"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import {
  Button,
  Checkbox,
  Divider,
  Input,
  PasswordInput,
} from "@/components/ui";
import {
  isEmail,
  mockRequest,
  passwordStrength,
  required,
} from "@/lib/validation";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const terms = data.get("terms") === "on";

    const next: Errors = {};
    if (!required(name)) next.name = "Enter your full name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (passwordStrength(password).score < 2)
      next.password = "Choose a stronger password (8+ chars, mixed case).";
    if (!terms) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await mockRequest();
    setLoading(false);
    router.push("/verify-email");
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="Start managing your facility operations in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-amber-600 hover:text-amber-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <SocialButtons />
        <Divider label="or sign up with email" />

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            name="name"
            label="Full name"
            placeholder="Jordan Rivera"
            autoComplete="name"
            error={errors.name}
          />
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
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <PasswordStrengthMeter value={password} />
          </div>

          <div>
            <Checkbox
              name="terms"
              label={
                <span>
                  I agree to the{" "}
                  <Link href="#" className="font-medium text-amber-600 hover:text-amber-700">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="font-medium text-amber-600 hover:text-amber-700">
                    Privacy Policy
                  </Link>
                </span>
              }
            />
            {errors.terms && (
              <p className="mt-1.5 text-xs text-red-500">{errors.terms}</p>
            )}
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
