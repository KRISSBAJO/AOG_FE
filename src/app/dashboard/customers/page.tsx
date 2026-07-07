"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Send,
  UserRoundPlus,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [contactForm, setContactForm] = useState(emptyContactForm);

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.status !== "ARCHIVED"),
    [customers],
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

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await phase3Api.createCustomer({
        ...customerForm,
        billingEmail: customerForm.billingEmail || undefined,
        phone: customerForm.phone || undefined,
        city: customerForm.city || undefined,
        state: customerForm.state || undefined,
      });
      setCustomerForm(emptyCustomerForm);
      setSelectedCustomerId(created.id);
      setCreateOpen(false);
      toast.success(`${created.name} was added.`, "Customer created");
      await loadCustomers(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
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
              disabled={!activeCustomers.length}
            >
              <UserRoundPlus className="h-4 w-4" />
              Add contact
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
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
                    <Button className="mt-4" onClick={() => setCreateOpen(true)}>
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

      {/* Create customer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New customer"
        description="Create a customer account for contracts and facilities."
        icon={Building2}
      >
        <form onSubmit={createCustomer} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}

            <DrawerSection title="Account">
              <Input
                label="Name"
                value={customerForm.name}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, name: event.target.value }))
                }
                placeholder="Acme Facilities Inc."
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Type"
                  options={typeOptions}
                  value={customerForm.type}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, type: event.target.value }))
                  }
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={customerForm.status}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, status: event.target.value }))
                  }
                />
              </div>
            </DrawerSection>

            <DrawerSection title="Billing & contact">
              <Input
                label="Billing email"
                type="email"
                value={customerForm.billingEmail}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, billingEmail: event.target.value }))
                }
                placeholder="billing@company.com"
              />
              <Input
                label="Phone"
                value={customerForm.phone}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, phone: event.target.value }))
                }
                placeholder="+1 (555) 000-0000"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={customerForm.city}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, city: event.target.value }))
                  }
                />
                <Input
                  label="State"
                  value={customerForm.state}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, state: event.target.value }))
                  }
                />
              </div>
            </DrawerSection>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              Save customer
            </Button>
          </div>
        </form>
      </Drawer>

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

            <Select
              label="Customer"
              options={activeCustomers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              disabled={!activeCustomers.length}
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

async function copyInviteLink(inviteUrl: string) {
  try {
    await navigator.clipboard.writeText(inviteUrl);
  } catch {
    // Clipboard is a convenience only; the API still returns the URL.
  }
}
