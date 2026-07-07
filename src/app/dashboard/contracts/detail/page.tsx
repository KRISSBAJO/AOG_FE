"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatEnum, formatMoney } from "@/lib/formatters";
import { Contract, phase3Api } from "@/lib/phase3-api";
import { useQueryId } from "@/lib/use-query-id";

export default function ContractDetailPage() {
  const id = useQueryId();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadContract() {
      try {
        setContract(await phase3Api.getContract(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadContract();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a contract from the contract table.</Alert>}
      {!contract ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={contract.title} subtitle={contract.contractNumber} status={contract.status} backHref="/dashboard/contracts" />
          <DetailGrid
            title="Contract profile"
            items={[
              { label: "Customer", value: contract.customer?.name },
              { label: "Start date", value: formatDate(contract.startDate) },
              { label: "End date", value: formatDate(contract.endDate) },
              { label: "Billing frequency", value: formatEnum(contract.billingFrequency) },
              { label: "Total value", value: contract.totalValue ? formatMoney(contract.totalValue, contract.currency) : "Not priced" },
              { label: "Facilities", value: contract._count?.facilities ?? 0 },
              { label: "Services", value: contract._count?.services ?? 0 },
              { label: "Schedules", value: contract._count?.schedules ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
