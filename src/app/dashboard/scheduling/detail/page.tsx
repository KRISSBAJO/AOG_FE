"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { schedulingApi, Shift } from "@/lib/api/scheduling";
import { formatDateTime, formatEnum } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function ShiftDetailPage() {
  const id = useQueryId();
  const [shift, setShift] = useState<Shift | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadShift() {
      try {
        setShift(await schedulingApi.getShift(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadShift();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a shift from the schedule.</Alert>}
      {!shift ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={shift.title} subtitle={formatEnum(shift.serviceLine)} status={shift.status} backHref="/dashboard/scheduling" />
          <DetailGrid
            title="Shift profile"
            items={[
              { label: "Department", value: shift.department?.name },
              { label: "Facility", value: shift.facility?.name },
              { label: "Work order", value: shift.workOrder?.workOrderNumber },
              { label: "Starts", value: formatDateTime(shift.startAt) },
              { label: "Ends", value: formatDateTime(shift.endAt) },
              { label: "Required staff", value: shift.requiredStaffCount },
              { label: "Assigned staff", value: shift.assignments?.length ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
