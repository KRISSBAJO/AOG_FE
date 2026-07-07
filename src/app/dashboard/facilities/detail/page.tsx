"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatEnum } from "@/lib/formatters";
import { Facility, phase3Api } from "@/lib/phase3-api";
import { useQueryId } from "@/lib/use-query-id";

export default function FacilityDetailPage() {
  const id = useQueryId();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadFacility() {
      try {
        setFacility(await phase3Api.getFacility(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadFacility();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a facility from the facility table.</Alert>}
      {!facility ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader
            title={facility.name}
            subtitle={facility.customer?.name || facility.code || facility.id}
            status={facility.status}
            backHref="/dashboard/facilities"
          />
          <DetailGrid
            title="Facility profile"
            items={[
              { label: "Customer", value: facility.customer?.name },
              { label: "Type", value: formatEnum(facility.type) },
              { label: "City", value: facility.city },
              { label: "State", value: facility.state },
              { label: "Contacts", value: facility._count?.contacts ?? 0 },
              { label: "Contract links", value: facility._count?.contractFacilities ?? 0 },
              { label: "Work orders", value: facility._count?.workOrders ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
