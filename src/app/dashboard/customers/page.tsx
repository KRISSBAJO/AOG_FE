"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Search, UserRoundPlus } from "lucide-react";

import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { getErrorMessage } from "@/lib/api";
import { Customer, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    type: "COMPANY",
    status: "ACTIVE",
    billingEmail: "",
    phone: "",
    city: "",
    state: "",
  });
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    role: "FACILITY_REPRESENTATIVE",
    isPrimary: true,
  });

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
      setCustomerForm({
        name: "",
        type: "COMPANY",
        status: "ACTIVE",
        billingEmail: "",
        phone: "",
        city: "",
        state: "",
      });
      setSelectedCustomerId(created.id);
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
      await phase3Api.createCustomerContact(selectedCustomerId, {
        ...contactForm,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
        title: contactForm.title || undefined,
      });
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "",
        role: "FACILITY_REPRESENTATIVE",
        isPrimary: true,
      });
      await loadCustomers(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setContactSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} customer accounts across the active workspace.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
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
          <Button type="submit" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </form>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                {!loading && customers.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create customer" />
            <form className="space-y-4 p-5" onSubmit={createCustomer}>
              <Input
                label="Name"
                value={customerForm.name}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, name: event.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={customerForm.type}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, type: event.target.value }))
                  }
                >
                  <option value="COMPANY">Company</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="NON_PROFIT">Non profit</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="OTHER">Other</option>
                </select>
                <select
                  className={selectClass}
                  value={customerForm.status}
                  onChange={(event) =>
                    setCustomerForm((form) => ({ ...form, status: event.target.value }))
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="LEAD">Lead</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <Input
                label="Billing email"
                type="email"
                value={customerForm.billingEmail}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, billingEmail: event.target.value }))
                }
              />
              <Input
                label="Phone"
                value={customerForm.phone}
                onChange={(event) =>
                  setCustomerForm((form) => ({ ...form, phone: event.target.value }))
                }
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
              <Button type="submit" loading={saving} fullWidth>
                <Plus className="h-4 w-4" />
                Save customer
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add contact" />
            <form className="space-y-4 p-5" onSubmit={createContact}>
              <select
                className={selectClass}
                value={selectedCustomerId}
                onChange={(event) => setSelectedCustomerId(event.target.value)}
                disabled={!activeCustomers.length}
              >
                {activeCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
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
              />
              <Button
                type="submit"
                loading={contactSaving}
                fullWidth
                disabled={!selectedCustomerId}
                variant="secondary"
              >
                <UserRoundPlus className="h-4 w-4" />
                Save contact
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
