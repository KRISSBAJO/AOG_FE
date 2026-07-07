"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Layers,
  MapPinned,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";

import { Alert, Button, Card, CardHeader, Input, Select } from "@/components/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Drawer, DrawerSection } from "@/components/dashboard/Drawer";
import { getErrorMessage } from "@/lib/api";
import {
  Service,
  ServiceArea,
  ServiceCategory,
  phase3Api,
} from "@/lib/phase3-api";
import { formatMoney } from "@/lib/formatters";
import { toast } from "@/lib/toast";

const enumLabel = (value: string) => value.replaceAll("_", " ").toLowerCase();

const serviceLineOptions = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT_SETUP",
  "FACILITY_SUPPORT",
  "OTHER",
].map((value) => ({ value, label: enumLabel(value) }));

const unitOptions = [
  "HOUR",
  "DAY",
  "SHIFT",
  "VISIT",
  "EVENT",
  "SQFT",
  "MONTH",
  "UNIT",
].map((value) => ({ value, label: enumLabel(value) }));

const emptyCategoryForm = { name: "", serviceLine: "CLEANING", description: "" };
const emptyServiceForm = {
  categoryId: "",
  code: "",
  name: "",
  serviceLine: "CLEANING",
  defaultUnit: "VISIT",
  basePrice: "",
  estimatedDurationMinutes: "",
};
const emptyPriceForm = {
  serviceId: "",
  name: "Standard rate",
  amount: "",
  unit: "VISIT",
  isDefault: true,
};
const emptyAreaForm = { name: "", city: "", state: "", postalCode: "", country: "US" };

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceSaving, setPriceSaving] = useState(false);
  const [areaSaving, setAreaSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const anyDrawerOpen = categoryOpen || serviceOpen || priceOpen || areaOpen;

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [priceForm, setPriceForm] = useState(emptyPriceForm);
  const [areaForm, setAreaForm] = useState(emptyAreaForm);

  const activeServices = useMemo(
    () => services.filter((service) => service.isActive),
    [services],
  );

  async function loadData(nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const [categoryResponse, serviceResponse, areaResponse] = await Promise.all([
        phase3Api.listServiceCategories({ take: 100, isActive: true }),
        phase3Api.listServices({ take: 50, search: nextSearch }),
        phase3Api.listServiceAreas({ take: 20, isActive: true }),
      ]);
      setCategories(categoryResponse.data);
      setServices(serviceResponse.data);
      setAreas(areaResponse.data);
      setTotal(serviceResponse.meta.total);
      setServiceForm((form) => ({
        ...form,
        categoryId: form.categoryId || categoryResponse.data[0]?.id || "",
        serviceLine: form.serviceLine || categoryResponse.data[0]?.serviceLine || "CLEANING",
      }));
      setPriceForm((form) => ({
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

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const category = await phase3Api.createServiceCategory({
        ...categoryForm,
        description: categoryForm.description || undefined,
      });
      setCategoryForm(emptyCategoryForm);
      setServiceForm((form) => ({
        ...form,
        categoryId: category.id,
        serviceLine: category.serviceLine,
      }));
      setCategoryOpen(false);
      toast.success(`${category.name} was added.`, "Category created");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const service = await phase3Api.createService({
        ...serviceForm,
        categoryId: serviceForm.categoryId || undefined,
        code: serviceForm.code || undefined,
        basePrice: serviceForm.basePrice ? Number(serviceForm.basePrice) : undefined,
        estimatedDurationMinutes: serviceForm.estimatedDurationMinutes
          ? Number(serviceForm.estimatedDurationMinutes)
          : undefined,
      });
      setServiceForm((form) => ({
        ...emptyServiceForm,
        categoryId: form.categoryId,
        serviceLine: form.serviceLine,
      }));
      setPriceForm((form) => ({ ...form, serviceId: service.id }));
      setServiceOpen(false);
      toast.success(`${service.name} was added.`, "Service created");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function createPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!priceForm.serviceId) return;

    setPriceSaving(true);
    setError(null);

    try {
      await phase3Api.createServicePrice(priceForm.serviceId, {
        name: priceForm.name,
        amount: Number(priceForm.amount),
        unit: priceForm.unit,
        isDefault: priceForm.isDefault,
      });
      setPriceForm((form) => ({ ...form, name: "Standard rate", amount: "" }));
      setPriceOpen(false);
      toast.success("Price rule saved.", "Pricing updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPriceSaving(false);
    }
  }

  async function createArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAreaSaving(true);
    setError(null);

    try {
      await phase3Api.createServiceArea({
        ...areaForm,
        city: areaForm.city || undefined,
        state: areaForm.state || undefined,
        postalCode: areaForm.postalCode || undefined,
        country: areaForm.country || undefined,
      });
      setAreaForm(emptyAreaForm);
      setAreaOpen(false);
      toast.success("Service area saved.", "Coverage updated");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAreaSaving(false);
    }
  }

  function updateServiceCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    setServiceForm((form) => ({
      ...form,
      categoryId,
      serviceLine: category?.serviceLine ?? form.serviceLine,
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description={`${total} service definitions and ${areas.length} active service areas.`}
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
                placeholder="Search services"
                icon={<Search className="h-4 w-4" />}
              />
              <Button type="submit" variant="outline" aria-label="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
            <Button variant="outline" onClick={() => setCategoryOpen(true)}>
              <Layers className="h-4 w-4" />
              Category
            </Button>
            <Button
              variant="outline"
              onClick={() => setPriceOpen(true)}
              disabled={!activeServices.length}
            >
              <Tag className="h-4 w-4" />
              Price rule
            </Button>
            <Button variant="outline" onClick={() => setAreaOpen(true)}>
              <MapPinned className="h-4 w-4" />
              Area
            </Button>
            <Button onClick={() => setServiceOpen(true)}>
              <Plus className="h-4 w-4" />
              New service
            </Button>
          </>
        }
      />

      {error && !anyDrawerOpen && <Alert tone="error">{error}</Alert>}

      <Card>
        <CardHeader title="Service catalog" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Line</th>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Base price</th>
                <th className="px-5 py-3 font-medium">Price rules</th>
                <th className="px-5 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/dashboard/services/detail?id=${service.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-400">{service.code || service.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {service.category?.name || "Uncategorized"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {enumLabel(service.serviceLine)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {service.defaultUnit.toLowerCase()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {service.basePrice ? formatMoney(service.basePrice) : "Not set"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {service._count?.prices ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {service.isActive ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-400" colSpan={7}>
                    Loading services…
                  </td>
                </tr>
              )}
              {!loading && services.length === 0 && (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={7}>
                    <p className="text-sm font-medium text-slate-900">No services yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Define your first service to price and schedule work.
                    </p>
                    <Button className="mt-4" onClick={() => setServiceOpen(true)}>
                      <Plus className="h-4 w-4" />
                      New service
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New category */}
      <Drawer
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        title="New category"
        description="Group related services under a service line."
        icon={Layers}
      >
        <form onSubmit={createCategory} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Input
              label="Name"
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((form) => ({ ...form, name: event.target.value }))
              }
              placeholder="Daily janitorial"
              required
            />
            <Select
              label="Service line"
              options={serviceLineOptions}
              value={categoryForm.serviceLine}
              onChange={(event) =>
                setCategoryForm((form) => ({ ...form, serviceLine: event.target.value }))
              }
            />
          </div>
          <DrawerFooter onCancel={() => setCategoryOpen(false)} loading={saving}>
            Save category
          </DrawerFooter>
        </form>
      </Drawer>

      {/* New service */}
      <Drawer
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        title="New service"
        description="Define a service, its unit, and a base price."
        icon={Sparkles}
      >
        <form onSubmit={createService} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <DrawerSection title="Definition">
              <Select
                label="Category"
                options={[
                  { value: "", label: "No category" },
                  ...categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
                value={serviceForm.categoryId}
                onChange={(event) => updateServiceCategory(event.target.value)}
              />
              <Input
                label="Name"
                value={serviceForm.name}
                onChange={(event) =>
                  setServiceForm((form) => ({ ...form, name: event.target.value }))
                }
                icon={<Sparkles className="h-4 w-4" />}
                placeholder="Lobby deep clean"
                required
              />
              <Input
                label="Code"
                value={serviceForm.code}
                onChange={(event) =>
                  setServiceForm((form) => ({ ...form, code: event.target.value }))
                }
                placeholder="Optional internal code"
              />
            </DrawerSection>

            <DrawerSection title="Pricing & unit">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Service line"
                  options={serviceLineOptions}
                  value={serviceForm.serviceLine}
                  onChange={(event) =>
                    setServiceForm((form) => ({ ...form, serviceLine: event.target.value }))
                  }
                />
                <Select
                  label="Default unit"
                  options={unitOptions}
                  value={serviceForm.defaultUnit}
                  onChange={(event) =>
                    setServiceForm((form) => ({ ...form, defaultUnit: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Base price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={serviceForm.basePrice}
                  onChange={(event) =>
                    setServiceForm((form) => ({ ...form, basePrice: event.target.value }))
                  }
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <Input
                  label="Est. minutes"
                  type="number"
                  min="0"
                  value={serviceForm.estimatedDurationMinutes}
                  onChange={(event) =>
                    setServiceForm((form) => ({
                      ...form,
                      estimatedDurationMinutes: event.target.value,
                    }))
                  }
                />
              </div>
            </DrawerSection>
          </div>
          <DrawerFooter onCancel={() => setServiceOpen(false)} loading={saving}>
            Save service
          </DrawerFooter>
        </form>
      </Drawer>

      {/* Add price rule */}
      <Drawer
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        title="Add price rule"
        description="Attach a named rate to an existing service."
        icon={Tag}
      >
        <form onSubmit={createPrice} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Select
              label="Service"
              options={activeServices.map((service) => ({
                value: service.id,
                label: service.name,
              }))}
              value={priceForm.serviceId}
              onChange={(event) =>
                setPriceForm((form) => ({ ...form, serviceId: event.target.value }))
              }
              disabled={!activeServices.length}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rate name"
                value={priceForm.name}
                onChange={(event) =>
                  setPriceForm((form) => ({ ...form, name: event.target.value }))
                }
                required
              />
              <Input
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                value={priceForm.amount}
                onChange={(event) =>
                  setPriceForm((form) => ({ ...form, amount: event.target.value }))
                }
                icon={<DollarSign className="h-4 w-4" />}
                required
              />
            </div>
            <Select
              label="Unit"
              options={unitOptions}
              value={priceForm.unit}
              onChange={(event) =>
                setPriceForm((form) => ({ ...form, unit: event.target.value }))
              }
            />
          </div>
          <DrawerFooter
            onCancel={() => setPriceOpen(false)}
            loading={priceSaving}
            disabled={!priceForm.serviceId}
            variant="secondary"
          >
            Save price rule
          </DrawerFooter>
        </form>
      </Drawer>

      {/* New service area */}
      <Drawer
        open={areaOpen}
        onClose={() => setAreaOpen(false)}
        title="New service area"
        description="Define a geography your teams cover."
        icon={MapPinned}
      >
        <form onSubmit={createArea} className="flex h-full flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {error && <Alert tone="error">{error}</Alert>}
            <Input
              label="Name"
              value={areaForm.name}
              onChange={(event) => setAreaForm((form) => ({ ...form, name: event.target.value }))}
              placeholder="Downtown metro"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={areaForm.city}
                onChange={(event) =>
                  setAreaForm((form) => ({ ...form, city: event.target.value }))
                }
              />
              <Input
                label="State"
                value={areaForm.state}
                onChange={(event) =>
                  setAreaForm((form) => ({ ...form, state: event.target.value }))
                }
              />
            </div>
          </div>
          <DrawerFooter
            onCancel={() => setAreaOpen(false)}
            loading={areaSaving}
            variant="secondary"
          >
            Save area
          </DrawerFooter>
        </form>
      </Drawer>
    </div>
  );
}

function DrawerFooter({
  onCancel,
  loading,
  disabled,
  variant = "primary",
  children,
}: {
  onCancel: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={loading} disabled={disabled} variant={variant}>
        <Plus className="h-4 w-4" />
        {children}
      </Button>
    </div>
  );
}
