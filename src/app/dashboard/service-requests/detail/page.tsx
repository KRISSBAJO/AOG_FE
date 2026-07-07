"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, ServiceRequest } from "@/lib/api/operations";
import { formatDateTime, formatEnum, formatMoney } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function ServiceRequestDetailPage() {
  const id = useQueryId();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadRequest() {
      try {
        setRequest(await operationsApi.getServiceRequest(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadRequest();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a service request from the request table.</Alert>}
      {!request ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={request.title} subtitle={request.requestNumber} status={request.status} backHref="/dashboard/service-requests" />
          <DetailGrid
            title="Request profile"
            items={[
              { label: "Customer", value: request.customer?.name },
              { label: "Facility", value: request.facility?.name },
              { label: "Service line", value: formatEnum(request.serviceLine) },
              { label: "Priority", value: formatEnum(request.priority) },
              { label: "Requested start", value: formatDateTime(request.requestedStartAt) },
              { label: "Estimated amount", value: request.estimatedAmount ? formatMoney(request.estimatedAmount) : "Not priced" },
              { label: "Items", value: request._count?.items ?? 0 },
              { label: "Work orders", value: request._count?.workOrders ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
