"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  RefreshCw,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";

import { AreaChart, BarListChart, DonutChart, ScoreRing, type ChartDatum } from "@/components/dashboard/DashboardCharts";
import { OverviewMetricCard, type OverviewMetric } from "@/components/dashboard/OverviewMetricCard";
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

function countOf(item: { _count?: { _all?: number } }) {
  return Number(item._count?._all ?? 0);
}

function chartData(items: Array<Record<string, unknown>>, key: string, colors: string[]): ChartDatum[] {
  return items
    .map((item, index) => ({
      label: String(item[key] ?? "Unknown"),
      value: countOf(item),
      color: colors[index % colors.length],
    }))
    .filter((item) => item.value > 0);
}

const statusColors = ["#F59E0B", "#0EA5E9", "#10B981", "#8B5CF6", "#EF4444", "#64748B"];
const priorityColors = ["#EF4444", "#F59E0B", "#0EA5E9", "#10B981", "#64748B"];

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [workOrders, setWorkOrders] = useState<DashboardWorkOrders | null>(null);
  const [revenue, setRevenue] = useState<DashboardRevenue | null>(null);
  const [lastSynced, setLastSynced] = useState<string>("Not synced");
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
      setLastSynced(new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const kpis = overview?.kpis;
  const statusMix = useMemo(
    () => chartData((workOrders?.byStatus ?? []) as Array<Record<string, unknown>>, "status", statusColors),
    [workOrders],
  );
  const priorityMix = useMemo(
    () => chartData((workOrders?.byPriority ?? []) as Array<Record<string, unknown>>, "priority", priorityColors),
    [workOrders],
  );
  const revenueTrend = useMemo(
    () => (revenue?.monthly ?? []).slice(-6).map((item) => ({
      label: item.month,
      value: Number(item.amount ?? 0),
      color: "#F59E0B",
    })),
    [revenue],
  );
  const activeWorkOrderCount = kpis?.activeWorkOrders ?? 0;
  const riskTotal = (kpis?.openComplaints ?? 0) + (kpis?.openIncidents ?? 0) + (kpis?.overdueInvoices ?? 0) + (kpis?.failedInspections ?? 0);
  const healthScore = Math.max(42, Math.min(100, 100 - riskTotal * 8 - Math.max(0, activeWorkOrderCount - 8) * 2));
  const workOrderTotal = statusMix.reduce((sum, item) => sum + item.value, 0);

  const metrics: OverviewMetric[] = useMemo(() => [
    {
      label: "Active customers",
      value: String(kpis?.customers ?? 0),
      helper: `${kpis?.facilities ?? 0} facilities covered`,
      delta: 0,
      icon: Building2,
      tone: "sky",
      sparkline: [0, kpis?.facilities ?? 0, kpis?.customers ?? 0, (kpis?.customers ?? 0) + (kpis?.facilities ?? 0)],
    },
    {
      label: "Work in motion",
      value: String(kpis?.activeWorkOrders ?? 0),
      helper: `${workOrders?.upcoming?.length ?? 0} upcoming, ${workOrders?.overdue?.length ?? 0} overdue`,
      delta: 0,
      icon: Wrench,
      tone: "amber",
      sparkline: [0, workOrders?.upcoming?.length ?? 0, kpis?.activeWorkOrders ?? 0, workOrders?.overdue?.length ?? 0],
    },
    {
      label: "QA exceptions",
      value: String(kpis?.failedInspections ?? 0),
      helper: `${kpis?.openComplaints ?? 0} complaints in queue`,
      delta: 0,
      icon: ShieldCheck,
      tone: "emerald",
      sparkline: [0, kpis?.failedInspections ?? 0, kpis?.openComplaints ?? 0, riskTotal],
    },
    {
      label: "Revenue collected",
      value: formatMoney(kpis?.revenue),
      helper: `${revenue?.openInvoices?._count?._all ?? 0} open invoices`,
      delta: 0,
      icon: Wallet,
      tone: "violet",
      sparkline: revenueTrend.map((item) => item.value),
    },
  ], [kpis, revenue, revenueTrend, riskTotal, workOrders]);

  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
                Enterprise command center
              </p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Live read models
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Operations Overview
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Work orders, revenue, QA, risk, and field execution in one command view.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => void loadData()} loading={loading}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Link
                  href="/dashboard/reports"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-slate-950"
                >
                  <FileText className="h-4 w-4" />
                  Reports
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-center shadow-inner xl:w-[360px]">
            <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <p className="text-lg font-black text-slate-950">{workOrderTotal}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">Orders</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <p className="text-lg font-black text-slate-950">{riskTotal}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">Risks</p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <p className="text-lg font-black text-slate-950">{revenueTrend.length}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">Months</p>
            </div>
            <p className="col-span-3 px-2 pb-1 text-left text-[11px] font-medium text-slate-400">
              Last sync {lastSynced}
            </p>
          </div>
        </div>
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <OverviewMetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden rounded-2xl border-white shadow-lg shadow-slate-200/70">
          <CardHeader
            title="Work-order command"
            action={<Link href="/dashboard/work-orders" className="text-sm font-semibold text-amber-600">Open board</Link>}
          />
          <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <DonutChart
              data={statusMix}
              centerLabel="work orders"
              centerValue={String(workOrderTotal)}
            />
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Priority pressure</p>
                  <p className="mt-1 text-xs text-slate-500">Open work grouped by dispatch priority.</p>
                </div>
                <ClipboardList className="h-5 w-5 text-amber-500" />
              </div>
              <BarListChart data={priorityMix} />
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white shadow-lg shadow-slate-200/70">
          <CardHeader title="Risk control" />
          <div className="space-y-5 p-5">
            <ScoreRing value={healthScore} label="Readiness score" tone={healthScore > 80 ? "emerald" : healthScore > 60 ? "amber" : "rose"} />
            <div className="grid gap-3">
              {[
                { label: "Open complaints", value: kpis?.openComplaints ?? 0, icon: AlertTriangle, tone: "text-amber-500" },
                { label: "Open incidents", value: kpis?.openIncidents ?? 0, icon: AlertTriangle, tone: "text-red-500" },
                { label: "Overdue invoices", value: kpis?.overdueInvoices ?? 0, icon: FileText, tone: "text-sky-500" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Icon className={`h-4 w-4 ${item.tone}`} />
                      {item.label}
                    </span>
                    <strong className="text-slate-950">{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden rounded-2xl border-white shadow-lg shadow-slate-200/70">
          <CardHeader title="Revenue trend" action={<span className="text-xs font-semibold text-slate-400">Last 6 months</span>} />
          <div className="p-5">
            <AreaChart data={revenueTrend} />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Open balance</p>
                <p className="mt-2 text-xl font-black text-slate-950">{formatMoney(revenue?.openInvoices?._sum?.balanceDue)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-400">Overdue balance</p>
                <p className="mt-2 text-xl font-black text-slate-950">{formatMoney(revenue?.overdueInvoices?._sum?.balanceDue)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-white shadow-lg shadow-slate-200/70">
          <CardHeader
            title="Recent field execution"
            action={<Link href="/dashboard/scheduling" className="text-sm font-semibold text-amber-600">Dispatch view</Link>}
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-semibold">Work order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Facility</th>
                  <th className="px-5 py-3 font-semibold">Schedule</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(overview?.recentWorkOrders ?? []).map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">{workOrder.title}</p>
                      <p className="text-xs text-slate-400">{workOrder.workOrderNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{workOrder.customer?.name || "Not set"}</td>
                    <td className="px-5 py-4 text-slate-600">{workOrder.facility?.name || "Not set"}</td>
                    <td className="px-5 py-4 text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4 text-slate-400" />
                        {workOrder.scheduledStartAt ? new Date(workOrder.scheduledStartAt).toLocaleDateString() : "Unscheduled"}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusPill status={workOrder.status} /></td>
                  </tr>
                ))}
                {!overview?.recentWorkOrders?.length && (
                  <tr>
                    <td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>
                      No recent work orders yet. New dispatch activity will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
