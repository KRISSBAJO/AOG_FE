"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatEnum, formatMoney } from "@/lib/formatters";
import { Service, phase3Api } from "@/lib/phase3-api";
import { useQueryId } from "@/lib/use-query-id";

export default function ServiceDetailPage() {
  const id = useQueryId();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadService() {
      try {
        setService(await phase3Api.getService(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadService();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a service from the service catalog.</Alert>}
      {!service ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader
            title={service.name}
            subtitle={service.category?.name || service.code || service.id}
            status={service.isActive ? "ACTIVE" : "INACTIVE"}
            backHref="/dashboard/services"
          />
          <DetailGrid
            title="Service profile"
            items={[
              { label: "Service line", value: formatEnum(service.serviceLine) },
              { label: "Default unit", value: formatEnum(service.defaultUnit) },
              { label: "Base price", value: service.basePrice ? formatMoney(service.basePrice) : "Not set" },
              { label: "Estimated minutes", value: service.estimatedDurationMinutes },
              { label: "Bookable online", value: service.isBookableOnline ? "Yes" : "No" },
              { label: "Requires inspection", value: service.requiresInspection ? "Yes" : "No" },
              { label: "Price rules", value: service._count?.prices ?? 0 },
              { label: "Requirements", value: service._count?.requirements ?? 0 },
              { label: "Contracts", value: service._count?.contractServices ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
