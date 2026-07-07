"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Plus, RefreshCw, Search } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, WorkOrder } from "@/lib/api/operations";
import { workforceApi, Employee } from "@/lib/api/workforce";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const serviceLines = ["CLEANING", "SECURITY", "PARKING", "EVENT_SETUP", "FACILITY_SUPPORT", "OTHER"];

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
    try {
      await operationsApi.addWorkOrderTask(taskForm.workOrderId, { title: taskForm.title });
      setTaskForm((current) => ({ ...current, title: "" }));
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
    try {
      await operationsApi.addWorkOrderAssignment(assignmentForm.workOrderId, {
        employeeId: assignmentForm.employeeId,
        role: assignmentForm.role,
      });
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  }

  async function setStatus(id: string, status: string) {
    setActionId(id);
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-500">{total} work orders scheduled or in progress.</p>
        </div>
        <form className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row" onSubmit={(event) => { event.preventDefault(); void loadData(search); }}>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work orders" icon={<Search className="h-4 w-4" />} />
          <Button type="submit" variant="outline"><RefreshCw className="h-4 w-4" />Refresh</Button>
        </form>
      </div>
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                        <Button type="button" size="sm" variant="ghost" disabled={actionId === workOrder.id} onClick={(event) => { event.stopPropagation(); void setStatus(workOrder.id, "IN_PROGRESS"); }}><Clock className="h-4 w-4" /></Button>
                        <Button type="button" size="sm" variant="outline" disabled={actionId === workOrder.id} onClick={(event) => { event.stopPropagation(); void setStatus(workOrder.id, "COMPLETED"); }}><CheckCircle2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && workOrders.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={7}>No work orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create work order" />
            <form className="space-y-4 p-5" onSubmit={createWorkOrder}>
              <select className={selectClass} value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))} required>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
              <select className={selectClass} value={form.facilityId} onChange={(event) => setForm((current) => ({ ...current, facilityId: event.target.value }))}>
                <option value="">No facility</option>
                {facilities.filter((facility) => !form.customerId || facility.customerId === form.customerId).map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
              <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              <select className={selectClass} value={form.serviceLine} onChange={(event) => setForm((current) => ({ ...current, serviceLine: event.target.value }))}>
                {serviceLines.map((line) => <option key={line} value={line}>{line.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="datetime-local" value={form.scheduledStartAt} onChange={(event) => setForm((current) => ({ ...current, scheduledStartAt: event.target.value }))} />
                <Input label="End" type="datetime-local" value={form.scheduledEndAt} onChange={(event) => setForm((current) => ({ ...current, scheduledEndAt: event.target.value }))} />
              </div>
              <Button type="submit" loading={saving} fullWidth disabled={!form.customerId}><Plus className="h-4 w-4" />Save work order</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Task and staff" />
            <div className="space-y-4 p-5">
              <form className="space-y-3" onSubmit={addTask}>
                <select className={selectClass} value={taskForm.workOrderId} onChange={(event) => setTaskForm((current) => ({ ...current, workOrderId: event.target.value }))}>
                  {workOrders.map((workOrder) => <option key={workOrder.id} value={workOrder.id}>{workOrder.workOrderNumber}</option>)}
                </select>
                <Input label="Task title" value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} required />
                <Button type="submit" fullWidth variant="secondary" loading={actionId === taskForm.workOrderId}>Add task</Button>
              </form>
              <form className="space-y-3" onSubmit={addAssignment}>
                <select className={selectClass} value={assignmentForm.employeeId} onChange={(event) => setAssignmentForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                </select>
                <Button type="submit" fullWidth variant="outline" loading={actionId === assignmentForm.workOrderId} disabled={!assignmentForm.workOrderId || !assignmentForm.employeeId}>Assign employee</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
