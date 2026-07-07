"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { formatEnum } from "@/lib/formatters";
import { Customer, phase3Api } from "@/lib/phase3-api";
import { useQueryId } from "@/lib/use-query-id";

export default function CustomerDetailPage() {
  const id = useQueryId();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadCustomer() {
      try {
        setCustomer(await phase3Api.getCustomer(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadCustomer();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a customer from the customer table.</Alert>}
      {!customer ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader
            title={customer.name}
            subtitle={customer.billingEmail || customer.phone || customer.code || customer.id}
            status={customer.status}
            backHref="/dashboard/customers"
          />
          <DetailGrid
            title="Customer profile"
            items={[
              { label: "Type", value: formatEnum(customer.type) },
              { label: "Billing email", value: customer.billingEmail },
              { label: "Phone", value: customer.phone },
              { label: "City", value: customer.city },
              { label: "State", value: customer.state },
              { label: "Contacts", value: customer._count?.contacts ?? 0 },
              { label: "Facilities", value: customer._count?.facilities ?? 0 },
              { label: "Contracts", value: customer._count?.contracts ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
