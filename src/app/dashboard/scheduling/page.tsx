"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Plus, RefreshCw } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { schedulingApi, Shift } from "@/lib/api/scheduling";
import { workforceApi, Department, Employee } from "@/lib/api/workforce";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const serviceLines = ["CLEANING", "SECURITY", "PARKING", "EVENT_SETUP", "FACILITY_SUPPORT", "OTHER"];
const leaveTypes = ["ANNUAL", "SICK", "EMERGENCY", "UNPAID", "MATERNITY", "PATERNITY", "OTHER"];

export default function SchedulingPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    departmentId: "",
    title: "",
    serviceLine: "CLEANING",
    startAt: "",
    endAt: "",
    requiredStaffCount: "1",
  });
  const [assignmentForm, setAssignmentForm] = useState({ shiftId: "", employeeId: "", role: "OTHER" });
  const [attendanceForm, setAttendanceForm] = useState({ employeeId: "", shiftId: "", date: "", status: "PRESENT" });
  const [leaveForm, setLeaveForm] = useState({ employeeId: "", type: "ANNUAL", startDate: "", endDate: "", reason: "" });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [departmentResponse, employeeResponse, shiftResponse] = await Promise.all([
        workforceApi.listDepartments({ take: 100, isActive: true }),
        workforceApi.listEmployees({ take: 100, status: "ACTIVE" }),
        schedulingApi.listShifts({ take: 50 }),
      ]);
      setDepartments(departmentResponse.data);
      setEmployees(employeeResponse.data);
      setShifts(shiftResponse.data);
      setTotal(shiftResponse.meta.total);
      setShiftForm((current) => ({ ...current, departmentId: current.departmentId || departmentResponse.data[0]?.id || "" }));
      setAssignmentForm((current) => ({ ...current, shiftId: current.shiftId || shiftResponse.data[0]?.id || "", employeeId: current.employeeId || employeeResponse.data[0]?.id || "" }));
      setAttendanceForm((current) => ({ ...current, shiftId: current.shiftId || shiftResponse.data[0]?.id || "", employeeId: current.employeeId || employeeResponse.data[0]?.id || "" }));
      setLeaveForm((current) => ({ ...current, employeeId: current.employeeId || employeeResponse.data[0]?.id || "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const shift = await schedulingApi.createShift({
        ...shiftForm,
        departmentId: shiftForm.departmentId || undefined,
        requiredStaffCount: Number(shiftForm.requiredStaffCount),
      });
      setShiftForm((current) => ({ ...current, title: "", startAt: "", endAt: "", requiredStaffCount: "1" }));
      setAssignmentForm((current) => ({ ...current, shiftId: shift.id }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function assignShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!assignmentForm.shiftId || !assignmentForm.employeeId) return;
    setSaving(true);
    try {
      await schedulingApi.addShiftAssignment(assignmentForm.shiftId, {
        employeeId: assignmentForm.employeeId,
        role: assignmentForm.role,
        status: "SCHEDULED",
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await schedulingApi.createAttendance({
        ...attendanceForm,
        shiftId: attendanceForm.shiftId || undefined,
        date: attendanceForm.date,
      });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await schedulingApi.createLeaveRequest({
        ...leaveForm,
        reason: leaveForm.reason || undefined,
      });
      setLeaveForm((current) => ({ ...current, startDate: "", endDate: "", reason: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function completeShift(id: string) {
    setSaving(true);
    try {
      await schedulingApi.updateShiftStatus(id, "COMPLETED");
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
        title="Scheduling"
        description={`${total} shifts with staff, attendance, and leave tracking.`}
        eyebrow="Field operations"
        actions={
          <Button type="button" variant="outline" onClick={() => void loadData()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader title="Shift schedule" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Shift</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Window</th>
                  <th className="px-5 py-3 font-medium">Staff</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/dashboard/scheduling/detail?id=${shift.id}`)}>
                    <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{shift.title}</p><p className="text-xs text-slate-400">{shift.serviceLine.replaceAll("_", " ").toLowerCase()}</p></td>
                    <td className="px-5 py-3.5 text-slate-600">{shift.department?.name || "Not set"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{new Date(shift.startAt).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{shift.assignments?.length ?? 0}/{shift.requiredStaffCount}</td>
                    <td className="px-5 py-3.5"><StatusPill status={shift.status} /></td>
                    <td className="px-5 py-3.5"><Button type="button" size="sm" variant="ghost" disabled={saving} onClick={(event) => { event.stopPropagation(); void completeShift(shift.id); }}><CheckCircle2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
                {!loading && shifts.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No shifts found.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create shift" />
            <form className="space-y-4 p-5" onSubmit={createShift}>
              <select className={selectClass} value={shiftForm.departmentId} onChange={(event) => setShiftForm((current) => ({ ...current, departmentId: event.target.value }))}>
                <option value="">No department</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
              <Input label="Title" value={shiftForm.title} onChange={(event) => setShiftForm((current) => ({ ...current, title: event.target.value }))} icon={<CalendarClock className="h-4 w-4" />} required />
              <select className={selectClass} value={shiftForm.serviceLine} onChange={(event) => setShiftForm((current) => ({ ...current, serviceLine: event.target.value }))}>
                {serviceLines.map((line) => <option key={line} value={line}>{line.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="datetime-local" value={shiftForm.startAt} onChange={(event) => setShiftForm((current) => ({ ...current, startAt: event.target.value }))} required />
                <Input label="End" type="datetime-local" value={shiftForm.endAt} onChange={(event) => setShiftForm((current) => ({ ...current, endAt: event.target.value }))} required />
              </div>
              <Button type="submit" loading={saving} fullWidth><Plus className="h-4 w-4" />Save shift</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Assign and record" />
            <div className="space-y-4 p-5">
              <form className="space-y-3" onSubmit={assignShift}>
                <select className={selectClass} value={assignmentForm.shiftId} onChange={(event) => setAssignmentForm((current) => ({ ...current, shiftId: event.target.value }))}>
                  {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.title}</option>)}
                </select>
                <select className={selectClass} value={assignmentForm.employeeId} onChange={(event) => setAssignmentForm((current) => ({ ...current, employeeId: event.target.value }))}>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                </select>
                <Button type="submit" fullWidth variant="secondary" loading={saving}>Assign employee</Button>
              </form>
              <form className="space-y-3" onSubmit={createAttendance}>
                <Input label="Attendance date" type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm((current) => ({ ...current, date: event.target.value }))} required />
                <Button type="submit" fullWidth variant="outline" loading={saving} disabled={!attendanceForm.employeeId}>Save attendance</Button>
              </form>
              <form className="space-y-3" onSubmit={createLeave}>
                <select className={selectClass} value={leaveForm.type} onChange={(event) => setLeaveForm((current) => ({ ...current, type: event.target.value }))}>
                  {leaveTypes.map((type) => <option key={type} value={type}>{type.toLowerCase()}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Leave start" type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm((current) => ({ ...current, startDate: event.target.value }))} required />
                  <Input label="Leave end" type="date" value={leaveForm.endDate} onChange={(event) => setLeaveForm((current) => ({ ...current, endDate: event.target.value }))} required />
                </div>
                <Button type="submit" fullWidth variant="ghost" loading={saving} disabled={!leaveForm.employeeId}>Request leave</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
