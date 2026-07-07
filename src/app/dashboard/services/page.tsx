"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Plus, RefreshCw, Search, Sparkles } from "lucide-react";

import { Alert, Button, Card, CardHeader, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import {
  Service,
  ServiceArea,
  ServiceCategory,
  phase3Api,
} from "@/lib/phase3-api";
import { formatMoney } from "@/lib/formatters";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40";

const serviceLines = [
  "CLEANING",
  "SECURITY",
  "PARKING",
  "EVENT_SETUP",
  "FACILITY_SUPPORT",
  "OTHER",
];

const serviceUnits = ["HOUR", "DAY", "SHIFT", "VISIT", "EVENT", "SQFT", "MONTH", "UNIT"];

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
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    serviceLine: "CLEANING",
    description: "",
  });
  const [serviceForm, setServiceForm] = useState({
    categoryId: "",
    code: "",
    name: "",
    serviceLine: "CLEANING",
    defaultUnit: "VISIT",
    basePrice: "",
    estimatedDurationMinutes: "",
  });
  const [priceForm, setPriceForm] = useState({
    serviceId: "",
    name: "Standard rate",
    amount: "",
    unit: "VISIT",
    isDefault: true,
  });
  const [areaForm, setAreaForm] = useState({
    name: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

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
      setCategoryForm({ name: "", serviceLine: "CLEANING", description: "" });
      setServiceForm((form) => ({
        ...form,
        categoryId: category.id,
        serviceLine: category.serviceLine,
      }));
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
        categoryId: form.categoryId,
        code: "",
        name: "",
        serviceLine: form.serviceLine,
        defaultUnit: "VISIT",
        basePrice: "",
        estimatedDurationMinutes: "",
      }));
      setPriceForm((form) => ({ ...form, serviceId: service.id }));
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
      setAreaForm({ name: "", city: "", state: "", postalCode: "", country: "US" });
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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Services</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} service definitions and {areas.length} active service areas.
          </p>
        </div>
        <form
          className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row"
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
          <Button type="submit" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </form>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
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
                      {service.serviceLine.replaceAll("_", " ").toLowerCase()}
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
                {!loading && services.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={7}>
                      No services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Create category" />
            <form className="space-y-4 p-5" onSubmit={createCategory}>
              <Input
                label="Name"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((form) => ({ ...form, name: event.target.value }))
                }
                required
              />
              <select
                className={selectClass}
                value={categoryForm.serviceLine}
                onChange={(event) =>
                  setCategoryForm((form) => ({ ...form, serviceLine: event.target.value }))
                }
              >
                {serviceLines.map((line) => (
                  <option key={line} value={line}>
                    {line.replaceAll("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
              <Button type="submit" loading={saving} fullWidth>
                <Plus className="h-4 w-4" />
                Save category
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Create service" />
            <form className="space-y-4 p-5" onSubmit={createService}>
              <select
                className={selectClass}
                value={serviceForm.categoryId}
                onChange={(event) => updateServiceCategory(event.target.value)}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Input
                label="Name"
                value={serviceForm.name}
                onChange={(event) =>
                  setServiceForm((form) => ({ ...form, name: event.target.value }))
                }
                icon={<Sparkles className="h-4 w-4" />}
                required
              />
              <Input
                label="Code"
                value={serviceForm.code}
                onChange={(event) =>
                  setServiceForm((form) => ({ ...form, code: event.target.value }))
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={serviceForm.serviceLine}
                  onChange={(event) =>
                    setServiceForm((form) => ({ ...form, serviceLine: event.target.value }))
                  }
                >
                  {serviceLines.map((line) => (
                    <option key={line} value={line}>
                      {line.replaceAll("_", " ").toLowerCase()}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={serviceForm.defaultUnit}
                  onChange={(event) =>
                    setServiceForm((form) => ({ ...form, defaultUnit: event.target.value }))
                  }
                >
                  {serviceUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.toLowerCase()}
                    </option>
                  ))}
                </select>
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
                  label="Minutes"
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
              <Button type="submit" loading={saving} fullWidth variant="secondary">
                Save service
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add price rule" />
            <form className="space-y-4 p-5" onSubmit={createPrice}>
              <select
                className={selectClass}
                value={priceForm.serviceId}
                onChange={(event) =>
                  setPriceForm((form) => ({ ...form, serviceId: event.target.value }))
                }
                disabled={!activeServices.length}
              >
                {activeServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
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
                  required
                />
              </div>
              <Button
                type="submit"
                loading={priceSaving}
                fullWidth
                disabled={!priceForm.serviceId}
                variant="outline"
              >
                Save price
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Add service area" />
            <form className="space-y-4 p-5" onSubmit={createArea}>
              <Input
                label="Name"
                value={areaForm.name}
                onChange={(event) => setAreaForm((form) => ({ ...form, name: event.target.value }))}
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
              <Button type="submit" loading={areaSaving} fullWidth variant="ghost">
                Save area
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
