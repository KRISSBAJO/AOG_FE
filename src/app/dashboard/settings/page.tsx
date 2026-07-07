"use client";

import { FormEvent, useEffect, useState } from "react";
import { Play, RefreshCw, RotateCcw, Save, Settings } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { adminApi, AuditLog, BackgroundJob, SystemSetting } from "@/lib/api/admin";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const jobTypes = ["EMAIL_DELIVERY", "SMS_DELIVERY", "PUSH_DELIVERY", "INVOICE_GENERATION", "REPORT_EXPORT", "WEBHOOK_DELIVERY", "AUDIT_EXPORT"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingForm, setSettingForm] = useState({
    key: "operations.dashboard.refreshSeconds",
    value: "60",
    category: "operations",
    description: "Dashboard refresh interval in seconds",
  });
  const [jobForm, setJobForm] = useState({ type: "REPORT_EXPORT", payload: "{}" });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [settingsResponse, jobsResponse, auditResponse] = await Promise.all([
        adminApi.systemSettings({ take: 50 }),
        adminApi.backgroundJobs({ take: 50 }),
        adminApi.auditLogs({ take: 50 }),
      ]);
      setSettings(settingsResponse.data);
      setJobs(jobsResponse.data);
      setAuditLogs(auditResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.upsertSystemSetting(settingForm.key, {
        value: parseSettingValue(settingForm.value),
        category: settingForm.category || undefined,
        description: settingForm.description || undefined,
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.createBackgroundJob({
        type: jobForm.type,
        payload: parseSettingValue(jobForm.payload),
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function retryJob(id: string) {
    setSaving(true);
    try {
      await adminApi.retryBackgroundJob(id);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="System settings, background jobs, and audit trail."
        eyebrow="System"
        actions={
          <Button type="button" variant="outline" onClick={() => void loadData()} loading={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="System settings" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Key</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Value</th>
                    <th className="px-5 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{setting.key}</td>
                      <td className="px-5 py-3.5 text-slate-600">{setting.category || "general"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{JSON.stringify(setting.value)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{new Date(setting.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Background jobs" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Run at</th>
                    <th className="px-5 py-3 font-medium">Attempts</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Retry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{job.type.replaceAll("_", " ").toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-slate-600">{new Date(job.runAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-slate-600">{job.attempts}/{job.maxAttempts}</td>
                      <td className="px-5 py-3.5"><StatusPill status={job.status} /></td>
                      <td className="px-5 py-3.5">
                        <Button type="button" size="sm" variant="ghost" onClick={() => void retryJob(job.id)} disabled={saving}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Audit trail" />
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="px-5 py-3.5 text-sm">
                  <p className="font-medium text-slate-900">{log.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{log.actor?.email || "System"} - {log.entityType} - {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Save setting" action={<Settings className="h-4 w-4 text-slate-400" />} />
            <form className="space-y-4 p-5" onSubmit={saveSetting}>
              <Input label="Key" value={settingForm.key} onChange={(event) => setSettingForm((current) => ({ ...current, key: event.target.value }))} required />
              <Input label="Category" value={settingForm.category} onChange={(event) => setSettingForm((current) => ({ ...current, category: event.target.value }))} />
              <Textarea label="Value" value={settingForm.value} onChange={(event) => setSettingForm((current) => ({ ...current, value: event.target.value }))} required />
              <Textarea label="Description" value={settingForm.description} onChange={(event) => setSettingForm((current) => ({ ...current, description: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth><Save className="h-4 w-4" />Save setting</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Create job" />
            <form className="space-y-4 p-5" onSubmit={createJob}>
              <select className={selectClass} value={jobForm.type} onChange={(event) => setJobForm((current) => ({ ...current, type: event.target.value }))}>
                {jobTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <Textarea label="Payload JSON" value={jobForm.payload} onChange={(event) => setJobForm((current) => ({ ...current, payload: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth variant="secondary"><Play className="h-4 w-4" />Queue job</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function parseSettingValue(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
