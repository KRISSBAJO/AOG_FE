"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, ServiceRequest } from "@/lib/api/operations";
import { Customer, Facility, phase3Api, Service } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const serviceLines = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT_SETUP",
  "FACILITY_SUPPORT",
  "OTHER",
];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT", "EMERGENCY"];

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    customerId: "",
    facilityId: "",
    title: "",
    serviceLine: "CLEANING",
    priority: "NORMAL",
    requestedStartAt: "",
  });
  const [itemForm, setItemForm] = useState({
    requestId: "",
    serviceId: "",
    quantity: "1",
  });

  async function loadData(nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const [
        customerResponse,
        facilityResponse,
        serviceResponse,
        requestResponse,
      ] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
        phase3Api.listServices({ take: 100, isActive: true }),
        operationsApi.listServiceRequests({ take: 50, search: nextSearch }),
      ]);
      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setServices(serviceResponse.data);
      setRequests(requestResponse.data);
      setTotal(requestResponse.meta.total);
      setForm((current) => ({
        ...current,
        customerId: current.customerId || customerResponse.data[0]?.id || "",
      }));
      setItemForm((current) => ({
        ...current,
        requestId: current.requestId || requestResponse.data[0]?.id || "",
        serviceId: current.serviceId || serviceResponse.data[0]?.id || "",
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

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await operationsApi.createServiceRequest({
        ...form,
        facilityId: form.facilityId || undefined,
        requestedStartAt: form.requestedStartAt || undefined,
      });
      setForm((current) => ({
        customerId: current.customerId,
        facilityId: "",
        title: "",
        serviceLine: current.serviceLine,
        priority: "NORMAL",
        requestedStartAt: "",
      }));
      setItemForm((current) => ({ ...current, requestId: created.id }));
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemForm.requestId || !itemForm.serviceId) return;
    setActionId(itemForm.requestId);
    setError(null);
    try {
      await operationsApi.addServiceRequestItem(itemForm.requestId, {
        serviceId: itemForm.serviceId,
        quantity: Number(itemForm.quantity),
      });
      setItemForm((current) => ({ ...current, quantity: "1" }));
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function runAction(
    id: string,
    action: "approve" | "reject" | "convert",
  ) {
    setActionId(id);
    setError(null);
    try {
      if (action === "approve") await operationsApi.approveServiceRequest(id);
      if (action === "reject") await operationsApi.rejectServiceRequest(id);
      if (action === "convert")
        await operationsApi.convertServiceRequest(id, {});
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Service Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} requests in the active workspace.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void loadData(search);
          }}
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests"
            icon={<Search className="h-4 w-4" />}
          />
          <Button type="submit" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </form>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader title="Request queue" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Line</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() =>
                      router.push(`/dashboard/service-requests/detail?id=${request.id}`)
                    }
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">
                        {request.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {request.requestNumber}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {request.customer?.name || "Not set"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {request.serviceLine.replaceAll("_", " ").toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {request.priority.toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {request._count?.items ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={request.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={actionId === request.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(request.id, "approve");
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={actionId === request.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(request.id, "reject");
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            actionId === request.id ||
                            Boolean(request._count?.workOrders)
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            void runAction(request.id, "convert");
                          }}
                        >
                          <Wrench className="h-4 w-4" />
                          Convert
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-8 text-center text-slate-500"
                      colSpan={7}
                    >
                      No service requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create request" />
            <form className="space-y-4 p-5" onSubmit={createRequest}>
              <select
                className={selectClass}
                value={form.customerId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerId: event.target.value,
                  }))
                }
                required
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={form.facilityId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    facilityId: event.target.value,
                  }))
                }
              >
                <option value="">No facility</option>
                {facilities
                  .filter(
                    (facility) =>
                      !form.customerId ||
                      facility.customerId === form.customerId,
                  )
                  .map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
              </select>
              <Input
                label="Title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={form.serviceLine}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      serviceLine: event.target.value,
                    }))
                  }
                >
                  {serviceLines.map((line) => (
                    <option key={line} value={line}>
                      {line.replaceAll("_", " ").toLowerCase()}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Requested start"
                type="datetime-local"
                value={form.requestedStartAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    requestedStartAt: event.target.value,
                  }))
                }
              />
              <Button
                type="submit"
                loading={saving}
                fullWidth
                disabled={!form.customerId}
              >
                <Plus className="h-4 w-4" />
                Save request
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add request item" />
            <form className="space-y-4 p-5" onSubmit={addItem}>
              <select
                className={selectClass}
                value={itemForm.requestId}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    requestId: event.target.value,
                  }))
                }
              >
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.requestNumber} - {request.title}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={itemForm.serviceId}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    serviceId: event.target.value,
                  }))
                }
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.01"
                value={itemForm.quantity}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                required
              />
              <Button
                type="submit"
                loading={actionId === itemForm.requestId}
                fullWidth
                variant="secondary"
                disabled={!itemForm.requestId || !itemForm.serviceId}
              >
                Add item
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
