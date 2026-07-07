"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, Plus, RefreshCw } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { operationsApi, WorkOrder } from "@/lib/api/operations";
import { Inspection, InspectionTemplate, qaApi } from "@/lib/api/qa";
import { Facility, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const serviceLines = ["CLEANING", "SECURITY", "PARKING", "EVENT_SETUP", "FACILITY_SUPPORT", "OTHER"];
const resultValues = ["PASS", "FAIL", "NA"];

export default function QaPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", serviceLine: "CLEANING", description: "" });
  const [itemForm, setItemForm] = useState({ templateId: "", question: "", weight: "1" });
  const [inspectionForm, setInspectionForm] = useState({ templateId: "", facilityId: "", workOrderId: "" });
  const [resultForm, setResultForm] = useState({ inspectionId: "", question: "", result: "PASS", score: "100", notes: "" });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [templateResponse, inspectionResponse, facilityResponse, workOrderResponse] = await Promise.all([
        qaApi.listTemplates({ take: 100, isActive: true }),
        qaApi.listInspections({ take: 50 }),
        phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
        operationsApi.listWorkOrders({ take: 100 }),
      ]);
      setTemplates(templateResponse.data);
      setInspections(inspectionResponse.data);
      setFacilities(facilityResponse.data);
      setWorkOrders(workOrderResponse.data);
      setTotal(inspectionResponse.meta.total);
      setItemForm((current) => ({ ...current, templateId: current.templateId || templateResponse.data[0]?.id || "" }));
      setInspectionForm((current) => ({
        ...current,
        templateId: current.templateId || templateResponse.data[0]?.id || "",
        facilityId: current.facilityId || facilityResponse.data[0]?.id || "",
        workOrderId: current.workOrderId || workOrderResponse.data[0]?.id || "",
      }));
      setResultForm((current) => ({ ...current, inspectionId: current.inspectionId || inspectionResponse.data[0]?.id || "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const template = await qaApi.createTemplate({
        name: templateForm.name,
        serviceLine: templateForm.serviceLine,
        description: templateForm.description || undefined,
      });
      setTemplateForm((current) => ({ ...current, name: "", description: "" }));
      setItemForm((current) => ({ ...current, templateId: template.id }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addTemplateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemForm.templateId) return;
    setSaving(true);
    try {
      await qaApi.addTemplateItem(itemForm.templateId, {
        question: itemForm.question,
        weight: Number(itemForm.weight),
      });
      setItemForm((current) => ({ ...current, question: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createInspection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const inspection = await qaApi.createInspection({
        templateId: inspectionForm.templateId || undefined,
        facilityId: inspectionForm.facilityId || undefined,
        workOrderId: inspectionForm.workOrderId || undefined,
        status: "IN_PROGRESS",
      });
      setResultForm((current) => ({ ...current, inspectionId: inspection.id }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resultForm.inspectionId) return;
    setSaving(true);
    try {
      await qaApi.addResult(resultForm.inspectionId, {
        question: resultForm.question,
        result: resultForm.result,
        score: resultForm.score ? Number(resultForm.score) : undefined,
        notes: resultForm.notes || undefined,
      });
      setResultForm((current) => ({ ...current, question: "", notes: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function completeInspection(id: string, passed: boolean) {
    setSaving(true);
    try {
      await qaApi.completeInspection(id, { passed });
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Assurance"
        description={`${total} inspections with templates, scoring, and closeout.`}
        eyebrow="Field operations"
        actions={
          <Button type="button" variant="outline" onClick={() => void loadData()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader title="Inspection queue" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Inspection</th>
                  <th className="px-5 py-3 font-medium">Facility</th>
                  <th className="px-5 py-3 font-medium">Work order</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inspections.map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/dashboard/qa/detail?id=${inspection.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{inspection.template?.name || "Ad hoc inspection"}</p>
                      <p className="text-xs text-slate-400">{new Date(inspection.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{inspection.facility?.name || "Not set"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inspection.workOrder?.workOrderNumber || "Not linked"}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inspection.score ?? "N/A"}</td>
                    <td className="px-5 py-3.5"><StatusPill status={inspection.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="ghost" disabled={saving} onClick={(event) => { event.stopPropagation(); void completeInspection(inspection.id, true); }}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={(event) => { event.stopPropagation(); void completeInspection(inspection.id, false); }}>
                          Fail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && inspections.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No inspections found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create template" />
            <form className="space-y-4 p-5" onSubmit={createTemplate}>
              <Input label="Template name" value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} icon={<ClipboardCheck className="h-4 w-4" />} required />
              <select className={selectClass} value={templateForm.serviceLine} onChange={(event) => setTemplateForm((current) => ({ ...current, serviceLine: event.target.value }))}>
                {serviceLines.map((line) => <option key={line} value={line}>{line.replaceAll("_", " ").toLowerCase()}</option>)}
              </select>
              <Textarea label="Description" value={templateForm.description} onChange={(event) => setTemplateForm((current) => ({ ...current, description: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth><Plus className="h-4 w-4" />Save template</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Template item" />
            <form className="space-y-4 p-5" onSubmit={addTemplateItem}>
              <select className={selectClass} value={itemForm.templateId} onChange={(event) => setItemForm((current) => ({ ...current, templateId: event.target.value }))}>
                {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <Input label="Question" value={itemForm.question} onChange={(event) => setItemForm((current) => ({ ...current, question: event.target.value }))} required />
              <Button type="submit" loading={saving} fullWidth variant="outline" disabled={!itemForm.templateId}>Add question</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Create inspection" />
            <form className="space-y-4 p-5" onSubmit={createInspection}>
              <select className={selectClass} value={inspectionForm.templateId} onChange={(event) => setInspectionForm((current) => ({ ...current, templateId: event.target.value }))}>
                <option value="">No template</option>
                {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <select className={selectClass} value={inspectionForm.facilityId} onChange={(event) => setInspectionForm((current) => ({ ...current, facilityId: event.target.value }))}>
                <option value="">No facility</option>
                {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
              <select className={selectClass} value={inspectionForm.workOrderId} onChange={(event) => setInspectionForm((current) => ({ ...current, workOrderId: event.target.value }))}>
                <option value="">No work order</option>
                {workOrders.map((workOrder) => <option key={workOrder.id} value={workOrder.id}>{workOrder.workOrderNumber}</option>)}
              </select>
              <Button type="submit" loading={saving} fullWidth variant="secondary">Start inspection</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Inspection result" />
            <form className="space-y-4 p-5" onSubmit={addResult}>
              <select className={selectClass} value={resultForm.inspectionId} onChange={(event) => setResultForm((current) => ({ ...current, inspectionId: event.target.value }))}>
                {inspections.map((inspection) => <option key={inspection.id} value={inspection.id}>{inspection.template?.name || inspection.id}</option>)}
              </select>
              <Input label="Question" value={resultForm.question} onChange={(event) => setResultForm((current) => ({ ...current, question: event.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <select className={selectClass} value={resultForm.result} onChange={(event) => setResultForm((current) => ({ ...current, result: event.target.value }))}>
                  {resultValues.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <Input label="Score" type="number" min="0" value={resultForm.score} onChange={(event) => setResultForm((current) => ({ ...current, score: event.target.value }))} />
              </div>
              <Button type="submit" loading={saving} fullWidth variant="ghost" disabled={!resultForm.inspectionId}>Save result</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
