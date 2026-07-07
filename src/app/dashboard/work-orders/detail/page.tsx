"use client";

import { useEffect, useState } from "react";

import { DetailGrid, DetailHeader, DetailLoading } from "@/components/dashboard/DetailPanel";
import { Alert } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, WorkOrder } from "@/lib/api/operations";
import { formatDateTime, formatEnum } from "@/lib/formatters";
import { useQueryId } from "@/lib/use-query-id";

export default function WorkOrderDetailPage() {
  const id = useQueryId();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadWorkOrder() {
      try {
        setWorkOrder(await operationsApi.getWorkOrder(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }

    void loadWorkOrder();
  }, [id]);

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {!id && <Alert>Select a work order from the execution board.</Alert>}
      {!workOrder ? (
        id ? <DetailLoading /> : null
      ) : (
        <>
          <DetailHeader title={workOrder.title} subtitle={workOrder.workOrderNumber} status={workOrder.status} backHref="/dashboard/work-orders" />
          <DetailGrid
            title="Work order profile"
            items={[
              { label: "Customer", value: workOrder.customer?.name },
              { label: "Facility", value: workOrder.facility?.name },
              { label: "Service line", value: formatEnum(workOrder.serviceLine) },
              { label: "Priority", value: formatEnum(workOrder.priority) },
              { label: "Scheduled start", value: formatDateTime(workOrder.scheduledStartAt) },
              { label: "Scheduled end", value: formatDateTime(workOrder.scheduledEndAt) },
              { label: "QA required", value: workOrder.qaRequired ? "Yes" : "No" },
              { label: "QA passed", value: workOrder.qaPassed === null || workOrder.qaPassed === undefined ? "Pending" : workOrder.qaPassed ? "Yes" : "No" },
              { label: "Tasks", value: workOrder._count?.tasks ?? 0 },
              { label: "Assignments", value: workOrder._count?.assignments ?? 0 },
              { label: "Photos", value: workOrder._count?.photos ?? 0 },
            ]}
          />
        </>
      )}
    </div>
  );
}
