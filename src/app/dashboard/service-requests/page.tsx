"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ListPlus,
  Plus,
  RefreshCw,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { Alert, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, ServiceRequest } from "@/lib/api/operations";
import { Customer, Facility, phase3Api, Service } from "@/lib/phase3-api";
import { toast } from "@/lib/toast";

const enumLabel = (value: string) => value.replaceAll("_", " ").toLowerCase();

const serviceLineOptions = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT_SETUP",
  "FACILITY_SUPPORT",
  "OTHER",
].map((value) => ({ value, label: enumLabel(value) }));

const priorityOptions = ["LOW", "NORMAL", "HIGH", "URGENT", "EMERGENCY"].map(
  (value) => ({ value, label: enumLabel(value) }),
);

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
  const [createOpen, setCreateOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const anyDrawerOpen = createOpen || itemOpen;
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
      setCreateOpen(false);
      toast.success(`${created.title} was created.`, "Request created");
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
      setItemOpen(false);
      toast.success("Item added to request.", "Request updated");
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

  const facilityOptions = [
    { value: "", label: "No facility" },
    ...facilities
      .filter((facility) => !form.customerId || facility.customerId === form.customerId)
      .map((facility) => ({ value: facility.id, label: facility.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description={`${total} requests in the active workspace.`}
        eyebrow="Field operations"
        actions={
          <>
            <form
              className="flex w-full gap-2 sm:w-64"
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
              <Button type="submit" variant="outline" aria-label="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setItemOpen(true)}
              disabled={!requests.length}
            >
              <ListPlus className="h-4 w-4" />
              Add item
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={!customers.length}>
              <Plus className="h-4 w-4" />
              New request
            </Button>
          </>
        }
      />
      {error && !anyDrawerOpen && <Alert tone="error">{error}</Alert>}

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
                    <p className="font-medium text-slate-900">{request.title}</p>
                    <p className="text-xs text-slate-400">{request.requestNumber}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {request.customer?.name || "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {enumLabel(request.serviceLine)}
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
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-400" colSpan={7}>
                    Loading requests…
                  </td>
                </tr>
              )}
              {!loading && requests.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={7}>
                    <p className="text-sm font-medium text-slate-900">No requests yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {customers.length
                        ? "Log a service request to start the workflow."
                        : "Add a customer first, then log their requests."}
                    </p>
                    {customers.length > 0 && (
                      <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        New request
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create request */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New service request"
        description="Capture what the customer needs and where."
        icon={Wrench}
      >
        <form onSubmit={createRequest} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <DrawerSection title="Request">
              <Select
                label="Customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                value={form.customerId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, customerId: event.target.value }))
                }
                required
              />
              <Select
                label="Facility"
                options={facilityOptions}
                value={form.facilityId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, facilityId: event.target.value }))
                }
              />
              <Input
                label="Title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Broken window — main lobby"
                required
              />
            </DrawerSection>

            <DrawerSection title="Classification">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Service line"
                  options={serviceLineOptions}
                  value={form.serviceLine}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, serviceLine: event.target.value }))
                  }
                />
                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, priority: event.target.value }))
                  }
                />
              </div>
              <Input
                label="Requested start"
                type="datetime-local"
                value={form.requestedStartAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, requestedStartAt: event.target.value }))
                }
              />
            </DrawerSection>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!form.customerId}>
              <Plus className="h-4 w-4" />
              Save request
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Add request item */}
      <Drawer
        open={itemOpen}
        onClose={() => setItemOpen(false)}
        title="Add request item"
        description="Attach a service line item to a request."
        icon={ListPlus}
      >
        <form onSubmit={addItem} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Request"
              options={requests.map((request) => ({
                value: request.id,
                label: `${request.requestNumber} — ${request.title}`,
              }))}
              value={itemForm.requestId}
              onChange={(event) =>
                setItemForm((current) => ({ ...current, requestId: event.target.value }))
              }
            />
            <Select
              label="Service"
              options={services.map((service) => ({
                value: service.id,
                label: service.name,
              }))}
              value={itemForm.serviceId}
              onChange={(event) =>
                setItemForm((current) => ({ ...current, serviceId: event.target.value }))
              }
            />
            <Input
              label="Quantity"
              type="number"
              min="0"
              step="0.01"
              value={itemForm.quantity}
              onChange={(event) =>
                setItemForm((current) => ({ ...current, quantity: event.target.value }))
              }
              required
            />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setItemOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={actionId === itemForm.requestId}
              variant="secondary"
              disabled={!itemForm.requestId || !itemForm.serviceId}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
