"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Incident, issuesApi } from "@/lib/api/issues";
import { formatDateTime, formatEnum } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function IncidentDetailPage() {
  const id = useQueryId();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadIncident() {
      try {
        setIncident(await issuesApi.getIncident(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadIncident();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select an incident from the incident list.</Alert>}
      {!incident ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={incident.title} subtitle={formatEnum(incident.type)} status={incident.status} backHref="/dashboard/issues" />
          <DetailGrid
            title="Incident profile"
            items={[
              { label: "Customer", value: incident.customer?.name },
              { label: "Facility", value: incident.facility?.name },
              { label: "Severity", value: formatEnum(incident.severity) },
              { label: "Occurred", value: formatDateTime(incident.occurredAt) },
              { label: "Resolved", value: formatDateTime(incident.resolvedAt) },
              { label: "Description", value: incident.description },
            ]}
          />
        </>
      )}
    </div>
  );
}
