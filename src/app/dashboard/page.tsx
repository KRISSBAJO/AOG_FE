"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, ClipboardList, FileText, RefreshCw, ShieldCheck, Wallet } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { DashboardOverview, DashboardRevenue, DashboardWorkOrders, dashboardApi } from "@/lib/api/dashboard";

function formatMoney(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [workOrders, setWorkOrders] = useState<DashboardWorkOrders | null>(null);
  const [revenue, setRevenue] = useState<DashboardRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [overviewResponse, workOrderResponse, revenueResponse] = await Promise.all([
        dashboardApi.overview(),
        dashboardApi.workOrders(),
        dashboardApi.revenue(),
      ]);
      setOverview(overviewResponse);
      setWorkOrders(workOrderResponse);
      setRevenue(revenueResponse);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    const kpis = overview?.kpis;
    return [
      { label: "Active customers", value: String(kpis?.customers ?? 0), delta: 0, icon: Building2 },
      { label: "Active work orders", value: String(kpis?.activeWorkOrders ?? 0), delta: 0, icon: ClipboardList },
      { label: "QA exceptions", value: String(kpis?.failedInspections ?? 0), delta: 0, icon: ShieldCheck },
      { label: "Revenue collected", value: formatMoney(kpis?.revenue), delta: 0, icon: Wallet },
    ];
  }, [overview]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Operations Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Live read models for work orders, revenue, QA, and risk.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadData()} loading={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => <StatCard key={stat.label} stat={stat} index={index} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Work-order health" action={<Link href="/dashboard/work-orders" className="text-sm font-medium text-amber-600">Open board</Link>} />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Status mix</p>
              <div className="mt-4 space-y-3">
                {(workOrders?.byStatus ?? []).map((item) => (
                  <div key={String(item.status)} className="flex items-center justify-between gap-3 text-sm">
                    <StatusPill status={String(item.status)} />
                    <span className="font-semibold text-slate-900">{item._count._all}</span>
                  </div>
                ))}
                {!workOrders?.byStatus?.length && <p className="text-sm text-slate-500">No work-order data yet.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Priority mix</p>
              <div className="mt-4 space-y-3">
                {(workOrders?.byPriority ?? []).map((item) => (
                  <div key={String(item.priority)} className="flex items-center justify-between gap-3 text-sm">
                    <span className="capitalize text-slate-600">{String(item.priority).replaceAll("_", " ").toLowerCase()}</span>
                    <span className="font-semibold text-slate-900">{item._count._all}</span>
                  </div>
                ))}
                {!workOrders?.byPriority?.length && <p className="text-sm text-slate-500">No priority data yet.</p>}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk queue" />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="flex items-center gap-2 text-sm text-slate-700"><AlertTriangle className="h-4 w-4 text-amber-500" />Open complaints</span>
              <strong className="text-slate-900">{overview?.kpis.openComplaints ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="flex items-center gap-2 text-sm text-slate-700"><AlertTriangle className="h-4 w-4 text-red-500" />Open incidents</span>
              <strong className="text-slate-900">{overview?.kpis.openIncidents ?? 0}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="flex items-center gap-2 text-sm text-slate-700"><FileText className="h-4 w-4 text-sky-500" />Overdue invoices</span>
              <strong className="text-slate-900">{overview?.kpis.overdueInvoices ?? 0}</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent work orders" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Work order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(overview?.recentWorkOrders ?? []).map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{workOrder.title}</p><p className="text-xs text-slate-400">{workOrder.workOrderNumber}</p></td>
                    <td className="px-5 py-3.5 text-slate-600">{workOrder.customer?.name || "Not set"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{workOrder.facility?.name || "Not set"}</td>
                    <td className="px-5 py-3.5"><StatusPill status={workOrder.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenue trend" />
          <div className="space-y-3 p-5">
            {(revenue?.monthly ?? []).slice(-6).map((item) => (
              <div key={item.month} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{item.month}</span>
                <span className="font-semibold text-slate-900">{formatMoney(item.amount)}</span>
              </div>
            ))}
            {!revenue?.monthly?.length && <p className="text-sm text-slate-500">No collected revenue yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
