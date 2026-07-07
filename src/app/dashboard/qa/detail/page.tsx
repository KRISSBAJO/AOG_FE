"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Inspection, qaApi } from "@/lib/api/qa";
import { formatDateTime } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function InspectionDetailPage() {
  const id = useQueryId();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadInspection() {
      try {
        setInspection(await qaApi.getInspection(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadInspection();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select an inspection from the QA queue.</Alert>}
      {!inspection ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={inspection.template?.name || "Ad hoc inspection"} subtitle={formatDateTime(inspection.createdAt)} status={inspection.status} backHref="/dashboard/qa" />
          <DetailGrid
            title="Inspection profile"
            items={[
              { label: "Facility", value: inspection.facility?.name },
              { label: "Work order", value: inspection.workOrder?.workOrderNumber },
              { label: "Score", value: inspection.score ?? "N/A" },
              { label: "Passed", value: inspection.passed === null || inspection.passed === undefined ? "Pending" : inspection.passed ? "Yes" : "No" },
              { label: "Results", value: inspection.itemResults?.length ?? 0 },
              { label: "Notes", value: inspection.notes },
            ]}
          />
        </>
      )}
    </div>
  );
}
