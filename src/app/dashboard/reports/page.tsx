"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, RefreshCw } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Invoice } from "@/lib/api/billing";
import { ServiceRequest, WorkOrder } from "@/lib/api/operations";
import { ReportResponse, reportsApi } from "@/lib/api/reports";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value ?? 0));
}

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [serviceRequests, setServiceRequests] = useState<ReportResponse<ServiceRequest> | null>(null);
  const [workOrders, setWorkOrders] = useState<ReportResponse<WorkOrder> | null>(null);
  const [invoices, setInvoices] = useState<ReportResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const query = { from, to, take: 25 };
      const [requestResponse, workOrderResponse, invoiceResponse] = await Promise.all([
        reportsApi.serviceRequests(query),
        reportsApi.workOrders(query),
        reportsApi.invoices(query),
      ]);
      setServiceRequests(requestResponse);
      setWorkOrders(workOrderResponse);
      setInvoices(invoiceResponse);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Operational and finance report read models.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[160px_160px_auto]">
          <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          <Button type="button" variant="outline" onClick={() => void loadData()} loading={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Service requests" action={<BarChart3 className="h-4 w-4 text-slate-400" />} />
          <div className="space-y-3 p-5">
            <p className="text-2xl font-semibold text-slate-900">{serviceRequests?.meta.total ?? 0}</p>
            <p className="text-sm text-slate-500">requests matched</p>
            {(serviceRequests?.summary.byStatus as Array<{ status: string; _count: { _all: number } }> | undefined)?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <StatusPill status={item.status} />
                <span className="text-sm font-semibold text-slate-900">{item._count._all}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Work orders" action={<BarChart3 className="h-4 w-4 text-slate-400" />} />
          <div className="space-y-3 p-5">
            <p className="text-2xl font-semibold text-slate-900">{workOrders?.meta.total ?? 0}</p>
            <p className="text-sm text-slate-500">work orders matched</p>
            {(workOrders?.summary.byStatus as Array<{ status: string; _count: { _all: number } }> | undefined)?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <StatusPill status={item.status} />
                <span className="text-sm font-semibold text-slate-900">{item._count._all}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Invoices" action={<FileText className="h-4 w-4 text-slate-400" />} />
          <div className="space-y-3 p-5">
            <p className="text-2xl font-semibold text-slate-900">{invoices?.meta.total ?? 0}</p>
            <p className="text-sm text-slate-500">invoices matched</p>
            {(invoices?.summary.byStatus as Array<{ status: string; _count: { _all: number }; _sum: { balanceDue?: string | number | null } }> | undefined)?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <StatusPill status={item.status} />
                <span className="text-sm font-semibold text-slate-900">{money(item._sum.balanceDue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Invoice report detail" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Paid</th>
                <th className="px-5 py-3 font-medium">Balance</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoices?.data ?? []).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                  <td className="px-5 py-3.5 text-slate-600">{invoice.customer?.name || "Not set"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{money(invoice.total)}</td>
                  <td className="px-5 py-3.5 text-slate-600">{money(invoice.amountPaid)}</td>
                  <td className="px-5 py-3.5 text-slate-600">{money(invoice.balanceDue)}</td>
                  <td className="px-5 py-3.5"><StatusPill status={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
