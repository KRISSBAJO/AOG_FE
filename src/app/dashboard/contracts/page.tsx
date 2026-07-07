"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
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
  const [contractSearch, setContractSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [contractMode, setContractMode] = useState<"create" | "edit">("create");
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [contractPickerOpen, setContractPickerOpen] = useState(false);
  const [contractDeletingId, setContractDeletingId] = useState<string | null>(null);
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

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status !== "TERMINATED"),
    [contracts],
  );

  const selectedContract = useMemo(
    () => activeContracts.find((contract) => contract.id === selectedContractId),
    [activeContracts, selectedContractId],
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

  function openCreateContractModal() {
    setError(null);
    setContractMode("create");
    setEditingContractId(null);
    setContractForm((form) => ({
      ...emptyContractForm,
      customerId: form.customerId || customers[0]?.id || "",
      startDate: todayIso(),
    }));
    setCreateOpen(true);
  }

  function openEditContractModal(contract: Contract) {
    setError(null);
    setContractMode("edit");
    setEditingContractId(contract.id);
    setContractForm({
      customerId: contract.customerId,
      title: contract.title,
      startDate: contract.startDate?.slice(0, 10) || todayIso(),
      endDate: contract.endDate?.slice(0, 10) || "",
      billingFrequency: contract.billingFrequency,
    });
    setCreateOpen(true);
  }

  function closeContractModal() {
    setCreateOpen(false);
    setEditingContractId(null);
    setContractForm((form) => ({
      ...emptyContractForm,
      customerId: form.customerId,
      startDate: todayIso(),
    }));
  }

  async function saveContract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...contractForm,
        endDate: contractForm.endDate || undefined,
      };
      const saved =
        contractMode === "edit" && editingContractId
          ? await phase3Api.updateContract(editingContractId, payload)
          : await phase3Api.createContract(payload);

      setContractForm((form) => ({
        ...emptyContractForm,
        customerId: form.customerId,
        startDate: todayIso(),
      }));
      if (contractMode === "create" || selectedContractId === saved.id) {
        setSelectedContractId(saved.id);
      }
      setCreateOpen(false);
      setEditingContractId(null);
      toast.success(
        contractMode === "edit"
          ? `${saved.title} was updated.`
          : `${saved.title} was created and selected.`,
        contractMode === "edit" ? "Contract updated" : "Contract created",
      );
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function terminateContract(contract: Contract) {
    const facilityCount = contract._count?.facilities ?? 0;
    const serviceCount = contract._count?.services ?? 0;
    const confirmed = window.confirm(
      facilityCount || serviceCount
        ? `Terminate ${contract.contractNumber}? It has ${facilityCount} facilities and ${serviceCount} services.`
        : `Terminate ${contract.contractNumber}?`,
    );

    if (!confirmed) return;

    setContractDeletingId(contract.id);
    setError(null);

    try {
      await phase3Api.terminateContract(contract.id);
      if (selectedContractId === contract.id) {
        const fallback = activeContracts.find((item) => item.id !== contract.id);
        setSelectedContractId(fallback?.id ?? "");
      }
      if (editingContractId === contract.id) {
        closeContractModal();
      }
      toast.success(`${contract.contractNumber} was terminated.`, "Contract terminated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setContractDeletingId(null);
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

  const hasContracts = activeContracts.length > 0;

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
            <Button variant="outline" onClick={() => setFacilityOpen(true)}>
              <Building2 className="h-4 w-4" />
              Attach facility
            </Button>
            <Button variant="outline" onClick={() => setServiceOpen(true)} disabled={!services.length}>
              <Wrench className="h-4 w-4" />
              Add service
            </Button>
            <Button variant="outline" onClick={() => setStatusOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
              Status
            </Button>
            <Button onClick={openCreateContractModal} disabled={!customers.length}>
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
                      <Button className="mt-4" onClick={openCreateContractModal}>
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
        onClose={closeContractModal}
        title={contractMode === "edit" ? "Edit contract" : "New contract"}
        description={
          contractMode === "edit"
            ? "Update the customer, term, and billing cadence."
            : "Set the customer, term, and billing cadence."
        }
        icon={FileText}
      >
        <form onSubmit={saveContract} className="flex h-full flex-col">
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
            {contractMode === "edit" && editingContractId && (
              <Button
                type="button"
                variant="ghost"
                loading={editingContractId === contractDeletingId}
                onClick={() => {
                  const contract = contracts.find((item) => item.id === editingContractId);
                  if (contract) void terminateContract(contract);
                }}
                className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Terminate
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={closeContractModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!contractForm.customerId}>
              <Plus className="h-4 w-4" />
              {contractMode === "edit" ? "Save changes" : "Save contract"}
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
            <ContractPicker
              contracts={activeContracts}
              value={selectedContractId}
              selectedContract={selectedContract}
              search={contractSearch}
              open={contractPickerOpen}
              deletingContractId={contractDeletingId}
              canCreate={customers.length > 0}
              onSearchChange={setContractSearch}
              onOpenChange={setContractPickerOpen}
              onSelect={setSelectedContractId}
              onCreate={openCreateContractModal}
              onEdit={openEditContractModal}
              onDelete={(contract) => void terminateContract(contract)}
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
            <ContractPicker
              contracts={activeContracts}
              value={selectedContractId}
              selectedContract={selectedContract}
              search={contractSearch}
              open={contractPickerOpen}
              deletingContractId={contractDeletingId}
              canCreate={customers.length > 0}
              onSearchChange={setContractSearch}
              onOpenChange={setContractPickerOpen}
              onSelect={setSelectedContractId}
              onCreate={openCreateContractModal}
              onEdit={openEditContractModal}
              onDelete={(contract) => void terminateContract(contract)}
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
            <ContractPicker
              contracts={activeContracts}
              value={selectedContractId}
              selectedContract={selectedContract}
              search={contractSearch}
              open={contractPickerOpen}
              deletingContractId={contractDeletingId}
              canCreate={customers.length > 0}
              onSearchChange={setContractSearch}
              onOpenChange={setContractPickerOpen}
              onSelect={setSelectedContractId}
              onCreate={openCreateContractModal}
              onEdit={openEditContractModal}
              onDelete={(contract) => void terminateContract(contract)}
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

function ContractPicker({
  contracts,
  value,
  selectedContract,
  search,
  open,
  deletingContractId,
  canCreate,
  onSearchChange,
  onOpenChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  contracts: Contract[];
  value: string;
  selectedContract?: Contract;
  search: string;
  open: boolean;
  deletingContractId?: string | null;
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (contractId: string) => void;
  onCreate: () => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredContracts = contracts.filter((contract) => {
    if (!normalizedSearch) return true;
    return [
      contract.contractNumber,
      contract.title,
      contract.customer?.name,
      contract.billingFrequency,
      contract.status,
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">Contract</label>
        <button
          type="button"
          onClick={onCreate}
          disabled={!canCreate}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 disabled:pointer-events-none disabled:text-slate-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 transition-colors hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {selectedContract
              ? `${selectedContract.contractNumber} - ${selectedContract.title}`
              : "Select contract"}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {selectedContract
              ? selectedContract.customer?.name ||
                enumLabel(selectedContract.billingFrequency)
              : "Search, add, edit, or terminate contracts"}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/12">
          <div className="border-b border-slate-100 p-3">
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search contracts"
              icon={<Search className="h-4 w-4" />}
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredContracts.map((contract) => {
              const active = value === contract.id;
              return (
                <div
                  key={contract.id}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(contract.id);
                      onOpenChange(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {contract.contractNumber} - {contract.title}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {contract.customer?.name || "No customer"} · {enumLabel(contract.status)}
                      {contract._count?.services
                        ? ` · ${contract._count.services} services`
                        : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(contract)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label={`Edit ${contract.contractNumber}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(contract)}
                    disabled={deletingContractId === contract.id}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Terminate ${contract.contractNumber}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {!filteredContracts.length && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-900">No contracts found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a contract before linking facilities or services.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={onCreate}
                  disabled={!canCreate}
                >
                  <Plus className="h-4 w-4" />
                  Add contract
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
