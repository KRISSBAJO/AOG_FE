"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Plus, RefreshCw, Search } from "lucide-react";

import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { getErrorMessage } from "@/lib/api";
import { Customer, Facility, phase3Api } from "@/lib/phase3-api";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

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
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [facilityForm, setFacilityForm] = useState({
    customerId: "",
    name: "",
    type: "OFFICE",
    status: "ACTIVE",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "FACILITY_MANAGER",
    isPrimary: true,
  });

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

  async function createFacility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const created = await phase3Api.createFacility({
        ...facilityForm,
        code: undefined,
        city: facilityForm.city || undefined,
        state: facilityForm.state || undefined,
        postalCode: facilityForm.postalCode || undefined,
        country: facilityForm.country || undefined,
      });
      setFacilityForm((form) => ({
        customerId: form.customerId,
        name: "",
        type: "OFFICE",
        status: "ACTIVE",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      }));
      setSelectedFacilityId(created.id);
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createFacilityContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFacilityId) return;

    setContactSaving(true);
    setError(null);

    try {
      await phase3Api.createFacilityContact(selectedFacilityId, {
        ...contactForm,
        email: contactForm.email || undefined,
        phone: contactForm.phone || undefined,
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        role: "FACILITY_MANAGER",
        isPrimary: true,
      });
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
              placeholder="Search facilities"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                {!loading && facilities.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                      No facilities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create facility" />
            <form className="space-y-4 p-5" onSubmit={createFacility}>
              <select
                className={selectClass}
                value={facilityForm.customerId}
                onChange={(event) =>
                  setFacilityForm((form) => ({ ...form, customerId: event.target.value }))
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
                label="Facility name"
                value={facilityForm.name}
                onChange={(event) =>
                  setFacilityForm((form) => ({ ...form, name: event.target.value }))
                }
                icon={<Building2 className="h-4 w-4" />}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={facilityForm.type}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, type: event.target.value }))
                  }
                >
                  <option value="OFFICE">Office</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="RETAIL">Retail</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="EVENT_VENUE">Event venue</option>
                  <option value="PARKING_LOT">Parking lot</option>
                  <option value="OTHER">Other</option>
                </select>
                <select
                  className={selectClass}
                  value={facilityForm.status}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, status: event.target.value }))
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={facilityForm.city}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, city: event.target.value }))
                  }
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Input
                  label="State"
                  value={facilityForm.state}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, state: event.target.value }))
                  }
                />
              </div>
              <Input
                label="Postal code"
                value={facilityForm.postalCode}
                onChange={(event) =>
                  setFacilityForm((form) => ({ ...form, postalCode: event.target.value }))
                }
              />
              <Button type="submit" loading={saving} fullWidth disabled={!facilityForm.customerId}>
                <Plus className="h-4 w-4" />
                Save facility
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add facility contact" />
            <form className="space-y-4 p-5" onSubmit={createFacilityContact}>
              <select
                className={selectClass}
                value={selectedFacilityId}
                onChange={(event) => setSelectedFacilityId(event.target.value)}
                disabled={!facilities.length}
              >
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
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
              <Button
                type="submit"
                loading={contactSaving}
                fullWidth
                disabled={!selectedFacilityId}
                variant="secondary"
              >
                Save contact
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
