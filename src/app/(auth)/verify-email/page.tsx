"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { CodeInput } from "@/components/auth/CodeInput";
import { Alert, Button } from "@/components/ui";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);
    setLoading(false);
    router.push("/dashboard");
  }

  async function resend() {
    setResent(true);
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="We sent a 6-digit code to your inbox. Enter it below to continue."
      footer={
        <Link
          href="/sign-in"
          className="font-semibold text-amber-600 hover:text-amber-700"
        >
          ← Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <CodeInput value={code} onChange={setCode} />
        {error && <Alert tone="error">{error}</Alert>}
        {resent && <Alert tone="success">A fresh code is on its way.</Alert>}

        <Button type="submit" fullWidth loading={loading}>
          Verify & continue
        </Button>

        <p className="text-center text-sm text-slate-500">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={resend}
            className="font-semibold text-amber-600 hover:text-amber-700"
          >
            Resend code
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
