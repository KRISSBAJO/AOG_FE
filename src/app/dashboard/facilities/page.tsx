"use client";

import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Input,
  Select,
} from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { getErrorMessage } from "@/lib/api";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";
import { toast } from "@/lib/toast";

const typeOptions = [
  { value: "OFFICE", label: "Office" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "RETAIL", label: "Retail" },
  { value: "HOTEL", label: "Hotel" },
  { value: "EVENT_VENUE", label: "Event venue" },
  { value: "PARKING_LOT", label: "Parking lot" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "CLOSED", label: "Closed" },
];

const emptyFacilityForm = {
  customerId: "",
  name: "",
  type: "OFFICE",
  status: "ACTIVE",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

const emptyContactForm = {
  name: "",
  email: "",
  phone: "",
  role: "FACILITY_MANAGER",
  isPrimary: true,
  sendInvite: false,
};

export default function FacilitiesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [facilityMode, setFacilityMode] = useState<"create" | "edit">("create");
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null);
  const [facilityPickerOpen, setFacilityPickerOpen] = useState(false);
  const [facilityDeletingId, setFacilityDeletingId] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [facilityForm, setFacilityForm] = useState(emptyFacilityForm);
  const [contactForm, setContactForm] = useState(emptyContactForm);

  const activeFacilities = useMemo(
    () => facilities.filter((facility) => facility.status !== "ARCHIVED"),
    [facilities],
  );

  const selectedFacility = useMemo(
    () => activeFacilities.find((facility) => facility.id === selectedFacilityId),
    [activeFacilities, selectedFacilityId],
  );

  async function loadData(nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const [customerResponse, facilityResponse] = await Promise.all([
        phase3Api.listCustomers({ take: 100, status: "ACTIVE" }),
        phase3Api.listFacilities({ take: 50, search: nextSearch }),
      ]);
      setCustomers(customerResponse.data);
      setFacilities(facilityResponse.data);
      setTotal(facilityResponse.meta.total);
      setFacilityForm((form) => ({
        ...form,
        customerId: form.customerId || customerResponse.data[0]?.id || "",
      }));
      setSelectedFacilityId((current) => current || facilityResponse.data[0]?.id || "");
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

  function openCreateFacilityModal() {
    setError(null);
    setFacilityMode("create");
    setEditingFacilityId(null);
    setFacilityForm((form) => ({
      ...emptyFacilityForm,
      customerId: form.customerId || customers[0]?.id || "",
    }));
    setCreateOpen(true);
  }

  function openEditFacilityModal(facility: Facility) {
    const extendedFacility = facility as Facility & {
      postalCode?: string | null;
      country?: string | null;
    };
    setError(null);
    setFacilityMode("edit");
    setEditingFacilityId(facility.id);
    setFacilityForm({
      customerId: facility.customerId,
      name: facility.name,
      type: facility.type,
      status: facility.status === "ARCHIVED" ? "INACTIVE" : facility.status,
      city: facility.city ?? "",
      state: facility.state ?? "",
      postalCode: extendedFacility.postalCode ?? "",
      country: extendedFacility.country ?? "US",
    });
    setCreateOpen(true);
  }

  function closeFacilityModal() {
    setCreateOpen(false);
    setEditingFacilityId(null);
    setFacilityForm((form) => ({
      ...emptyFacilityForm,
      customerId: form.customerId,
    }));
  }

  async function saveFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...facilityForm,
        code: undefined,
        city: facilityForm.city || undefined,
        state: facilityForm.state || undefined,
        postalCode: facilityForm.postalCode || undefined,
        country: facilityForm.country || undefined,
      };
      const saved =
        facilityMode === "edit" && editingFacilityId
          ? await phase3Api.updateFacility(editingFacilityId, payload)
          : await phase3Api.createFacility(payload);

      setFacilityForm((form) => ({
        ...emptyFacilityForm,
        customerId: form.customerId,
      }));
      if (facilityMode === "create" || selectedFacilityId === saved.id) {
        setSelectedFacilityId(saved.id);
      }
      setCreateOpen(false);
      setEditingFacilityId(null);
      toast.success(
        facilityMode === "edit"
          ? `${saved.name} was updated.`
          : `${saved.name} was added and selected.`,
        facilityMode === "edit" ? "Facility updated" : "Facility created",
      );
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function archiveFacility(facility: Facility) {
    const contactCount = facility._count?.contacts ?? 0;
    const workOrderCount = facility._count?.workOrders ?? 0;
    const confirmed = window.confirm(
      contactCount || workOrderCount
        ? `Archive ${facility.name}? This facility has ${contactCount} contacts and ${workOrderCount} work orders.`
        : `Archive ${facility.name}?`,
    );

    if (!confirmed) return;

    setFacilityDeletingId(facility.id);
    setError(null);

    try {
      await phase3Api.archiveFacility(facility.id);
      if (selectedFacilityId === facility.id) {
        const fallback = activeFacilities.find((item) => item.id !== facility.id);
        setSelectedFacilityId(fallback?.id ?? "");
      }
      if (editingFacilityId === facility.id) {
        closeFacilityModal();
      }
      toast.success(`${facility.name} was archived.`, "Facility archived");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFacilityDeletingId(null);
    }
  }

  async function createFacilityContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFacilityId) return;

    setContactSaving(true);
    setError(null);

    try {
      const { sendInvite, ...contactInput } = contactForm;
      const contact = await phase3Api.createFacilityContact(selectedFacilityId, {
        ...contactInput,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
      });

      if (sendInvite && contact.email) {
        const invite = await phase3Api.inviteFacilityContact(contact.id);
        await copyInviteLink(invite.inviteUrl);
        toast.success(
          `Invite sent to ${invite.email}. The link was copied locally.`,
          "Portal invite ready",
        );
      }

      setContactForm(emptyContactForm);
      setContactOpen(false);
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setContactSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        description={`${total} operating locations mapped to customer accounts.`}
        eyebrow="Customer operations"
        actions={
          <>
            <form
              className="flex w-full gap-2 sm:w-72"
              onSubmit={(event) => {
                event.preventDefault();
                void loadData(search);
              }}
            >
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search facilities"
                icon={<Search className="h-4 w-4" />}
              />
              <Button type="submit" variant="outline" aria-label="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
            <Button
              variant="outline"
              onClick={() => setContactOpen(true)}
            >
              <UserRoundPlus className="h-4 w-4" />
              Add contact
            </Button>
            <Button onClick={openCreateFacilityModal} disabled={!customers.length}>
              <Plus className="h-4 w-4" />
              New facility
            </Button>
          </>
        }
      />

      {error && !createOpen && !contactOpen && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Facility register" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Facility</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Contacts</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilities.map((facility) => (
                <tr
                  key={facility.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/facilities/detail?id=${facility.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{facility.name}</p>
                    <p className="text-xs text-slate-400">{facility.code || facility.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {facility.customer?.name || "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {facility.type.replaceAll("_", " ").toLowerCase()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {[facility.city, facility.state].filter(Boolean).join(", ") || "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {facility._count?.contacts ?? 0}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={facility.status} />
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-400" colSpan={6}>
                    Loading facilities…
                  </td>
                </tr>
              )}
              {!loading && facilities.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={6}>
                    <p className="text-sm font-medium text-slate-900">No facilities yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {customers.length
                        ? "Add a facility to map a customer's locations."
                        : "Create a customer first, then add their facilities."}
                    </p>
                    {customers.length > 0 && (
                      <Button className="mt-4" onClick={openCreateFacilityModal}>
                        <Plus className="h-4 w-4" />
                        New facility
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <FacilityModal
        open={createOpen}
        mode={facilityMode}
        form={facilityForm}
        customers={customers}
        saving={saving}
        deleting={editingFacilityId === facilityDeletingId}
        error={error}
        editingFacility={facilities.find((facility) => facility.id === editingFacilityId)}
        onClose={closeFacilityModal}
        onSubmit={saveFacility}
        onDelete={(facility) => void archiveFacility(facility)}
        onChange={setFacilityForm}
      />

      {/* Add facility contact */}
      <Drawer
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Add facility contact"
        description="Add an on-site contact and optionally invite them to the portal."
        icon={UserRoundPlus}
      >
        <form onSubmit={createFacilityContact} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}

            <FacilityPicker
              facilities={activeFacilities}
              value={selectedFacilityId}
              selectedFacility={selectedFacility}
              search={facilitySearch}
              open={facilityPickerOpen}
              deletingFacilityId={facilityDeletingId}
              canCreate={customers.length > 0}
              onSearchChange={setFacilitySearch}
              onOpenChange={setFacilityPickerOpen}
              onSelect={setSelectedFacilityId}
              onCreate={openCreateFacilityModal}
              onEdit={openEditFacilityModal}
              onDelete={(facility) => void archiveFacility(facility)}
            />

            <DrawerSection title="Contact details">
              <Input
                label="Name"
                value={contactForm.name}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, name: event.target.value }))
                }
                required
              />
              <Input
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, email: event.target.value }))
                }
              />
              <Input
                label="Phone"
                value={contactForm.phone}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, phone: event.target.value }))
                }
              />
              <Checkbox
                checked={contactForm.sendInvite}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, sendInvite: event.target.checked }))
                }
                label="Give portal access and send invite"
              />
            </DrawerSection>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={contactSaving}
              disabled={!selectedFacilityId}
              variant="secondary"
            >
              {contactForm.sendInvite ? (
                <Send className="h-4 w-4" />
              ) : (
                <UserRoundPlus className="h-4 w-4" />
              )}
              {contactForm.sendInvite ? "Save and invite" : "Save contact"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

function FacilityPicker({
  facilities,
  value,
  selectedFacility,
  search,
  open,
  deletingFacilityId,
  canCreate,
  onSearchChange,
  onOpenChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  facilities: Facility[];
  value: string;
  selectedFacility?: Facility;
  search: string;
  open: boolean;
  deletingFacilityId?: string | null;
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (facilityId: string) => void;
  onCreate: () => void;
  onEdit: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredFacilities = facilities.filter((facility) => {
    if (!normalizedSearch) return true;
    return [
      facility.name,
      facility.customer?.name,
      facility.city,
      facility.state,
      facility.type,
      facility.code,
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">Facility</label>
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
            {selectedFacility?.name ?? "Select facility"}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {selectedFacility
              ? selectedFacility.customer?.name ||
                [selectedFacility.city, selectedFacility.state].filter(Boolean).join(", ") ||
                selectedFacility.type.replaceAll("_", " ").toLowerCase()
              : "Search, add, edit, or archive facilities"}
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
              placeholder="Search facilities"
              icon={<Search className="h-4 w-4" />}
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredFacilities.map((facility) => {
              const active = value === facility.id;
              return (
                <div
                  key={facility.id}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(facility.id);
                      onOpenChange(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {facility.name}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {facility.customer?.name ||
                        [facility.city, facility.state].filter(Boolean).join(", ") ||
                        facility.type.replaceAll("_", " ").toLowerCase()}
                      {facility._count?.contacts
                        ? ` · ${facility._count.contacts} contacts`
                        : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(facility)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label={`Edit ${facility.name}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(facility)}
                    disabled={deletingFacilityId === facility.id}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Archive ${facility.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {!filteredFacilities.length && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-900">No facilities found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a facility before saving an on-site contact.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={onCreate}
                  disabled={!canCreate}
                >
                  <Plus className="h-4 w-4" />
                  Add facility
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FacilityModal({
  open,
  mode,
  form,
  customers,
  saving,
  deleting,
  error,
  editingFacility,
  onClose,
  onSubmit,
  onDelete,
  onChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  form: typeof emptyFacilityForm;
  customers: Customer[];
  saving: boolean;
  deleting?: boolean;
  error?: string | null;
  editingFacility?: Facility;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (facility: Facility) => void;
  onChange: Dispatch<SetStateAction<typeof emptyFacilityForm>>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                {mode === "edit" ? "Edit facility" : "Add facility"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "edit"
                  ? "Update the operating location used for service work and contacts."
                  : "Create a facility and select it for this contact."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close facility modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-150px)] space-y-5 overflow-y-auto px-5 py-5">
          {error && <Alert tone="error">{error}</Alert>}
          {!customers.length && (
            <Alert>Create a customer before adding facilities.</Alert>
          )}
          <DrawerSection title="Facility">
            <Select
              label="Customer"
              options={customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={form.customerId}
              onChange={(event) =>
                onChange((current) => ({ ...current, customerId: event.target.value }))
              }
              disabled={!customers.length}
              required
            />
            <Input
              label="Facility name"
              value={form.name}
              onChange={(event) =>
                onChange((current) => ({ ...current, name: event.target.value }))
              }
              icon={<Building2 className="h-4 w-4" />}
              placeholder="Northgate Tower"
              required
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type"
                options={typeOptions}
                value={form.type}
                onChange={(event) =>
                  onChange((current) => ({ ...current, type: event.target.value }))
                }
              />
              <Select
                label="Status"
                options={statusOptions}
                value={form.status}
                onChange={(event) =>
                  onChange((current) => ({ ...current, status: event.target.value }))
                }
              />
            </div>
          </DrawerSection>

          <DrawerSection title="Location">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={form.city}
                onChange={(event) =>
                  onChange((current) => ({ ...current, city: event.target.value }))
                }
                icon={<MapPin className="h-4 w-4" />}
              />
              <Input
                label="State"
                value={form.state}
                onChange={(event) =>
                  onChange((current) => ({ ...current, state: event.target.value }))
                }
              />
            </div>
            <Input
              label="Postal code"
              value={form.postalCode}
              onChange={(event) =>
                onChange((current) => ({ ...current, postalCode: event.target.value }))
              }
            />
          </DrawerSection>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" && editingFacility && (
              <Button
                type="button"
                variant="ghost"
                loading={deleting}
                onClick={() => onDelete(editingFacility)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!form.customerId}>
              <Plus className="h-4 w-4" />
              {mode === "edit" ? "Save changes" : "Create facility"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

async function copyInviteLink(inviteUrl: string) {
  try {
    await navigator.clipboard.writeText(inviteUrl);
  } catch {
    // Clipboard is a convenience only; the API still returns the URL.
  }
}
