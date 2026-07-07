"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Complaint, issuesApi } from "@/lib/api/issues";
import { formatDateTime, formatEnum } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function ComplaintDetailPage() {
  const id = useQueryId();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadComplaint() {
      try {
        setComplaint(await issuesApi.getComplaint(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadComplaint();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a complaint from the issues table.</Alert>}
      {!complaint ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={complaint.title} subtitle={complaint.customer?.name} status={complaint.status} backHref="/dashboard/issues" />
          <DetailGrid
            title="Complaint profile"
            items={[
              { label: "Customer", value: complaint.customer?.name },
              { label: "Facility", value: complaint.facility?.name },
              { label: "Priority", value: formatEnum(complaint.priority) },
              { label: "Due", value: formatDateTime(complaint.dueAt) },
              { label: "Resolved", value: formatDateTime(complaint.resolvedAt) },
              { label: "Corrective actions", value: complaint._count?.correctiveActions ?? 0 },
              { label: "Description", value: complaint.description },
              { label: "Resolution", value: complaint.resolution },
            ]}
          />
        </>
      )}
    </div>
  );
}
