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
import { Customer, phase3Api } from "@/lib/phase3-api";
import { toast } from "@/lib/toast";

const typeOptions = [
  { value: "COMPANY", label: "Company" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "NON_PROFIT", label: "Non profit" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "OTHER", label: "Other" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "LEAD", label: "Lead" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const emptyCustomerForm = {
  name: "",
  type: "COMPANY",
  status: "ACTIVE",
  billingEmail: "",
  phone: "",
  city: "",
  state: "",
};

const emptyContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  title: "",
  role: "FACILITY_REPRESENTATIVE",
  isPrimary: true,
  sendInvite: false,
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<"create" | "edit">("create");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [customerDeletingId, setCustomerDeletingId] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [contactForm, setContactForm] = useState(emptyContactForm);

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.status !== "ARCHIVED"),
    [customers],
  );

  const selectedCustomer = useMemo(
    () => activeCustomers.find((customer) => customer.id === selectedCustomerId),
    [activeCustomers, selectedCustomerId],
  );

  async function loadCustomers(nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const response = await phase3Api.listCustomers({
        search: nextSearch,
        take: 50,
      });
      setCustomers(response.data);
      setTotal(response.meta.total);
      setSelectedCustomerId((current) => current || response.data[0]?.id || "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreateCustomerModal() {
    setError(null);
    setCustomerMode("create");
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    setCreateOpen(true);
  }

  function openEditCustomerModal(customer: Customer) {
    setError(null);
    setCustomerMode("edit");
    setEditingCustomerId(customer.id);
    setCustomerForm({
      name: customer.name,
      type: customer.type,
      status: customer.status === "ARCHIVED" ? "INACTIVE" : customer.status,
      billingEmail: customer.billingEmail ?? "",
      phone: customer.phone ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
    });
    setCreateOpen(true);
  }

  function closeCustomerModal() {
    setCreateOpen(false);
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
  }

  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...customerForm,
        billingEmail: customerForm.billingEmail || undefined,
        phone: customerForm.phone || undefined,
        city: customerForm.city || undefined,
        state: customerForm.state || undefined,
      };
      const saved =
        customerMode === "edit" && editingCustomerId
          ? await phase3Api.updateCustomer(editingCustomerId, payload)
          : await phase3Api.createCustomer(payload);

      setCustomerForm(emptyCustomerForm);
      if (customerMode === "create" || selectedCustomerId === saved.id) {
        setSelectedCustomerId(saved.id);
      }
      setCreateOpen(false);
      setEditingCustomerId(null);
      toast.success(
        customerMode === "edit"
          ? `${saved.name} was updated.`
          : `${saved.name} was added and selected.`,
        customerMode === "edit" ? "Customer updated" : "Customer created",
      );
      await loadCustomers(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function archiveCustomer(customer: Customer) {
    const facilityCount = customer._count?.facilities ?? 0;
    const contactCount = customer._count?.contacts ?? 0;
    const confirmed = window.confirm(
      facilityCount || contactCount
        ? `Archive ${customer.name}? This customer has ${facilityCount} facilities and ${contactCount} contacts.`
        : `Archive ${customer.name}?`,
    );

    if (!confirmed) return;

    setCustomerDeletingId(customer.id);
    setError(null);

    try {
      await phase3Api.archiveCustomer(customer.id);
      if (selectedCustomerId === customer.id) {
        const fallback = activeCustomers.find((item) => item.id !== customer.id);
        setSelectedCustomerId(fallback?.id ?? "");
      }
      if (editingCustomerId === customer.id) {
        closeCustomerModal();
      }
      toast.success(`${customer.name} was archived.`, "Customer archived");
      await loadCustomers(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCustomerDeletingId(null);
    }
  }

  async function createContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomerId) return;

    setContactSaving(true);
    setError(null);

    try {
      const { sendInvite, ...contactInput } = contactForm;
      const contact = await phase3Api.createCustomerContact(selectedCustomerId, {
        ...contactInput,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        title: contactForm.title || undefined,
        canLogin: sendInvite,
      });

      if (sendInvite && contact.email) {
        const invite = await phase3Api.inviteCustomerContact(contact.id);
        await copyInviteLink(invite.inviteUrl);
        toast.success(
          `Invite sent to ${invite.email}. The link was copied locally.`,
          "Portal invite ready",
        );
      }

      setContactForm(emptyContactForm);
      setContactOpen(false);
      await loadCustomers(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setContactSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${total} customer accounts across the active workspace.`}
        eyebrow="Customer operations"
        actions={
          <>
            <form
              className="flex w-full gap-2 sm:w-72"
              onSubmit={(event) => {
                event.preventDefault();
                void loadCustomers(search);
              }}
            >
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers"
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
            <Button onClick={openCreateCustomerModal}>
              <Plus className="h-4 w-4" />
              New customer
            </Button>
          </>
        }
      />

      {error && !createOpen && !contactOpen && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Customer accounts" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Contacts</th>
                <th className="px-5 py-3 font-medium">Facilities</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/customers/detail?id=${customer.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-400">
                      {customer.billingEmail || customer.phone || customer.code || customer.id}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {customer.type.replaceAll("_", " ").toLowerCase()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {[customer.city, customer.state].filter(Boolean).join(", ") || "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {customer._count?.contacts ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {customer._count?.facilities ?? 0}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={customer.status} />
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-400" colSpan={6}>
                    Loading customers…
                  </td>
                </tr>
              )}
              {!loading && customers.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={6}>
                    <p className="text-sm font-medium text-slate-900">No customers yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add your first customer account to start building contracts.
                    </p>
                    <Button className="mt-4" onClick={openCreateCustomerModal}>
                      <Plus className="h-4 w-4" />
                      New customer
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CustomerModal
        open={createOpen}
        mode={customerMode}
        form={customerForm}
        saving={saving}
        deleting={editingCustomerId === customerDeletingId}
        error={error}
        editingCustomer={customers.find((customer) => customer.id === editingCustomerId)}
        onClose={closeCustomerModal}
        onSubmit={saveCustomer}
        onDelete={(customer) => void archiveCustomer(customer)}
        onChange={setCustomerForm}
      />

      {/* Add contact */}
      <Drawer
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Add contact"
        description="Add a contact and optionally invite them to the portal."
        icon={UserRoundPlus}
      >
        <form onSubmit={createContact} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}

            <CustomerPicker
              customers={activeCustomers}
              value={selectedCustomerId}
              selectedCustomer={selectedCustomer}
              search={customerSearch}
              open={customerPickerOpen}
              deletingCustomerId={customerDeletingId}
              onSearchChange={setCustomerSearch}
              onOpenChange={setCustomerPickerOpen}
              onSelect={setSelectedCustomerId}
              onCreate={openCreateCustomerModal}
              onEdit={openEditCustomerModal}
              onDelete={(customer) => void archiveCustomer(customer)}
            />

            <DrawerSection title="Contact details">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  value={contactForm.firstName}
                  onChange={(event) =>
                    setContactForm((form) => ({ ...form, firstName: event.target.value }))
                  }
                  required
                />
                <Input
                  label="Last name"
                  value={contactForm.lastName}
                  onChange={(event) =>
                    setContactForm((form) => ({ ...form, lastName: event.target.value }))
                  }
                  required
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, email: event.target.value }))
                }
              />
              <Input
                label="Title"
                value={contactForm.title}
                onChange={(event) =>
                  setContactForm((form) => ({ ...form, title: event.target.value }))
                }
                placeholder="Facilities Manager"
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
              disabled={!selectedCustomerId}
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

function CustomerPicker({
  customers,
  value,
  selectedCustomer,
  search,
  open,
  deletingCustomerId,
  onSearchChange,
  onOpenChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  customers: Customer[];
  value: string;
  selectedCustomer?: Customer;
  search: string;
  open: boolean;
  deletingCustomerId?: string | null;
  onSearchChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (customerId: string) => void;
  onCreate: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedSearch) return true;
    return [
      customer.name,
      customer.billingEmail,
      customer.phone,
      customer.city,
      customer.state,
      customer.type,
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">Customer</label>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
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
            {selectedCustomer?.name ?? "Select customer"}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {selectedCustomer
              ? [selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(", ") ||
                selectedCustomer.billingEmail ||
                selectedCustomer.type.replaceAll("_", " ").toLowerCase()
              : "Search, add, edit, or archive customer accounts"}
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
              placeholder="Search customers"
              icon={<Search className="h-4 w-4" />}
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredCustomers.map((customer) => {
              const active = value === customer.id;
              return (
                <div
                  key={customer.id}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(customer.id);
                      onOpenChange(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {customer.name}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {[customer.city, customer.state].filter(Boolean).join(", ") ||
                        customer.billingEmail ||
                        customer.type.replaceAll("_", " ").toLowerCase()}
                      {customer._count?.contacts
                        ? ` · ${customer._count.contacts} contacts`
                        : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(customer)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label={`Edit ${customer.name}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(customer)}
                    disabled={deletingCustomerId === customer.id}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Archive ${customer.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {!filteredCustomers.length && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-900">No customers found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a customer before saving a contact.
                </p>
                <Button type="button" size="sm" className="mt-3" onClick={onCreate}>
                  <Plus className="h-4 w-4" />
                  Add customer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerModal({
  open,
  mode,
  form,
  saving,
  deleting,
  error,
  editingCustomer,
  onClose,
  onSubmit,
  onDelete,
  onChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  form: typeof emptyCustomerForm;
  saving: boolean;
  deleting?: boolean;
  error?: string | null;
  editingCustomer?: Customer;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (customer: Customer) => void;
  onChange: Dispatch<SetStateAction<typeof emptyCustomerForm>>;
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
                {mode === "edit" ? "Edit customer" : "Add customer"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "edit"
                  ? "Update account details used across contacts, facilities, and contracts."
                  : "Create a customer account and select it for this contact."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close customer modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-150px)] space-y-5 overflow-y-auto px-5 py-5">
          {error && <Alert tone="error">{error}</Alert>}
          <DrawerSection title="Account">
            <Input
              label="Name"
              value={form.name}
              onChange={(event) =>
                onChange((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Acme Facilities Inc."
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

          <DrawerSection title="Billing & contact">
            <Input
              label="Billing email"
              type="email"
              value={form.billingEmail}
              onChange={(event) =>
                onChange((current) => ({ ...current, billingEmail: event.target.value }))
              }
              placeholder="billing@company.com"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(event) =>
                onChange((current) => ({ ...current, phone: event.target.value }))
              }
              placeholder="+1 (555) 000-0000"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={form.city}
                onChange={(event) =>
                  onChange((current) => ({ ...current, city: event.target.value }))
                }
              />
              <Input
                label="State"
                value={form.state}
                onChange={(event) =>
                  onChange((current) => ({ ...current, state: event.target.value }))
                }
              />
            </div>
          </DrawerSection>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" && editingCustomer && (
              <Button
                type="button"
                variant="ghost"
                loading={deleting}
                onClick={() => onDelete(editingCustomer)}
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
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              {mode === "edit" ? "Save changes" : "Create customer"}
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
