import { useRef, useState } from "react";
import { ImagePlus, Plus, Tag, Trash2, X } from "lucide-react";
import { productsApi, categoriesApi, suppliersApi, warehousesApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Product, Category } from "../types";
import { STATIC_BASE } from "../lib/api";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, Table, Thead, Th, Tr, Td,
} from "../components/ui";

// ── Category Manager Modal ────────────────────────────────────────────────────
function CategoryManager({
  categories,
  onClose,
  onRefresh,
}: {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setFormError("Category name is required."); return; }
    setSaving(true); setFormError("");
    try {
      await categoriesApi.create({ category_name: name.trim(), description: desc.trim() || undefined });
      setName(""); setDesc("");
      onRefresh();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed to create category.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products using it will be unlinked.")) return;
    await categoriesApi.delete(id).catch(() => {});
    onRefresh();
  }

  return (
    <Modal title="Manage categories" onClose={onClose}>
      <div className="space-y-4">
        {/* Existing categories */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-zinc-400">No categories yet.</p>
          ) : (
            categories.map((c) => (
              <div
                key={c.category_id}
                className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-4 py-2.5 dark:border-white/10 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium">{c.category_name}</p>
                  {c.description && <p className="text-xs text-zinc-400">{c.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(c.category_id)}
                  className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-black/5 dark:border-white/10 pt-4">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Add new category</p>
          <div className="space-y-3">
            <FormField label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electronics"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </FormField>
            <FormField label="Description (optional)">
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description"
              />
            </FormField>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "Add category"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { data: products,   loading, error, refetch } = useApi(() => productsApi.list());
  const { data: categories, refetch: refetchCategories } = useApi(categoriesApi.list);
  const { data: suppliers  } = useApi(suppliersApi.list);
  const { data: warehouses } = useApi(warehousesApi.list);

  const [showModal,    setShowModal]    = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<Product> & { imageFile?: File | null }>({
    name: "", category_id: "", supplier_id: "", warehouse_id: "",
    stock_quantity: 0, reorder_point: 0, unit_price: 0,
    expiry_date: "", description: "", imageFile: null,
  });

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    set("imageFile", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function resetForm() {
    setForm({ name: "", category_id: "", supplier_id: "", warehouse_id: "",
              stock_quantity: 0, reorder_point: 0, unit_price: 0,
              expiry_date: "", description: "", imageFile: null });
    setImagePreview(null);
  }

  async function handleCreate() {
    if (!form.name) { setFormError("Name is required."); return; }
    setSaving(true); setFormError("");
    try {
      await productsApi.create(form);
      setShowModal(false);
      resetForm();
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed to create product.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id).catch(() => {});
    refetch();
  }

  const lowStock = (products ?? []).filter((p) => p.stock_quantity <= p.reorder_point);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Track inventory levels, reorder points, and expiry dates."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowCatModal(true)}>
              <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> Categories</span>
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New product</span>
            </Button>
          </div>
        }
      />

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-700 dark:text-red-400">
          ⚠ {lowStock.length} product{lowStock.length > 1 ? "s" : ""} at or below reorder point.
        </div>
      )}

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        products && products.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Image</Th><Th>SKU</Th><Th>Name</Th><Th>Category</Th>
                <Th>Stock</Th><Th>Price</Th><Th>Expiry</Th><Th />
              </tr>
            </Thead>
            <tbody>
              {products.map((p) => (
                <Tr key={p.sku_id}>
                  <Td>
                    {p.image_url
                      ? <img src={`${STATIC_BASE}${p.image_url}`} alt={p.name}
                          className="h-10 w-10 rounded-xl object-cover border border-black/5 dark:border-white/10" />
                      : <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <ImagePlus className="h-4 w-4 text-zinc-400" />
                        </div>
                    }
                  </Td>
                  <Td className="font-mono text-xs">{p.sku_id}</Td>
                  <Td className="font-medium">{p.name}</Td>
                  <Td>
                    {p.category_name
                      ? <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400">
                          {p.category_name}
                        </span>
                      : "—"}
                  </Td>
                  <Td>
                    <span className={p.stock_quantity <= p.reorder_point ? "font-semibold text-red-500" : ""}>
                      {p.stock_quantity}
                    </span>
                    <span className="ml-1 text-xs text-zinc-400">(min {p.reorder_point})</span>
                  </Td>
                  <Td>${Number(p.unit_price).toFixed(2)}</Td>
                  <Td>
                    {p.expiry_date
                      ? <span className={p.days_left != null && p.days_left <= 30 ? "text-orange-500 font-medium" : ""}>
                          {String(p.expiry_date).split("T")[0]}
                          {p.days_left != null && p.days_left <= 30 && ` (${p.days_left}d)`}
                        </span>
                      : "—"}
                  </Td>
                  <Td>
                    <button onClick={() => handleDelete(p.sku_id)}
                      className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No products found." />
      )}

      {/* Category manager modal */}
      {showCatModal && (
        <CategoryManager
          categories={categories ?? []}
          onClose={() => setShowCatModal(false)}
          onRefresh={refetchCategories}
        />
      )}

      {/* New product modal */}
      {showModal && (
        <Modal title="New product" onClose={() => { setShowModal(false); resetForm(); }}>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

            {/* Image upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Product image</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-zinc-50 py-6 transition hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-zinc-500"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="h-32 w-32 rounded-xl object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); set("imageFile", null); setImagePreview(null); }}
                      className="absolute right-2 top-2 rounded-full bg-white p-1 shadow dark:bg-zinc-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-6 w-6 text-zinc-400" />
                    <p className="text-sm text-zinc-500">Click to upload image</p>
                    <p className="text-xs text-zinc-400">JPG, PNG, WebP up to 5MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <FormField label="Name">
              <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Product name" />
            </FormField>

            <FormField label="Description">
              <Input value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
            </FormField>

            <FormField label="Category">
              <div className="flex gap-2">
                <Select
                  value={form.category_id ?? ""}
                  onChange={(e) => set("category_id", e.target.value)}
                  className="flex-1"
                >
                  <option value="">— Select category —</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => setShowCatModal(true)}
                  className="shrink-0 rounded-2xl border border-black/10 px-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  title="Manage categories"
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
            </FormField>

            <FormField label="Supplier">
              <Select value={form.supplier_id ?? ""} onChange={(e) => set("supplier_id", e.target.value)}>
                <option value="">— Select supplier —</option>
                {(suppliers ?? []).map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.company_name}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Warehouse">
              <Select value={form.warehouse_id ?? ""} onChange={(e) => set("warehouse_id", e.target.value)}>
                <option value="">— Select warehouse —</option>
                {(warehouses ?? []).map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>{w.location_name}</option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Stock">
                <Input type="number" value={form.stock_quantity ?? 0} onChange={(e) => set("stock_quantity", Number(e.target.value))} />
              </FormField>
              <FormField label="Reorder at">
                <Input type="number" value={form.reorder_point ?? 0} onChange={(e) => set("reorder_point", Number(e.target.value))} />
              </FormField>
              <FormField label="Price ($)">
                <Input type="number" step="0.01" value={form.unit_price ?? 0} onChange={(e) => set("unit_price", Number(e.target.value))} />
              </FormField>
            </div>

            <FormField label="Expiry date (optional)">
              <Input type="date" value={form.expiry_date ?? ""} onChange={(e) => set("expiry_date", e.target.value)} />
            </FormField>

            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create product"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}