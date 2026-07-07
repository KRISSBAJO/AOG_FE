"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [facilityForm, setFacilityForm] = useState(emptyFacilityForm);
  const [contactForm, setContactForm] = useState(emptyContactForm);

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
        ...emptyFacilityForm,
        customerId: form.customerId,
      }));
      setSelectedFacilityId(created.id);
      setCreateOpen(false);
      toast.success(`${created.name} was added.`, "Facility created");
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
              disabled={!facilities.length}
            >
              <UserRoundPlus className="h-4 w-4" />
              Add contact
            </Button>
            <Button onClick={() => setCreateOpen(true)} disabled={!customers.length}>
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
                      <Button className="mt-4" onClick={() => setCreateOpen(true)}>
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

      {/* Create facility */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New facility"
        description="Add an operating location under a customer account."
        icon={Building2}
      >
        <form onSubmit={createFacility} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}

            <DrawerSection title="Facility">
              <Select
                label="Customer"
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                value={facilityForm.customerId}
                onChange={(event) =>
                  setFacilityForm((form) => ({ ...form, customerId: event.target.value }))
                }
                disabled={!customers.length}
                required
              />
              <Input
                label="Facility name"
                value={facilityForm.name}
                onChange={(event) =>
                  setFacilityForm((form) => ({ ...form, name: event.target.value }))
                }
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Northgate Tower"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Type"
                  options={typeOptions}
                  value={facilityForm.type}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, type: event.target.value }))
                  }
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={facilityForm.status}
                  onChange={(event) =>
                    setFacilityForm((form) => ({ ...form, status: event.target.value }))
                  }
                />
              </div>
            </DrawerSection>

            <DrawerSection title="Location">
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
            </DrawerSection>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={!facilityForm.customerId}>
              <Plus className="h-4 w-4" />
              Save facility
            </Button>
          </div>
        </form>
      </Drawer>

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

            <Select
              label="Facility"
              options={facilities.map((facility) => ({
                value: facility.id,
                label: facility.name,
              }))}
              value={selectedFacilityId}
              onChange={(event) => setSelectedFacilityId(event.target.value)}
              disabled={!facilities.length}
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

async function copyInviteLink(inviteUrl: string) {
  try {
    await navigator.clipboard.writeText(inviteUrl);
  } catch {
    // Clipboard is a convenience only; the API still returns the URL.
  }
}
