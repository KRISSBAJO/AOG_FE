"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Alert, Button, Input, PasswordInput } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import {
  acceptInvite,
  getInvitation,
  saveAuthSession,
  type InvitationInfo,
} from "@/lib/auth";
import { passwordStrength } from "@/lib/validation";

type Errors = {
  password?: string;
  confirm?: string;
};

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(token));
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    let active = true;
    getInvitation(token)
      .then((response) => {
        if (!active) return;
        setInvitation(response);
        setDisplayName(response.displayName || "");
        setPhone(response.phone || "");
      })
      .catch((error) => {
        if (active) setFormError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!token) next.confirm = "Invite token is missing from the URL.";
    if (passwordStrength(password).score < 2) {
      next.password = "Choose a stronger password (8+ chars, mixed case).";
    }
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setFormError(null);
    try {
      const session = await acceptInvite({
        token,
        password,
        displayName,
        phone,
      });
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
      title="Accept your invite"
      subtitle={
        invitation?.workspace?.name
          ? `Set your password for ${invitation.workspace.name}.`
          : "Set your password for the AOG Services portal."
      }
      footer={
        <Link
          href="/sign-in"
          className="font-semibold text-amber-600 hover:text-amber-700"
        >
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <Alert>
          AOG portal access is invite-only. Ask an AOG administrator to send
          you an access link.
        </Alert>
      ) : checking ? (
        <Alert>Checking invitation...</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {formError && <Alert tone="error">{formError}</Alert>}
          {invitation && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {invitation.email}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {invitation.employee
                  ? `Staff access: ${invitation.employee.employeeNumber}`
                  : invitation.customerContact
                    ? `Client access: ${invitation.customerContact.customerName}`
                    : "Portal access"}
              </p>
            </div>
          )}
          <Input
            label="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
          <div>
            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Create a password"
              error={errors.password}
            />
            <PasswordStrengthMeter value={password} />
          </div>
          <PasswordInput
            label="Confirm password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter password"
            error={errors.confirm}
          />
          <Button type="submit" fullWidth loading={loading}>
            Accept invite
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
