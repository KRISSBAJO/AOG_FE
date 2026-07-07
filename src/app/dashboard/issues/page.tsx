"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Plus, RefreshCw } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert, Button, Card, CardHeader, Input, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { Complaint, CorrectiveAction, Incident, issuesApi } from "@/lib/api/issues";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const priorities = ["LOW", "NORMAL", "HIGH", "URGENT", "EMERGENCY"];
const incidentTypes = ["CLEANING", "SECURITY", "PARKING", "STAFF", "CUSTOMER", "PROPERTY_DAMAGE", "HEALTH_SAFETY", "OTHER"];
const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function IssuesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaintForm, setComplaintForm] = useState({
    customerId: "",
    facilityId: "",
    priority: "NORMAL",
    title: "",
    description: "",
  });
  const [actionForm, setActionForm] = useState({ complaintId: "", title: "", dueAt: "" });
  const [incidentForm, setIncidentForm] = useState({
    customerId: "",
    facilityId: "",
    type: "OTHER",
    severity: "MEDIUM",
    title: "",
    description: "",
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, facilityResponse, complaintResponse, actionResponse, incidentResponse] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
        issuesApi.listComplaints({ take: 50 }),
        issuesApi.listCorrectiveActions({ take: 50 }),
        issuesApi.listIncidents({ take: 50 }),
      ]);
      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setComplaints(complaintResponse.data);
      setActions(actionResponse.data);
      setIncidents(incidentResponse.data);
      setComplaintForm((current) => ({ ...current, customerId: current.customerId || customerResponse.data[0]?.id || "" }));
      setIncidentForm((current) => ({ ...current, customerId: current.customerId || customerResponse.data[0]?.id || "" }));
      setActionForm((current) => ({ ...current, complaintId: current.complaintId || complaintResponse.data[0]?.id || "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function createComplaint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const complaint = await issuesApi.createComplaint({
        ...complaintForm,
        facilityId: complaintForm.facilityId || undefined,
      });
      setComplaintForm((current) => ({ ...current, title: "", description: "" }));
      setActionForm((current) => ({ ...current, complaintId: complaint.id }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createCorrectiveAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!actionForm.complaintId) return;
    setSaving(true);
    try {
      await issuesApi.createCorrectiveAction({
        complaintId: actionForm.complaintId,
        title: actionForm.title,
        dueAt: actionForm.dueAt || undefined,
      });
      setActionForm((current) => ({ ...current, title: "", dueAt: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await issuesApi.createIncident({
        ...incidentForm,
        customerId: incidentForm.customerId || undefined,
        facilityId: incidentForm.facilityId || undefined,
        occurredAt: new Date().toISOString(),
      });
      setIncidentForm((current) => ({ ...current, title: "", description: "" }));
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function resolveComplaint(id: string) {
    setSaving(true);
    try {
      await issuesApi.updateComplaintStatus(id, { status: "RESOLVED", resolution: "Resolved from operations dashboard." });
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
        title="Issues"
        description={`${complaints.length} complaints, ${actions.length} corrective actions, and ${incidents.length} incidents.`}
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
        <div className="space-y-6">
          <Card>
            <CardHeader title="Complaints" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Complaint</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Resolve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/dashboard/issues/detail?id=${complaint.id}`)}>
                      <td className="px-5 py-3.5"><p className="font-medium text-slate-900">{complaint.title}</p><p className="line-clamp-1 text-xs text-slate-400">{complaint.description}</p></td>
                      <td className="px-5 py-3.5 text-slate-600">{complaint.customer?.name || "Not set"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{complaint.priority.toLowerCase()}</td>
                      <td className="px-5 py-3.5 text-slate-600">{complaint._count?.correctiveActions ?? 0}</td>
                      <td className="px-5 py-3.5"><StatusPill status={complaint.status} /></td>
                      <td className="px-5 py-3.5">
                        <Button type="button" size="sm" variant="ghost" disabled={saving} onClick={(event) => { event.stopPropagation(); void resolveComplaint(complaint.id); }}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!loading && complaints.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No complaints found.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Incidents" />
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {incidents.map((incident) => (
                <button
                  key={incident.id}
                  type="button"
                  className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/issues/incident-detail?id=${incident.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{incident.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{incident.type.replaceAll("_", " ").toLowerCase()}</p>
                    </div>
                    <StatusPill status={incident.severity} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{incident.description}</p>
                </button>
              ))}
              {!loading && incidents.length === 0 && <p className="text-sm text-slate-500">No incidents found.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create complaint" />
            <form className="space-y-4 p-5" onSubmit={createComplaint}>
              <select className={selectClass} value={complaintForm.customerId} onChange={(event) => setComplaintForm((current) => ({ ...current, customerId: event.target.value }))} required>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
              <select className={selectClass} value={complaintForm.facilityId} onChange={(event) => setComplaintForm((current) => ({ ...current, facilityId: event.target.value }))}>
                <option value="">No facility</option>
                {facilities.filter((facility) => !complaintForm.customerId || facility.customerId === complaintForm.customerId).map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
              <select className={selectClass} value={complaintForm.priority} onChange={(event) => setComplaintForm((current) => ({ ...current, priority: event.target.value }))}>
                {priorities.map((priority) => <option key={priority} value={priority}>{priority.toLowerCase()}</option>)}
              </select>
              <Input label="Title" value={complaintForm.title} onChange={(event) => setComplaintForm((current) => ({ ...current, title: event.target.value }))} required />
              <Textarea label="Description" value={complaintForm.description} onChange={(event) => setComplaintForm((current) => ({ ...current, description: event.target.value }))} required />
              <Button type="submit" loading={saving} fullWidth><Plus className="h-4 w-4" />Save complaint</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Corrective action" />
            <form className="space-y-4 p-5" onSubmit={createCorrectiveAction}>
              <select className={selectClass} value={actionForm.complaintId} onChange={(event) => setActionForm((current) => ({ ...current, complaintId: event.target.value }))}>
                {complaints.map((complaint) => <option key={complaint.id} value={complaint.id}>{complaint.title}</option>)}
              </select>
              <Input label="Action title" value={actionForm.title} onChange={(event) => setActionForm((current) => ({ ...current, title: event.target.value }))} required />
              <Input label="Due date" type="datetime-local" value={actionForm.dueAt} onChange={(event) => setActionForm((current) => ({ ...current, dueAt: event.target.value }))} />
              <Button type="submit" loading={saving} fullWidth variant="outline" disabled={!actionForm.complaintId}>Add action</Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Create incident" />
            <form className="space-y-4 p-5" onSubmit={createIncident}>
              <Input label="Title" value={incidentForm.title} onChange={(event) => setIncidentForm((current) => ({ ...current, title: event.target.value }))} icon={<AlertTriangle className="h-4 w-4" />} required />
              <div className="grid grid-cols-2 gap-3">
                <select className={selectClass} value={incidentForm.type} onChange={(event) => setIncidentForm((current) => ({ ...current, type: event.target.value }))}>
                  {incidentTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>)}
                </select>
                <select className={selectClass} value={incidentForm.severity} onChange={(event) => setIncidentForm((current) => ({ ...current, severity: event.target.value }))}>
                  {severities.map((severity) => <option key={severity} value={severity}>{severity.toLowerCase()}</option>)}
                </select>
              </div>
              <Textarea label="Description" value={incidentForm.description} onChange={(event) => setIncidentForm((current) => ({ ...current, description: event.target.value }))} required />
              <Button type="submit" loading={saving} fullWidth variant="secondary">Save incident</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
