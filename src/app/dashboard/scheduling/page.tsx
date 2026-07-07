"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarOff,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  RefreshCw,
  UserPlus,
} from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { Alert, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { schedulingApi, Shift } from "@/lib/api/scheduling";
import { workforceApi, Department, Employee } from "@/lib/api/workforce";
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

const leaveTypeOptions = [
  "ANNUAL",
  "SICK",
  "EMERGENCY",
  "UNPAID",
  "MATERNITY",
  "PATERNITY",
  "OTHER",
].map((value) => ({ value, label: enumLabel(value) }));

export default function SchedulingPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const anyDrawerOpen = shiftOpen || assignOpen || attendanceOpen || leaveOpen;
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
      setShiftOpen(false);
      toast.success(`${shift.title} was created.`, "Shift created");
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
      setAssignOpen(false);
      toast.success("Employee assigned to shift.", "Shift updated");
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
      setAttendanceOpen(false);
      toast.success("Attendance recorded.", "Attendance saved");
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
      setLeaveOpen(false);
      toast.success("Leave request submitted.", "Leave saved");
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

  const employeeOptions = employees.map((employee) => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
  }));
  const shiftOptions = shifts.map((shift) => ({ value: shift.id, label: shift.title }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduling"
        description={`${total} shifts with staff, attendance, and leave tracking.`}
        eyebrow="Field operations"
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => void loadData()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setAssignOpen(true)} disabled={!shifts.length}>
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
            <Button variant="outline" onClick={() => setAttendanceOpen(true)} disabled={!employees.length}>
              <ClipboardCheck className="h-4 w-4" />
              Attendance
            </Button>
            <Button variant="outline" onClick={() => setLeaveOpen(true)} disabled={!employees.length}>
              <CalendarOff className="h-4 w-4" />
              Leave
            </Button>
            <Button onClick={() => setShiftOpen(true)}>
              <Plus className="h-4 w-4" />
              New shift
            </Button>
          </>
        }
      />
      {error && !anyDrawerOpen && <Alert tone="error">{error}</Alert>}

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
                  <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{shift.title}</p><p className="text-xs text-slate-400">{enumLabel(shift.serviceLine)}</p></td>
                  <td className="px-5 py-3.5 text-slate-600">{shift.department?.name || "Not set"}</td>
                  <td className="px-5 py-3.5 text-slate-600">{new Date(shift.startAt).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-slate-600">{shift.assignments?.length ?? 0}/{shift.requiredStaffCount}</td>
                  <td className="px-5 py-3.5"><StatusPill status={shift.status} /></td>
                  <td className="px-5 py-3.5"><Button type="button" size="sm" variant="ghost" aria-label="Complete shift" disabled={saving} onClick={(event) => { event.stopPropagation(); void completeShift(shift.id); }}><CheckCircle2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
              {loading && (
                <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={6}>Loading shifts…</td></tr>
              )}
              {!loading && shifts.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={6}>
                    <p className="text-sm font-medium text-slate-900">No shifts yet</p>
                    <p className="mt-1 text-sm text-slate-500">Create a shift to schedule your teams.</p>
                    <Button className="mt-4" onClick={() => setShiftOpen(true)}><Plus className="h-4 w-4" />New shift</Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create shift */}
      <Drawer open={shiftOpen} onClose={() => setShiftOpen(false)} title="New shift" description="Define a shift window and staffing target." icon={CalendarClock}>
        <form onSubmit={createShift} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <DrawerSection title="Shift">
              <Select
                label="Department"
                options={[{ value: "", label: "No department" }, ...departments.map((department) => ({ value: department.id, label: department.name }))]}
                value={shiftForm.departmentId}
                onChange={(event) => setShiftForm((current) => ({ ...current, departmentId: event.target.value }))}
              />
              <Input label="Title" value={shiftForm.title} onChange={(event) => setShiftForm((current) => ({ ...current, title: event.target.value }))} icon={<CalendarClock className="h-4 w-4" />} placeholder="Night patrol — Gate 3" required />
              <Select label="Service line" options={serviceLineOptions} value={shiftForm.serviceLine} onChange={(event) => setShiftForm((current) => ({ ...current, serviceLine: event.target.value }))} />
            </DrawerSection>
            <DrawerSection title="Window">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start" type="datetime-local" value={shiftForm.startAt} onChange={(event) => setShiftForm((current) => ({ ...current, startAt: event.target.value }))} required />
                <Input label="End" type="datetime-local" value={shiftForm.endAt} onChange={(event) => setShiftForm((current) => ({ ...current, endAt: event.target.value }))} required />
              </div>
              <Input label="Required staff" type="number" min="1" value={shiftForm.requiredStaffCount} onChange={(event) => setShiftForm((current) => ({ ...current, requiredStaffCount: event.target.value }))} />
            </DrawerSection>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setShiftOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}><Plus className="h-4 w-4" />Save shift</Button>
          </div>
        </form>
      </Drawer>

      {/* Assign */}
      <Drawer open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign to shift" description="Add an employee to a scheduled shift." icon={UserPlus}>
        <form onSubmit={assignShift} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select label="Shift" options={shiftOptions} value={assignmentForm.shiftId} onChange={(event) => setAssignmentForm((current) => ({ ...current, shiftId: event.target.value }))} />
            <Select label="Employee" options={employeeOptions} value={assignmentForm.employeeId} onChange={(event) => setAssignmentForm((current) => ({ ...current, employeeId: event.target.value }))} />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={saving} disabled={!assignmentForm.shiftId || !assignmentForm.employeeId}><UserPlus className="h-4 w-4" />Assign employee</Button>
          </div>
        </form>
      </Drawer>

      {/* Attendance */}
      <Drawer open={attendanceOpen} onClose={() => setAttendanceOpen(false)} title="Record attendance" description="Log attendance for an employee." icon={ClipboardCheck}>
        <form onSubmit={createAttendance} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select label="Employee" options={employeeOptions} value={attendanceForm.employeeId} onChange={(event) => setAttendanceForm((current) => ({ ...current, employeeId: event.target.value }))} />
            <Select label="Shift" options={[{ value: "", label: "No shift" }, ...shiftOptions]} value={attendanceForm.shiftId} onChange={(event) => setAttendanceForm((current) => ({ ...current, shiftId: event.target.value }))} />
            <Input label="Attendance date" type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm((current) => ({ ...current, date: event.target.value }))} required />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setAttendanceOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={saving} disabled={!attendanceForm.employeeId}><ClipboardCheck className="h-4 w-4" />Save attendance</Button>
          </div>
        </form>
      </Drawer>

      {/* Leave */}
      <Drawer open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Request leave" description="Submit a leave request for an employee." icon={CalendarOff}>
        <form onSubmit={createLeave} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select label="Employee" options={employeeOptions} value={leaveForm.employeeId} onChange={(event) => setLeaveForm((current) => ({ ...current, employeeId: event.target.value }))} />
            <Select label="Leave type" options={leaveTypeOptions} value={leaveForm.type} onChange={(event) => setLeaveForm((current) => ({ ...current, type: event.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start" type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm((current) => ({ ...current, startDate: event.target.value }))} required />
              <Input label="End" type="date" value={leaveForm.endDate} onChange={(event) => setLeaveForm((current) => ({ ...current, endDate: event.target.value }))} required />
            </div>
            <Input label="Reason" value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Optional" />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setLeaveOpen(false)}>Cancel</Button>
            <Button type="submit" variant="secondary" loading={saving} disabled={!leaveForm.employeeId}><Plus className="h-4 w-4" />Request leave</Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
