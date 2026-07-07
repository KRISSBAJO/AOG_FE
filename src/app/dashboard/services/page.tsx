"use client";

import {
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  DollarSign,
  Edit3,
  Layers,
  MapPinned,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { Alert, Button, Card, CardHeader, Input, Select, Textarea } from "@/components/ui";
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
  const [categorySearch, setCategorySearch] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"create" | "edit">("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categoryDeletingId, setCategoryDeletingId] = useState<string | null>(null);
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

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === serviceForm.categoryId),
    [categories, serviceForm.categoryId],
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

  function openCreateCategoryModal() {
    setError(null);
    setCategoryMode("create");
    setEditingCategoryId(null);
    setCategoryForm({
      ...emptyCategoryForm,
      serviceLine: serviceForm.serviceLine || "CLEANING",
    });
    setCategoryOpen(true);
  }

  function openEditCategoryModal(category: ServiceCategory) {
    setError(null);
    setCategoryMode("edit");
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      serviceLine: category.serviceLine,
      description: category.description ?? "",
    });
    setCategoryOpen(true);
  }

  function closeCategoryModal() {
    setCategoryOpen(false);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...categoryForm,
        description: categoryForm.description || undefined,
      };
      const category =
        categoryMode === "edit" && editingCategoryId
          ? await phase3Api.updateServiceCategory(editingCategoryId, payload)
          : await phase3Api.createServiceCategory(payload);

      setCategoryForm(emptyCategoryForm);
      setServiceForm((form) => ({
        ...form,
        categoryId:
          categoryMode === "create" || form.categoryId === category.id
            ? category.id
            : form.categoryId,
        serviceLine:
          categoryMode === "create" || form.categoryId === category.id
            ? category.serviceLine
            : form.serviceLine,
      }));
      setCategoryOpen(false);
      setEditingCategoryId(null);
      toast.success(
        categoryMode === "edit"
          ? `${category.name} was updated.`
          : `${category.name} was added and selected.`,
        categoryMode === "edit" ? "Category updated" : "Category created",
      );
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(category: ServiceCategory) {
    const serviceCount = category._count?.services ?? 0;
    const confirmed = window.confirm(
      serviceCount > 0
        ? `Archive ${category.name}? ${serviceCount} services currently use this category.`
        : `Archive ${category.name}?`,
    );

    if (!confirmed) return;

    setCategoryDeletingId(category.id);
    setError(null);

    try {
      await phase3Api.deactivateServiceCategory(category.id);
      if (serviceForm.categoryId === category.id) {
        setServiceForm((form) => ({ ...form, categoryId: "" }));
      }
      if (editingCategoryId === category.id) {
        closeCategoryModal();
      }
      toast.success(`${category.name} was archived.`, "Category archived");
      await loadData(search);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCategoryDeletingId(null);
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
            <Button variant="outline" onClick={openCreateCategoryModal}>
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

      <CategoryModal
        open={categoryOpen}
        mode={categoryMode}
        form={categoryForm}
        saving={saving}
        error={error}
        editingCategory={categories.find((category) => category.id === editingCategoryId)}
        deleting={editingCategoryId === categoryDeletingId}
        onClose={closeCategoryModal}
        onSubmit={saveCategory}
        onDelete={(category) => void deleteCategory(category)}
        onChange={setCategoryForm}
      />

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
              <CategoryPicker
                categories={categories}
                value={serviceForm.categoryId}
                selectedCategory={selectedCategory}
                search={categorySearch}
                onSearchChange={setCategorySearch}
                open={categoryPickerOpen}
                onOpenChange={setCategoryPickerOpen}
                onSelect={updateServiceCategory}
                onCreate={openCreateCategoryModal}
                onEdit={openEditCategoryModal}
                onDelete={deleteCategory}
                deletingCategoryId={categoryDeletingId}
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

function CategoryPicker({
  categories,
  value,
  selectedCategory,
  search,
  open,
  deletingCategoryId,
  onSearchChange,
  onOpenChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}: {
  categories: ServiceCategory[];
  value: string;
  selectedCategory?: ServiceCategory;
  search: string;
  open: boolean;
  deletingCategoryId?: string | null;
  onSearchChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (categoryId: string) => void;
  onCreate: () => void;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (category: ServiceCategory) => void;
}) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = categories.filter((category) => {
    if (!normalizedSearch) return true;
    return [category.name, category.description, category.serviceLine]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedSearch));
  });

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">Category</label>
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
            {selectedCategory?.name ?? "No category"}
          </span>
          <span className="block truncate text-xs text-slate-400">
            {selectedCategory
              ? enumLabel(selectedCategory.serviceLine)
              : "Select an existing category or add one"}
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
              placeholder="Search categories"
              icon={<Search className="h-4 w-4" />}
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onSelect("");
                onOpenChange(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
            >
              <span>
                <span className="block font-medium text-slate-800">No category</span>
                <span className="block text-xs text-slate-400">
                  Keep this service uncategorized
                </span>
              </span>
              {!value && <Check className="h-4 w-4 text-emerald-500" />}
            </button>

            {filteredCategories.map((category) => {
              const active = value === category.id;
              return (
                <div
                  key={category.id}
                  className="group flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(category.id);
                      onOpenChange(false);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {category.name}
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0 text-emerald-500" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {enumLabel(category.serviceLine)}
                      {category._count?.services ? ` · ${category._count.services} services` : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-slate-700"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    disabled={deletingCategoryId === category.id}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Archive ${category.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {!filteredCategories.length && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-900">No categories found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a category to organize this service line.
                </p>
                <Button type="button" size="sm" className="mt-3" onClick={onCreate}>
                  <Plus className="h-4 w-4" />
                  Add category
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryModal({
  open,
  mode,
  form,
  saving,
  deleting,
  error,
  editingCategory,
  onClose,
  onSubmit,
  onDelete,
  onChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  form: typeof emptyCategoryForm;
  saving: boolean;
  deleting?: boolean;
  error?: string | null;
  editingCategory?: ServiceCategory;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (category: ServiceCategory) => void;
  onChange: Dispatch<SetStateAction<typeof emptyCategoryForm>>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                {mode === "edit" ? "Edit category" : "Add category"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "edit"
                  ? "Update the category name, service line, or description."
                  : "Create a category and use it in the service form."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close category modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label="Name"
            value={form.name}
            onChange={(event) =>
              onChange((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Daily janitorial"
            required
            autoFocus
          />
          <Select
            label="Service line"
            options={serviceLineOptions}
            value={form.serviceLine}
            onChange={(event) =>
              onChange((current) => ({ ...current, serviceLine: event.target.value }))
            }
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(event) =>
              onChange((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Optional notes for dispatch and quoting"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {mode === "edit" && editingCategory && (
              <Button
                type="button"
                variant="ghost"
                loading={deleting}
                onClick={() => onDelete(editingCategory)}
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
              {mode === "edit" ? "Save changes" : "Create category"}
            </Button>
          </div>
        </div>
      </form>
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
