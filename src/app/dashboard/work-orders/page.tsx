"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
} from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { Alert, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, WorkOrder } from "@/lib/api/operations";
import { workforceApi, Employee } from "@/lib/api/workforce";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";
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

export default function WorkOrdersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const anyDrawerOpen = createOpen || taskOpen || assignOpen;
  const [form, setForm] = useState({
    customerId: "",
    facilityId: "",
    supervisorEmployeeId: "",
    title: "",
    serviceLine: "CLEANING",
    scheduledStartAt: "",
    scheduledEndAt: "",
  });
  const [taskForm, setTaskForm] = useState({ workOrderId: "", title: "" });
  const [assignmentForm, setAssignmentForm] = useState({ workOrderId: "", employeeId: "", role: "OTHER" });

  async function loadData(nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, facilityResponse, employeeResponse, workOrderResponse] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
        workforceApi.listEmployees({ take: 100, status: "ACTIVE" }),
        operationsApi.listWorkOrders({ take: 50, search: nextSearch }),
      ]);
      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setEmployees(employeeResponse.data);
      setWorkOrders(workOrderResponse.data);
      setTotal(workOrderResponse.meta.total);
      setForm((current) => ({ ...current, customerId: current.customerId || customerResponse.data[0]?.id || "" }));
      setTaskForm((current) => ({ ...current, workOrderId: current.workOrderId || workOrderResponse.data[0]?.id || "" }));
      setAssignmentForm((current) => ({
        ...current,
        workOrderId: current.workOrderId || workOrderResponse.data[0]?.id || "",
        employeeId: current.employeeId || employeeResponse.data[0]?.id || "",
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

  async function createWorkOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await operationsApi.createWorkOrder({
        ...form,
        facilityId: form.facilityId || undefined,
        supervisorEmployeeId: form.supervisorEmployeeId || undefined,
        scheduledStartAt: form.scheduledStartAt || undefined,
        scheduledEndAt: form.scheduledEndAt || undefined,
      });
      setForm((current) => ({ ...current, title: "", scheduledStartAt: "", scheduledEndAt: "" }));
      setTaskForm((current) => ({ ...current, workOrderId: created.id }));
      setAssignmentForm((current) => ({ ...current, workOrderId: created.id }));
      setCreateOpen(false);
      toast.success(`${created.title} was created.`, "Work order created");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.workOrderId) return;
    setActionId(taskForm.workOrderId);
    setError(null);
    try {
      await operationsApi.addWorkOrderTask(taskForm.workOrderId, { title: taskForm.title });
      setTaskForm((current) => ({ ...current, title: "" }));
      setTaskOpen(false);
      toast.success("Task added.", "Work order updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentForm.workOrderId || !assignmentForm.employeeId) return;
    setActionId(assignmentForm.workOrderId);
    setError(null);
    try {
      await operationsApi.addWorkOrderAssignment(assignmentForm.workOrderId, {
        employeeId: assignmentForm.employeeId,
        role: assignmentForm.role,
      });
      setAssignOpen(false);
      toast.success("Employee assigned.", "Work order updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function setStatus(id: string, status: string) {
    setActionId(id);
    setError(null);
    try {
      await operationsApi.updateWorkOrderStatus(id, { status });
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description={`${total} work orders scheduled or in progress.`}
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
                placeholder="Search work orders"
                icon={<Search className="h-4 w-4" />}
              />
              <Button type="submit" variant="outline" aria-label="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
            <Button variant="outline" onClick={() => setTaskOpen(true)} disabled={!workOrders.length}>
              <ListChecks className="h-4 w-4" />
              Add task
            </Button>
            <Button variant="outline" onClick={() => setAssignOpen(true)} disabled={!workOrders.length}>
              <UserPlus className="h-4 w-4" />
              Assign staff
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={!customers.length}>
              <Plus className="h-4 w-4" />
              New work order
            </Button>
          </>
        }
      />
      {error && !anyDrawerOpen && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Execution board" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Work order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Tasks</th>
                <th className="px-5 py-3 font-medium">Staff</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map((workOrder) => (
                <tr key={workOrder.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/dashboard/work-orders/detail?id=${workOrder.id}`)}>
                  <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{workOrder.title}</p><p className="text-xs text-slate-400">{workOrder.workOrderNumber}</p></td>
                  <td className="px-5 py-3.5 text-slate-600">{workOrder.customer?.name || "Not set"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{workOrder.scheduledStartAt ? new Date(workOrder.scheduledStartAt).toLocaleString() : "Not scheduled"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{workOrder._count?.tasks ?? 0}</td>
                  <td className="px-5 py-3.5 text-slate-600">{workOrder._count?.assignments ?? 0}</td>
                  <td className="px-5 py-3.5"><StatusPill status={workOrder.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="ghost" aria-label="Mark in progress" disabled={actionId === workOrder.id} onClick={(event) => { event.stopPropagation(); void setStatus(workOrder.id, "IN_PROGRESS"); }}><Clock className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" aria-label="Mark completed" disabled={actionId === workOrder.id} onClick={(event) => { event.stopPropagation(); void setStatus(workOrder.id, "COMPLETED"); }}><CheckCircle2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={7}>Loading work orders…</td></tr>
              )}
              {!loading && workOrders.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={7}>
                    <p className="text-sm font-medium text-slate-900">No work orders yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {customers.length
                        ? "Create a work order to schedule and dispatch a job."
                        : "Add a customer first, then create work orders."}
                    </p>
                    {customers.length > 0 && (
                      <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        New work order
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create work order */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New work order"
        description="Schedule a job against a customer and facility."
        icon={ListChecks}
      >
        <form onSubmit={createWorkOrder} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <DrawerSection title="Job">
              <Select
                label="Customer"
                options={customers.map((customer) => ({ value: customer.id, label: customer.name }))}
                value={form.customerId}
                onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                required
              />
              <Select
                label="Facility"
                options={[
                  { value: "", label: "No facility" },
                  ...facilities
                    .filter((facility) => !form.customerId || facility.customerId === form.customerId)
                    .map((facility) => ({ value: facility.id, label: facility.name })),
                ]}
                value={form.facilityId}
                onChange={(event) => setForm((current) => ({ ...current, facilityId: event.target.value }))}
              />
              <Input
                label="Title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Nightly cleaning — floors 1–4"
                required
              />
              <Select
                label="Service line"
                options={serviceLineOptions}
                value={form.serviceLine}
                onChange={(event) => setForm((current) => ({ ...current, serviceLine: event.target.value }))}
              />
            </DrawerSection>

            <DrawerSection title="Schedule">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="datetime-local" value={form.scheduledStartAt} onChange={(event) => setForm((current) => ({ ...current, scheduledStartAt: event.target.value }))} />
                <Input label="End" type="datetime-local" value={form.scheduledEndAt} onChange={(event) => setForm((current) => ({ ...current, scheduledEndAt: event.target.value }))} />
              </div>
            </DrawerSection>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={!form.customerId}><Plus className="h-4 w-4" />Save work order</Button>
          </div>
        </form>
      </Drawer>

      {/* Add task */}
      <Drawer
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        title="Add task"
        description="Add a checklist task to a work order."
        icon={ListChecks}
      >
        <form onSubmit={addTask} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Work order"
              options={workOrders.map((workOrder) => ({ value: workOrder.id, label: `${workOrder.workOrderNumber} — ${workOrder.title}` }))}
              value={taskForm.workOrderId}
              onChange={(event) => setTaskForm((current) => ({ ...current, workOrderId: event.target.value }))}
            />
            <Input label="Task title" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setTaskOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={actionId === taskForm.workOrderId} disabled={!taskForm.workOrderId}><Plus className="h-4 w-4" />Add task</Button>
          </div>
        </form>
      </Drawer>

      {/* Assign staff */}
      <Drawer
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign staff"
        description="Assign an employee to a work order."
        icon={UserPlus}
      >
        <form onSubmit={addAssignment} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Work order"
              options={workOrders.map((workOrder) => ({ value: workOrder.id, label: `${workOrder.workOrderNumber} — ${workOrder.title}` }))}
              value={assignmentForm.workOrderId}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, workOrderId: event.target.value }))}
            />
            <Select
              label="Employee"
              options={employees.map((employee) => ({ value: employee.id, label: `${employee.firstName} ${employee.lastName}` }))}
              value={assignmentForm.employeeId}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, employeeId: event.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={actionId === assignmentForm.workOrderId} disabled={!assignmentForm.workOrderId || !assignmentForm.employeeId}><UserPlus className="h-4 w-4" />Assign employee</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
