"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  UserRoundCheck,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Checkbox,
  Textarea,
} from "@/components/ui";
import { ApiError, getErrorMessage } from "@/lib/api";
import { staffApi, type StaffMe } from "@/lib/api/staff";
import { toast } from "@/lib/toast";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function duration(clockInAt?: string | null, clockOutAt?: string | null) {
  if (!clockInAt) return "0h";
  const end = clockOutAt ? new Date(clockOutAt) : new Date();
  const minutes = Math.max(
    0,
    Math.round((end.getTime() - new Date(clockInAt).getTime()) / 60000),
  );
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${String(remainder).padStart(2, "0")}m`;
}

export default function TimeClockPage() {
  const [data, setData] = useState<StaffMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [clockInForm, setClockInForm] = useState({
    shiftId: "",
    workOrderId: "",
    notes: "",
  });
  const [clockOutForm, setClockOutForm] = useState({
    workOrderId: "",
    notes: "",
    proofNotes: "",
    proofPhotoUrls: "",
    completeWorkOrder: false,
  });

  const assignedWorkOrders = useMemo(
    () =>
      data?.employee.workOrderAssignments.map(
        (assignment) => assignment.workOrder,
      ) ?? [],
    [data],
  );
  const assignedShifts = useMemo(
    () =>
      data?.employee.shiftAssignments.map((assignment) => assignment.shift) ??
      [],
    [data],
  );

  async function loadData() {
    setLoading(true);
    try {
      const response = await staffApi.me();
      setProfileMissing(false);
      setData(response);
      const fallbackWorkOrderId =
        response.activeAttendance?.workOrderId ??
        response.employee.workOrderAssignments[0]?.workOrder.id ??
        "";
      setClockInForm((current) => ({
        ...current,
        shiftId:
          current.shiftId ||
          response.employee.shiftAssignments[0]?.shift.id ||
          "",
        workOrderId: current.workOrderId || fallbackWorkOrderId,
      }));
      setClockOutForm((current) => ({
        ...current,
        workOrderId: current.workOrderId || fallbackWorkOrderId,
      }));
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 403 &&
        getErrorMessage(err).toLowerCase().includes("employee profile")
      ) {
        setData(null);
        setProfileMissing(true);
        return;
      }

      toast.error(getErrorMessage(err), "Could not load time clock");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function submitClockIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await staffApi.clockIn({
        shiftId: clockInForm.shiftId || undefined,
        workOrderId: clockInForm.workOrderId || undefined,
        notes: clockInForm.notes || undefined,
      });
      setClockInForm((current) => ({ ...current, notes: "" }));
      toast.success("Clock-in recorded.", "Clocked in");
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not clock in");
    } finally {
      setSaving(false);
    }
  }

  async function submitClockOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const proofPhotoUrls = clockOutForm.proofPhotoUrls
        .split(/\n|,/)
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await staffApi.clockOut({
        attendanceId: data?.activeAttendance?.id,
        workOrderId: clockOutForm.workOrderId || undefined,
        notes: clockOutForm.notes || undefined,
        proofNotes: clockOutForm.proofNotes || undefined,
        proofPhotoUrls: proofPhotoUrls.length ? proofPhotoUrls : undefined,
        completeWorkOrder: clockOutForm.completeWorkOrder,
      });

      setClockOutForm((current) => ({
        ...current,
        notes: "",
        proofNotes: "",
        proofPhotoUrls: "",
        completeWorkOrder: false,
      }));
      toast.success(
        `Clock-out recorded with ${response.proofPhotosCreated} proof item(s).`,
        "Clocked out",
      );
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err), "Could not clock out");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Clock"
        description="Staff clock-in, clock-out, and end-of-day work proof."
        eyebrow="Staff portal"
        actions={
          <Button
            type="button"
            variant="outline"
            loading={loading}
            onClick={() => void loadData()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {profileMissing ? (
          <Card className="xl:col-span-2">
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <UserRoundCheck className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                  Link this login to an employee profile
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Time clock records must attach to an active employee for
                  payroll. Create or update an employee profile with the same
                  email as this login, then refresh this page.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Setup steps
                </p>
                <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>1. Open Workforce.</li>
                  <li>
                    2. Add this user as an active employee using the login
                    email.
                  </li>
                  <li>3. Return here and refresh.</li>
                </ol>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <ButtonLink href="/dashboard/workforce" fullWidth>
                    Open Workforce
                  </ButtonLink>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => void loadData()}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Current shift"
                  action={
                    data?.activeAttendance ? (
                      <StatusPill status="CLOCKED IN" />
                    ) : (
                      <StatusPill status="OFF CLOCK" />
                    )
                  }
                />
                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Employee
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {data
                        ? `${data.employee.firstName} ${data.employee.lastName}`
                        : "Loading"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {data?.employee.employeeNumber}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Clock-in
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {formatDateTime(data?.activeAttendance?.clockInAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {duration(data?.activeAttendance?.clockInAt)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Work order
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {data?.activeAttendance?.workOrder?.workOrderNumber ??
                        "Not selected"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {data?.activeAttendance?.workOrder?.title ??
                        "General attendance"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Today activity"
                  action={<Clock3 className="h-4 w-4 text-slate-400" />}
                />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3 font-medium">Work order</th>
                        <th className="px-5 py-3 font-medium">Clock in</th>
                        <th className="px-5 py-3 font-medium">Clock out</th>
                        <th className="px-5 py-3 font-medium">Duration</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.todayAttendance ?? []).map((record) => (
                        <tr key={record.id}>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-900">
                              {record.workOrder?.workOrderNumber ?? "General"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {record.workOrder?.title ?? record.shift?.title}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatDateTime(record.clockInAt)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatDateTime(record.clockOutAt)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {duration(record.clockInAt, record.clockOutAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusPill status={record.status} />
                          </td>
                        </tr>
                      ))}
                      {!loading && !data?.todayAttendance.length && (
                        <tr>
                          <td
                            className="px-5 py-8 text-center text-slate-500"
                            colSpan={5}
                          >
                            No attendance recorded today.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {!data?.activeAttendance ? (
                <Card>
                  <CardHeader title="Clock in" />
                  <form className="space-y-4 p-5" onSubmit={submitClockIn}>
                    <select
                      className={selectClass}
                      value={clockInForm.shiftId}
                      onChange={(event) =>
                        setClockInForm((current) => ({
                          ...current,
                          shiftId: event.target.value,
                        }))
                      }
                    >
                      <option value="">No shift selected</option>
                      {assignedShifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.title} - {formatDateTime(shift.startAt)}
                        </option>
                      ))}
                    </select>
                    <select
                      className={selectClass}
                      value={clockInForm.workOrderId}
                      onChange={(event) =>
                        setClockInForm((current) => ({
                          ...current,
                          workOrderId: event.target.value,
                        }))
                      }
                    >
                      <option value="">General attendance</option>
                      {assignedWorkOrders.map((workOrder) => (
                        <option key={workOrder.id} value={workOrder.id}>
                          {workOrder.workOrderNumber} - {workOrder.title}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      label="Start notes"
                      value={clockInForm.notes}
                      onChange={(event) =>
                        setClockInForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Arrival note, site access, or crew status"
                    />
                    <Button type="submit" loading={saving} fullWidth>
                      <LogIn className="h-4 w-4" />
                      Clock in
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card>
                  <CardHeader
                    title="Clock out and proof"
                    action={<Camera className="h-4 w-4 text-slate-400" />}
                  />
                  <form className="space-y-4 p-5" onSubmit={submitClockOut}>
                    <select
                      className={selectClass}
                      value={clockOutForm.workOrderId}
                      onChange={(event) =>
                        setClockOutForm((current) => ({
                          ...current,
                          workOrderId: event.target.value,
                        }))
                      }
                    >
                      <option value="">General attendance</option>
                      {assignedWorkOrders.map((workOrder) => (
                        <option key={workOrder.id} value={workOrder.id}>
                          {workOrder.workOrderNumber} - {workOrder.title}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      label="Work completed"
                      value={clockOutForm.proofNotes}
                      onChange={(event) =>
                        setClockOutForm((current) => ({
                          ...current,
                          proofNotes: event.target.value,
                        }))
                      }
                      placeholder="Summarize what was completed before leaving the site"
                      required
                    />
                    <Textarea
                      label="Proof photo URLs"
                      hint="Paste one Cloudinary or S3 image URL per line."
                      value={clockOutForm.proofPhotoUrls}
                      onChange={(event) =>
                        setClockOutForm((current) => ({
                          ...current,
                          proofPhotoUrls: event.target.value,
                        }))
                      }
                    />
                    <Textarea
                      label="Manager notes"
                      value={clockOutForm.notes}
                      onChange={(event) =>
                        setClockOutForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Optional notes for payroll or operations"
                    />
                    <Checkbox
                      checked={clockOutForm.completeWorkOrder}
                      onChange={(event) =>
                        setClockOutForm((current) => ({
                          ...current,
                          completeWorkOrder: event.target.checked,
                        }))
                      }
                      label="Mark the linked work order complete"
                    />
                    <Button
                      type="submit"
                      loading={saving}
                      fullWidth
                      variant="secondary"
                    >
                      <LogOut className="h-4 w-4" />
                      Clock out
                    </Button>
                  </form>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
