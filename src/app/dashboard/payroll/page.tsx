"use client";

import { useEffect, useState } from "react";
import { Banknote, Clock3, RefreshCw, Users } from "lucide-react";

import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { payrollApi, type PayrollSummary } from "@/lib/api/staff";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function dateInput(value?: string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function periodLabel(summary: PayrollSummary | null) {
  if (!summary) return "Current two-day pay period";
  const from = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(summary.period.from));
  const to = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(summary.period.to));
  return `${from} - ${to}`;
}

export default function PayrollPage() {
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData(nextFrom = from, nextTo = to) {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollApi.summary({ from: nextFrom, to: nextTo });
      setSummary(response);
      setFrom((current) => current || dateInput(response.period.from));
      setTo(
        (current) =>
          current ||
          dateInput(
            new Date(
              new Date(response.period.to).getTime() - 86400000,
            ).toISOString(),
          ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Payroll
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Two-day pay period hours from staff clock-in and clock-out records.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[160px_160px_auto]">
          <Input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            loading={loading}
            onClick={() => void loadData()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <Users className="h-5 w-5 text-sky-500" />
          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {summary?.totals.employees ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">Employees</p>
        </Card>
        <Card className="p-5">
          <Clock3 className="h-5 w-5 text-emerald-500" />
          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {summary?.totals.hours ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">Payroll hours</p>
        </Card>
        <Card className="p-5">
          <Banknote className="h-5 w-5 text-amber-500" />
          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {money(summary?.totals.grossPay)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Estimated gross pay</p>
        </Card>
        <Card className="p-5">
          <RefreshCw className="h-5 w-5 text-rose-500" />
          <p className="mt-4 text-2xl font-semibold text-slate-900">
            {summary?.totals.openRecords ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate-500">Open clock records</p>
        </Card>
      </div>

      <Card>
        <CardHeader title={periodLabel(summary)} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Records</th>
                <th className="px-5 py-3 font-medium">Hours</th>
                <th className="px-5 py-3 font-medium">Rate</th>
                <th className="px-5 py-3 font-medium">Gross pay</th>
                <th className="px-5 py-3 font-medium">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(summary?.employees ?? []).map((row) => (
                <tr key={row.employee.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">
                      {row.employee.firstName} {row.employee.lastName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {row.employee.employeeNumber}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {row.employee.department?.name ?? "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {row.records.length}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {row.hours}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {money(row.hourlyRate)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {money(row.grossPay)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {row.openRecords}
                  </td>
                </tr>
              ))}
              {!loading && !summary?.employees.length && (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-slate-500"
                    colSpan={7}
                  >
                    No payroll attendance records for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
