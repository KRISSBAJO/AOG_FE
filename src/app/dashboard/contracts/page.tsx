"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, FileText, Plus, RefreshCw, Search } from "lucide-react";

import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { getErrorMessage } from "@/lib/api";
import {
  Contract,
  Customer,
  Facility,
  Service,
  phase3Api,
} from "@/lib/phase3-api";
import { formatMoney } from "@/lib/formatters";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const contractStatuses = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "TERMINATED", "RENEWAL_PENDING"];
const billingFrequencies = ["ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL", "CUSTOM"];
const recurrenceFrequencies = ["NONE", "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString();
}

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
  const [selectedContractId, setSelectedContractId] = useState("");
  const [contractForm, setContractForm] = useState({
    customerId: "",
    title: "",
    startDate: todayIso(),
    endDate: "",
    billingFrequency: "MONTHLY",
  });
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
        customerId: form.customerId,
        title: "",
        startDate: todayIso(),
        endDate: "",
        billingFrequency: "MONTHLY",
      }));
      setSelectedContractId(created.id);
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
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description={`${total} contracts across customers, facilities, and recurring services.`}
        eyebrow="Customer operations"
        actions={
          <form
            className="flex w-full flex-col gap-2 sm:w-[460px] sm:flex-row"
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
            <Button type="submit" variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </form>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
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
                    onClick={() => {
                      router.push(`/dashboard/contracts/detail?id=${contract.id}`);
                    }}
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
                      {contract.billingFrequency.replaceAll("_", " ").toLowerCase()}
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
                {!loading && contracts.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                      No contracts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create contract" />
            <form className="space-y-4 p-5" onSubmit={createContract}>
              <select
                className={selectClass}
                value={contractForm.customerId}
                onChange={(event) =>
                  setContractForm((form) => ({ ...form, customerId: event.target.value }))
                }
                disabled={!customers.length}
                required
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <Input
                label="Title"
                value={contractForm.title}
                onChange={(event) =>
                  setContractForm((form) => ({ ...form, title: event.target.value }))
                }
                icon={<FileText className="h-4 w-4" />}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start"
                  type="date"
                  value={contractForm.startDate}
                  onChange={(event) =>
                    setContractForm((form) => ({ ...form, startDate: event.target.value }))
                  }
                  icon={<CalendarDays className="h-4 w-4" />}
                  required
                />
                <Input
                  label="End"
                  type="date"
                  value={contractForm.endDate}
                  onChange={(event) =>
                    setContractForm((form) => ({ ...form, endDate: event.target.value }))
                  }
                />
              </div>
              <select
                className={selectClass}
                value={contractForm.billingFrequency}
                onChange={(event) =>
                  setContractForm((form) => ({
                    ...form,
                    billingFrequency: event.target.value,
                  }))
                }
              >
                {billingFrequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency.replaceAll("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
              <Button type="submit" loading={saving} fullWidth disabled={!contractForm.customerId}>
                <Plus className="h-4 w-4" />
                Save contract
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Attach facility" />
            <form className="space-y-4 p-5" onSubmit={attachFacility}>
              <select
                className={selectClass}
                value={selectedContractId}
                onChange={(event) => setSelectedContractId(event.target.value)}
                disabled={!contracts.length}
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contractNumber} - {contract.title}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={facilityId}
                onChange={(event) => setFacilityId(event.target.value)}
                disabled={!matchingFacilities.length}
              >
                {matchingFacilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                loading={linkSaving}
                fullWidth
                disabled={!selectedContractId || !facilityId}
                variant="outline"
              >
                Attach facility
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add contract service" />
            <form className="space-y-4 p-5" onSubmit={addContractService}>
              <select
                className={selectClass}
                value={contractServiceForm.serviceId}
                onChange={(event) =>
                  setContractServiceForm((form) => ({ ...form, serviceId: event.target.value }))
                }
                disabled={!services.length}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={contractServiceForm.frequency}
                  onChange={(event) =>
                    setContractServiceForm((form) => ({
                      ...form,
                      frequency: event.target.value,
                    }))
                  }
                >
                  {recurrenceFrequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency.replaceAll("_", " ").toLowerCase()}
                    </option>
                  ))}
                </select>
                <Input
                  label="Quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={contractServiceForm.quantity}
                  onChange={(event) =>
                    setContractServiceForm((form) => ({
                      ...form,
                      quantity: event.target.value,
                    }))
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
              />
              <Button
                type="submit"
                loading={serviceSaving}
                fullWidth
                disabled={!selectedContractId || !contractServiceForm.serviceId}
                variant="secondary"
              >
                Add service
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Update status" />
            <form className="space-y-4 p-5" onSubmit={updateStatus}>
              <select
                className={selectClass}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {contractStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                loading={statusSaving}
                fullWidth
                disabled={!selectedContractId}
                variant="ghost"
              >
                Save status
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
