"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  FileText,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import { Alert, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { getErrorMessage } from "@/lib/api";
import {
  Contract,
  Customer,
  Facility,
  Service,
  phase3Api,
} from "@/lib/phase3-api";
import { formatMoney } from "@/lib/formatters";
import { toast } from "@/lib/toast";

const enumLabel = (value: string) => value.replaceAll("_", " ").toLowerCase();

const statusOptions = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "TERMINATED",
  "RENEWAL_PENDING",
].map((value) => ({ value, label: enumLabel(value) }));

const billingOptions = [
  "ONE_TIME",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "ANNUAL",
  "CUSTOM",
].map((value) => ({ value, label: enumLabel(value) }));

const recurrenceOptions = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "CUSTOM",
].map((value) => ({ value, label: enumLabel(value) }));

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString();
}

const emptyContractForm = {
  customerId: "",
  title: "",
  startDate: todayIso(),
  endDate: "",
  billingFrequency: "MONTHLY",
};

export default function ContractsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const anyDrawerOpen = createOpen || facilityOpen || serviceOpen || statusOpen;

  const [selectedContractId, setSelectedContractId] = useState("");
  const [contractForm, setContractForm] = useState(emptyContractForm);
  const [facilityId, setFacilityId] = useState("");
  const [contractServiceForm, setContractServiceForm] = useState({
    serviceId: "",
    frequency: "WEEKLY",
    quantity: "1",
    price: "",
  });
  const [status, setStatus] = useState("ACTIVE");

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId),
    [contracts, selectedContractId],
  );

  const matchingFacilities = useMemo(() => {
    if (!selectedContract) return facilities;
    return facilities.filter((facility) => facility.customerId === selectedContract.customerId);
  }, [facilities, selectedContract]);

  const contractOptions = contracts.map((contract) => ({
    value: contract.id,
    label: `${contract.contractNumber} — ${contract.title}`,
  }));

  async function loadData(nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const [customerResponse, facilityResponse, serviceResponse, contractResponse] =
        await Promise.all([
          phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
          phase3Api.listFacilities({ take: 100, status: "ACTIVE" }),
          phase3Api.listServices({ take: 100, isActive: true }),
          phase3Api.listContracts({ take: 50, search: nextSearch }),
        ]);

      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setServices(serviceResponse.data);
      setContracts(contractResponse.data);
      setTotal(contractResponse.meta.total);
      setContractForm((form) => ({
        ...form,
        customerId: form.customerId || customerResponse.data[0]?.id || "",
      }));
      setSelectedContractId((current) => current || contractResponse.data[0]?.id || "");
      setFacilityId((current) => current || facilityResponse.data[0]?.id || "");
      setContractServiceForm((form) => ({
        ...form,
        serviceId: form.serviceId || serviceResponse.data[0]?.id || "",
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (matchingFacilities.length && !matchingFacilities.some((facility) => facility.id === facilityId)) {
      setFacilityId(matchingFacilities[0].id);
    }
  }, [facilityId, matchingFacilities]);

  useEffect(() => {
    if (selectedContract) setStatus(selectedContract.status);
  }, [selectedContract]);

  async function createContract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await phase3Api.createContract({
        ...contractForm,
        endDate: contractForm.endDate || undefined,
      });
      setContractForm((form) => ({
        ...emptyContractForm,
        customerId: form.customerId,
        startDate: todayIso(),
      }));
      setSelectedContractId(created.id);
      setCreateOpen(false);
      toast.success(`${created.title} was created.`, "Contract created");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function attachFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedContractId || !facilityId) return;

    setLinkSaving(true);
    setError(null);

    try {
      await phase3Api.addContractFacility(selectedContractId, facilityId);
      setFacilityOpen(false);
      toast.success("Facility attached to contract.", "Contract updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLinkSaving(false);
    }
  }

  async function addContractService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedContractId || !contractServiceForm.serviceId) return;

    setServiceSaving(true);
    setError(null);

    try {
      await phase3Api.createContractService(selectedContractId, {
        serviceId: contractServiceForm.serviceId,
        frequency: contractServiceForm.frequency,
        quantity: Number(contractServiceForm.quantity),
        price: contractServiceForm.price ? Number(contractServiceForm.price) : undefined,
      });
      setContractServiceForm((form) => ({ ...form, quantity: "1", price: "" }));
      setServiceOpen(false);
      toast.success("Service added to contract.", "Contract updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setServiceSaving(false);
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedContractId) return;

    setStatusSaving(true);
    setError(null);

    try {
      await phase3Api.updateContractStatus(selectedContractId, status);
      setStatusOpen(false);
      toast.success(`Status set to ${enumLabel(status)}.`, "Contract updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusSaving(false);
    }
  }

  const hasContracts = contracts.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description={`${total} contracts across customers, facilities, and recurring services.`}
        eyebrow="Customer operations"
        actions={
          <>
            <form
              className="flex w-full gap-2 sm:w-64"
              onSubmit={(event) => {
                event.preventDefault();
                void loadData(search);
              }}
            >
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search contracts"
                icon={<Search className="h-4 w-4" />}
              />
              <Button type="submit" variant="outline" aria-label="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
            <Button variant="outline" onClick={() => setFacilityOpen(true)} disabled={!hasContracts}>
              <Building2 className="h-4 w-4" />
              Attach facility
            </Button>
            <Button variant="outline" onClick={() => setServiceOpen(true)} disabled={!hasContracts}>
              <Wrench className="h-4 w-4" />
              Add service
            </Button>
            <Button variant="outline" onClick={() => setStatusOpen(true)} disabled={!hasContracts}>
              <SlidersHorizontal className="h-4 w-4" />
              Status
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={!customers.length}>
              <Plus className="h-4 w-4" />
              New contract
            </Button>
          </>
        }
      />

      {error && !anyDrawerOpen && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Contract portfolio" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Contract</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Term</th>
                <th className="px-5 py-3 font-medium">Billing</th>
                <th className="px-5 py-3 font-medium">Facilities</th>
                <th className="px-5 py-3 font-medium">Services</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/contracts/detail?id=${contract.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{contract.title}</p>
                    <p className="text-xs text-slate-400">{contract.contractNumber}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {contract.customer?.name || "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {enumLabel(contract.billingFrequency)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {contract._count?.facilities ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {contract._count?.services ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {contract.totalValue
                      ? formatMoney(contract.totalValue, contract.currency)
                      : "Not priced"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={contract.status} />
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-400" colSpan={8}>
                    Loading contracts…
                  </td>
                </tr>
              )}
              {!loading && contracts.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={8}>
                    <p className="text-sm font-medium text-slate-900">No contracts yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {customers.length
                        ? "Create a contract to bundle facilities and recurring services."
                        : "Add a customer first, then create their contract."}
                    </p>
                    {customers.length > 0 && (
                      <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" />
                        New contract
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create contract */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New contract"
        description="Set the customer, term, and billing cadence."
        icon={FileText}
      >
        <form onSubmit={createContract} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <DrawerSection title="Contract">
              <Select
                label="Customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                value={contractForm.customerId}
                onChange={(event) =>
                  setContractForm((form) => ({ ...form, customerId: event.target.value }))
                }
                disabled={!customers.length}
                required
              />
              <Input
                label="Title"
                value={contractForm.title}
                onChange={(event) =>
                  setContractForm((form) => ({ ...form, title: event.target.value }))
                }
                icon={<FileText className="h-4 w-4" />}
                placeholder="Nightly cleaning — Northgate"
                required
              />
            </DrawerSection>

            <DrawerSection title="Term & billing">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start date"
                  type="date"
                  value={contractForm.startDate}
                  onChange={(event) =>
                    setContractForm((form) => ({ ...form, startDate: event.target.value }))
                  }
                  icon={<CalendarDays className="h-4 w-4" />}
                  required
                />
                <Input
                  label="End date"
                  type="date"
                  value={contractForm.endDate}
                  onChange={(event) =>
                    setContractForm((form) => ({ ...form, endDate: event.target.value }))
                  }
                />
              </div>
              <Select
                label="Billing frequency"
                options={billingOptions}
                value={contractForm.billingFrequency}
                onChange={(event) =>
                  setContractForm((form) => ({ ...form, billingFrequency: event.target.value }))
                }
              />
            </DrawerSection>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!contractForm.customerId}>
              <Plus className="h-4 w-4" />
              Save contract
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Attach facility */}
      <Drawer
        open={facilityOpen}
        onClose={() => setFacilityOpen(false)}
        title="Attach facility"
        description="Link a facility to a contract."
        icon={Building2}
      >
        <form onSubmit={attachFacility} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Contract"
              options={contractOptions}
              value={selectedContractId}
              onChange={(event) => setSelectedContractId(event.target.value)}
              disabled={!hasContracts}
            />
            <Select
              label="Facility"
              options={matchingFacilities.map((facility) => ({
                value: facility.id,
                label: facility.name,
              }))}
              value={facilityId}
              onChange={(event) => setFacilityId(event.target.value)}
              disabled={!matchingFacilities.length}
            />
            {selectedContract && !matchingFacilities.length && (
              <p className="text-sm text-slate-500">
                This customer has no active facilities yet. Add one on the
                Facilities page first.
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setFacilityOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={linkSaving}
              disabled={!selectedContractId || !facilityId}
              variant="secondary"
            >
              <Building2 className="h-4 w-4" />
              Attach facility
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Add contract service */}
      <Drawer
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        title="Add contract service"
        description="Add a recurring service line to a contract."
        icon={Wrench}
      >
        <form onSubmit={addContractService} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Contract"
              options={contractOptions}
              value={selectedContractId}
              onChange={(event) => setSelectedContractId(event.target.value)}
              disabled={!hasContracts}
            />
            <Select
              label="Service"
              options={services.map((service) => ({
                value: service.id,
                label: service.name,
              }))}
              value={contractServiceForm.serviceId}
              onChange={(event) =>
                setContractServiceForm((form) => ({ ...form, serviceId: event.target.value }))
              }
              disabled={!services.length}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Frequency"
                options={recurrenceOptions}
                value={contractServiceForm.frequency}
                onChange={(event) =>
                  setContractServiceForm((form) => ({ ...form, frequency: event.target.value }))
                }
              />
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.01"
                value={contractServiceForm.quantity}
                onChange={(event) =>
                  setContractServiceForm((form) => ({ ...form, quantity: event.target.value }))
                }
                required
              />
            </div>
            <Input
              label="Price override"
              type="number"
              min="0"
              step="0.01"
              value={contractServiceForm.price}
              onChange={(event) =>
                setContractServiceForm((form) => ({ ...form, price: event.target.value }))
              }
              placeholder="Leave blank to use service price"
            />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setServiceOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={serviceSaving}
              disabled={!selectedContractId || !contractServiceForm.serviceId}
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              Add service
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Update status */}
      <Drawer
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Update status"
        description="Change the lifecycle status of a contract."
        icon={SlidersHorizontal}
      >
        <form onSubmit={updateStatus} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Contract"
              options={contractOptions}
              value={selectedContractId}
              onChange={(event) => setSelectedContractId(event.target.value)}
              disabled={!hasContracts}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={statusSaving}
              disabled={!selectedContractId}
              variant="secondary"
            >
              Save status
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
