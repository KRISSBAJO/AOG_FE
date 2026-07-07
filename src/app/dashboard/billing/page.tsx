"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CreditCard, FileText, Plus, RefreshCw, Send } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { billingApi, Invoice, Payment } from "@/lib/api/billing";
import { operationsApi, WorkOrder } from "@/lib/api/operations";
import { Customer, phase3Api, Service } from "@/lib/phase3-api";
import { formatMoney, toNumber } from "@/lib/formatters";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const units = ["VISIT", "HOUR", "DAY", "SHIFT", "EVENT", "SQFT", "MONTH", "UNIT"];
const methods = ["CASH", "BANK_TRANSFER", "CARD", "CHECK", "MOBILE_MONEY", "OTHER"];

export default function BillingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({ customerId: "", dueDate: "", notes: "" });
  const [itemForm, setItemForm] = useState({
    serviceId: "",
    workOrderId: "",
    description: "",
    quantity: "1",
    unit: "VISIT",
    unitPrice: "0",
    taxRate: "0",
  });
  const [paymentForm, setPaymentForm] = useState({ customerId: "", method: "CARD", amount: "", reference: "" });

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId),
    [invoices, selectedInvoiceId],
  );

  async function loadData(nextSelectedId = selectedInvoiceId) {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, serviceResponse, workOrderResponse, invoiceResponse, paymentResponse] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listServices({ take: 100, isActive: true }),
        operationsApi.listWorkOrders({ take: 100 }),
        billingApi.listInvoices({ take: 50 }),
        billingApi.listPayments({ take: 50 }),
      ]);
      const activeId = nextSelectedId || invoiceResponse.data[0]?.id || "";
      const activeInvoice = invoiceResponse.data.find((invoice) => invoice.id === activeId);
      setCustomers(customerResponse.data);
      setServices(serviceResponse.data);
      setWorkOrders(workOrderResponse.data);
      setInvoices(invoiceResponse.data);
      setPayments(paymentResponse.data);
      setSelectedInvoiceId(activeId);
      setInvoiceForm((current) => ({ ...current, customerId: current.customerId || customerResponse.data[0]?.id || "" }));
      setPaymentForm((current) => ({
        ...current,
        customerId: current.customerId || activeInvoice?.customerId || customerResponse.data[0]?.id || "",
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const invoice = await billingApi.createInvoice({
        customerId: invoiceForm.customerId,
        dueDate: invoiceForm.dueDate || undefined,
        notes: invoiceForm.notes || undefined,
      });
      setInvoiceForm((current) => ({ ...current, dueDate: "", notes: "" }));
      setSelectedInvoiceId(invoice.id);
      await loadData(invoice.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addInvoiceItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoiceId) return;
    setSaving(true);
    try {
      await billingApi.addInvoiceItem(selectedInvoiceId, {
        serviceId: itemForm.serviceId || undefined,
        workOrderId: itemForm.workOrderId || undefined,
        description: itemForm.description,
        quantity: Number(itemForm.quantity),
        unit: itemForm.unit,
        unitPrice: Number(itemForm.unitPrice),
        taxRate: itemForm.taxRate ? Number(itemForm.taxRate) : undefined,
      });
      setItemForm((current) => ({ ...current, description: "", unitPrice: "0" }));
      await loadData(selectedInvoiceId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function sendInvoice(id: string) {
    setSaving(true);
    try {
      await billingApi.sendInvoice(id, { note: "Sent from dashboard." });
      await loadData(id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await billingApi.createPayment({
        customerId: selectedInvoice?.customerId || paymentForm.customerId,
        invoiceId: selectedInvoiceId || undefined,
        method: paymentForm.method,
        amount: Number(paymentForm.amount),
        reference: paymentForm.reference || undefined,
      });
      setPaymentForm((current) => ({ ...current, amount: "", reference: "" }));
      await loadData(selectedInvoiceId);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
          <p className="mt-1 text-sm text-slate-500">{invoices.length} invoices and {payments.length} recent payments.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadData(selectedInvoiceId)}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Invoices" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Paid</th>
                    <th className="px-5 py-3 font-medium">Balance</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Send</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className={`hover:bg-slate-50 ${invoice.id === selectedInvoiceId ? "bg-amber-50" : ""}`} onClick={() => setSelectedInvoiceId(invoice.id)}>
                      <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{invoice.invoiceNumber}</p><p className="text-xs text-slate-400">{invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}` : "No due date"}</p></td>
                      <td className="px-5 py-3.5 text-slate-600">{invoice.customer?.name || "Not set"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatMoney(invoice.total, invoice.currency)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatMoney(invoice.amountPaid, invoice.currency)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatMoney(invoice.balanceDue, invoice.currency)}</td>
                      <td className="px-5 py-3.5"><StatusPill status={invoice.status} /></td>
                      <td className="px-5 py-3.5">
                        <Button type="button" size="sm" variant="ghost" disabled={saving} onClick={() => void sendInvoice(invoice.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loading && invoices.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={7}>No invoices found.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent payments" />
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{payment.paymentNumber || payment.reference || payment.id}</p>
                      <p className="mt-1 text-xs text-slate-500">{payment.customer?.name || "Unknown customer"}</p>
                    </div>
                    <StatusPill status={payment.status} />
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{formatMoney(payment.amount, payment.currency)}</p>
                </div>
              ))}
              {!loading && payments.length === 0 && <p className="text-sm text-slate-500">No payments found.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create invoice" />
            <form className="space-y-4 p-5" onSubmit={createInvoice}>
              <select className={selectClass} value={invoiceForm.customerId} onChange={(event) => setInvoiceForm((current) => ({ ...current, customerId: event.target.value }))} required>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
              <Input label="Due date" type="date" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm((current) => ({ ...current, dueDate: event.target.value }))} />
              <Textarea label="Notes" value={invoiceForm.notes} onChange={(event) => setInvoiceForm((current) => ({ ...current, notes: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth><FileText className="h-4 w-4" />Save invoice</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Invoice item" />
            <form className="space-y-4 p-5" onSubmit={addInvoiceItem}>
              <select className={selectClass} value={itemForm.serviceId} onChange={(event) => {
                const service = services.find((item) => item.id === event.target.value);
                setItemForm((current) => ({
                  ...current,
                  serviceId: event.target.value,
                  description: service?.name || current.description,
                  unitPrice: service?.basePrice ? String(toNumber(service.basePrice)) : current.unitPrice,
                }));
              }}>
                <option value="">No service</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              <select className={selectClass} value={itemForm.workOrderId} onChange={(event) => setItemForm((current) => ({ ...current, workOrderId: event.target.value }))}>
                <option value="">No work order</option>
                {workOrders.map((workOrder) => <option key={workOrder.id} value={workOrder.id}>{workOrder.workOrderNumber}</option>)}
              </select>
              <Input label="Description" value={itemForm.description} onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Quantity" type="number" min="0" step="0.01" value={itemForm.quantity} onChange={(event) => setItemForm((current) => ({ ...current, quantity: event.target.value }))} />
                <select className={selectClass} value={itemForm.unit} onChange={(event) => setItemForm((current) => ({ ...current, unit: event.target.value }))}>
                  {units.map((unit) => <option key={unit} value={unit}>{unit.toLowerCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Unit price" type="number" min="0" step="0.01" value={itemForm.unitPrice} onChange={(event) => setItemForm((current) => ({ ...current, unitPrice: event.target.value }))} />
                <Input label="Tax %" type="number" min="0" step="0.01" value={itemForm.taxRate} onChange={(event) => setItemForm((current) => ({ ...current, taxRate: event.target.value }))} />
              </div>
              <Button type="submit" loading={saving} fullWidth variant="outline" disabled={!selectedInvoiceId}><Plus className="h-4 w-4" />Add item</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Apply payment" />
            <form className="space-y-4 p-5" onSubmit={createPayment}>
              <select className={selectClass} value={selectedInvoiceId} onChange={(event) => {
                const invoice = invoices.find((item) => item.id === event.target.value);
                setSelectedInvoiceId(event.target.value);
                setPaymentForm((current) => ({ ...current, customerId: invoice?.customerId || current.customerId }));
              }}>
                {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</option>)}
              </select>
              <select className={selectClass} value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}>
                {methods.map((method) => <option key={method} value={method}>{method.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <Input label="Amount" type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} icon={<CreditCard className="h-4 w-4" />} required />
              <Input label="Reference" value={paymentForm.reference} onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth variant="secondary" disabled={!paymentForm.amount}>Save payment</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
