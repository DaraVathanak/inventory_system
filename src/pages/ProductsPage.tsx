import { useRef, useState, useMemo } from "react";
import { ImagePlus, Plus, Tag, Trash2, X, Pencil, ArrowUpDown, Search, PackagePlus, ZoomIn } from "lucide-react";
import { productsApi, categoriesApi, suppliersApi, warehousesApi, restockLogApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Product, Category } from "../types";
import { STATIC_BASE } from "../lib/api";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, Table, Thead, Th, Tr, Td,
} from "../components/ui";

// ── Image Lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg dark:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl"
        />
        <p className="mt-3 text-center text-sm text-white/70">{alt}</p>
      </div>
    </div>
  );
}

// ── Category Manager ──────────────────────────────────────────────────────────
function CategoryManager({ categories, onClose, onRefresh }: {
  categories: Category[]; onClose: () => void; onRefresh: () => void;
}) {
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");

  async function handleCreate() {
    if (!name.trim()) { setFormError("Category name is required."); return; }
    setSaving(true); setFormError("");
    try {
      await categoriesApi.create({ category_name: name.trim(), description: desc.trim() || undefined });
      setName(""); setDesc(""); onRefresh();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Manage categories" onClose={onClose}>
      <div className="space-y-4">
        <div className="max-h-48 overflow-y-auto space-y-2">
          {categories.length === 0
            ? <p className="text-sm text-zinc-400">No categories yet.</p>
            : categories.map((c) => (
              <div key={c.category_id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-4 py-2.5 dark:border-white/10 dark:bg-zinc-900">
                <div>
                  <p className="text-sm font-medium">{c.category_name}</p>
                  {c.description && <p className="text-xs text-zinc-400">{c.description}</p>}
                </div>
                <button onClick={async () => { await categoriesApi.delete(c.category_id).catch(()=>{}); onRefresh(); }}
                  className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          }
        </div>
        <div className="border-t border-black/5 dark:border-white/10 pt-4">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Add new category</p>
          <div className="space-y-3">
            <FormField label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electronics"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
            </FormField>
            <FormField label="Description (optional)">
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description" />
            </FormField>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Add category"}</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Restock Modal ─────────────────────────────────────────────────────────────
function RestockModal({ product, onClose, onDone }: {
  product: Product; onClose: () => void; onDone: () => void;
}) {
  const [amount, setAmount]       = useState<number>(1);
  const [saving, setSaving]       = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState("");

  function handleAmountChange(val: number) {
    setAmount(Math.max(1, Math.floor(val)));
  }

  async function handleRestock() {
    if (amount < 1)  { setFormError("Amount must be at least 1."); return; }
    if (!confirmed)  { setFormError("Please tick the confirmation checkbox."); return; }
    setSaving(true); setFormError("");
    try {
      const stock_before = product.stock_quantity;
      const stock_after  = stock_before + amount;
      await productsApi.update(product.sku_id, { stock_quantity: stock_after });
      await restockLogApi.create({
        sku_id: product.sku_id,
        product_name: product.name,
        quantity_added: amount,
        stock_before,
        stock_after,
      });
      onDone(); onClose();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Restock product" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-xs text-zinc-400 mb-1">Current</p>
            <p className="text-2xl font-bold text-red-500">{product.stock_quantity}</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-xs text-zinc-400 mb-1">Adding</p>
            <p className="text-2xl font-bold text-blue-500">+{amount || 0}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
            <p className="text-xs text-zinc-400 mb-1">After</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{product.stock_quantity + (amount || 0)}</p>
          </div>
        </div>
        <FormField label="Restock amount">
          <Input type="number" min="1" value={amount} onChange={(e) => handleAmountChange(Number(e.target.value))} />
        </FormField>
        <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-zinc-900 dark:accent-white" />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            I confirm restocking <strong>{product.name}</strong> by <strong>{amount}</strong> unit{amount !== 1 ? "s" : ""}, bringing total to <strong>{product.stock_quantity + (amount || 0)}</strong>.
          </span>
        </label>
        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRestock} disabled={saving || !confirmed}>{saving ? "Restocking…" : "Confirm restock"}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductFormModal({ product, categories, suppliers, warehouses, onClose, onDone }: {
  product?: Product | null;
  categories: Category[];
  suppliers: { supplier_id: string; company_name: string }[];
  warehouses: { warehouse_id: string; location_name: string }[];
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url ? `${STATIC_BASE}${product.image_url}` : null
  );
  const [form, setForm] = useState<Partial<Product> & { imageFile?: File | null }>({
    name:           product?.name           ?? "",
    description:    product?.description    ?? "",
    category_id:    product?.category_id    ?? "",
    supplier_id:    product?.supplier_id    ?? "",
    warehouse_id:   product?.warehouse_id   ?? "",
    stock_quantity: product?.stock_quantity ?? 0,
    reorder_point:  product?.reorder_point  ?? 0,
    unit_price:     product?.unit_price     ?? 0,
    expiry_date:    product?.expiry_date ? String(product.expiry_date).split("T")[0] : "",
    imageFile: null,
  });

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Clamp numeric inputs to >= 0
  function setNum(key: "stock_quantity" | "reorder_point" | "unit_price", val: number) {
    set(key, Math.max(0, val));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    set("imageFile", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSave() {
    // Validate all required fields
    if (!form.name?.trim())          { setFormError("Product name is required."); return; }
    if (!form.category_id)           { setFormError("Please select a category."); return; }
    if (!form.supplier_id)           { setFormError("Please select a supplier."); return; }
    if (!form.warehouse_id)          { setFormError("Please select a warehouse."); return; }
    if (!form.unit_price || (form.unit_price ?? 0) <= 0)
                                     { setFormError("Price must be greater than 0."); return; }
    if ((form.stock_quantity ?? 0) < 0) { setFormError("Stock cannot be negative."); return; }
    if ((form.reorder_point ?? 0) < 0)  { setFormError("Reorder point cannot be negative."); return; }
    setSaving(true); setFormError("");
    try {
      if (isEdit) await productsApi.update(product!.sku_id, form);
      else        await productsApi.create(form);
      onDone(); onClose();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <Modal title={isEdit ? "Edit product" : "New product"} onClose={onClose}>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {!isEdit && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Fields marked <span className="text-red-500 font-medium">*</span> are required.
          </p>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Product image</p>
          <div onClick={() => fileRef.current?.click()}
            className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-zinc-50 py-6 transition hover:border-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-zinc-500">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="h-32 w-32 rounded-xl object-cover" />
                <button onClick={(e) => { e.stopPropagation(); set("imageFile", null); setImagePreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow dark:bg-zinc-800">
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

        <FormField label="Name *">
          <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Product name" />
        </FormField>
        <FormField label="Description">
          <Input value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
        </FormField>
        <FormField label="Category *">
          <Select value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value)}>
            <option value="">— Select category —</option>
            {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </Select>
        </FormField>
        <FormField label="Supplier *">
          <Select value={form.supplier_id ?? ""} onChange={(e) => set("supplier_id", e.target.value)}>
            <option value="">— Select supplier —</option>
            {suppliers.map((s) => <option key={s.supplier_id} value={s.supplier_id}>{s.company_name}</option>)}
          </Select>
        </FormField>
        <FormField label="Warehouse *">
          <Select value={form.warehouse_id ?? ""} onChange={(e) => set("warehouse_id", e.target.value)}>
            <option value="">— Select warehouse —</option>
            {warehouses.map((w) => <option key={w.warehouse_id} value={w.warehouse_id}>{w.location_name}</option>)}
          </Select>
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Stock *">
            <Input type="number" min="0" value={form.stock_quantity ?? 0}
              onChange={(e) => setNum("stock_quantity", Number(e.target.value))} />
          </FormField>
          <FormField label="Reorder at *">
            <Input type="number" min="0" value={form.reorder_point ?? 0}
              onChange={(e) => setNum("reorder_point", Number(e.target.value))} />
          </FormField>
          <FormField label="Price $ *">
            <Input type="number" min="0.01" step="0.01" value={form.unit_price ?? 0}
              onChange={(e) => setNum("unit_price", Number(e.target.value))} />
          </FormField>
        </div>

        <FormField label="Expiry date (optional)">
          <Input type="date" value={form.expiry_date ?? ""} onChange={(e) => set("expiry_date", e.target.value)} />
        </FormField>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type SortKey = "name" | "stock_quantity" | "unit_price" | "expiry_date";
type SortDir = "asc" | "desc";

export default function ProductsPage() {
  const { data: products,   loading, error, refetch } = useApi(() => productsApi.list());
  const { data: categories, refetch: refetchCats }    = useApi(categoriesApi.list);
  const { data: suppliers  } = useApi(suppliersApi.list);
  const { data: warehouses } = useApi(warehousesApi.list);

  const [showCatModal,     setShowCatModal]     = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState<Product | null>(null);
  const [restockProduct,   setRestockProduct]   = useState<Product | null>(null);
  const [lightboxProduct,  setLightboxProduct]  = useState<Product | null>(null);

  const [search,         setSearch]         = useState("");
  const [sortKey,        setSortKey]        = useState<SortKey>("name");
  const [sortDir,        setSortDir]        = useState<SortDir>("asc");
  const [filterCategory, setFilterCategory] = useState("");

  function openEdit(p: Product) { setEditingProduct(p); setShowProductModal(true); }
  function openNew()             { setEditingProduct(null); setShowProductModal(true); }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await productsApi.delete(id).catch(() => {});
    refetch();
  }

  const processed = useMemo(() => {
    let list = [...(products ?? [])];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku_id.toLowerCase().includes(q) ||
        (p.category_name ?? "").toLowerCase().includes(q)
      );
    }
    if (filterCategory) list = list.filter((p) => p.category_id === filterCategory);
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, sortKey, sortDir, filterCategory]);

  const lowStock = (products ?? []).filter((p) => p.stock_quantity <= p.reorder_point);

  function SortIcon({ k }: { k: SortKey }) {
    return <ArrowUpDown className={`inline ml-1 h-3 w-3 ${sortKey === k ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />;
  }

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
            <Button onClick={openNew}>
              <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New product</span>
            </Button>
          </div>
        }
      />

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-4">
          <span>⚠ {lowStock.length} product{lowStock.length > 1 ? "s" : ""} at or below reorder point.</span>
          <div className="flex gap-2 flex-wrap">
            {lowStock.map((p) => (
              <button key={p.sku_id} onClick={() => setRestockProduct(p)}
                className="flex items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium hover:bg-red-500/25 transition">
                <PackagePlus className="h-3 w-3" /> {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search by name, SKU, or category…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white/70 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800" />
        </div>
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-48">
          <option value="">All categories</option>
          {(categories ?? []).map((c) => (
            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
          ))}
        </Select>
      </div>

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        processed.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Image</Th>
                <Th>SKU</Th>
                <Th onClick={() => toggleSort("name")} className="cursor-pointer select-none">Name <SortIcon k="name" /></Th>
                <Th>Category</Th>
                <Th onClick={() => toggleSort("stock_quantity")} className="cursor-pointer select-none">Stock <SortIcon k="stock_quantity" /></Th>
                <Th onClick={() => toggleSort("unit_price")} className="cursor-pointer select-none">Price <SortIcon k="unit_price" /></Th>
                <Th onClick={() => toggleSort("expiry_date")} className="cursor-pointer select-none">Expiry <SortIcon k="expiry_date" /></Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {processed.map((p) => (
                <Tr key={p.sku_id}>
                  <Td>
                    {p.image_url ? (
                      <div className="group relative h-10 w-10 cursor-pointer"
                        onClick={() => setLightboxProduct(p)}>
                        <img src={`${STATIC_BASE}${p.image_url}`} alt={p.name}
                          className="h-10 w-10 rounded-xl object-cover border border-black/5 dark:border-white/10 transition group-hover:opacity-75" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <ZoomIn className="h-4 w-4 text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-zinc-400" />
                      </div>
                    )}
                  </Td>
                  <Td className="font-mono text-xs">{p.sku_id}</Td>
                  <Td className="font-medium">{p.name}</Td>
                  <Td>
                    {p.category_name
                      ? <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400">{p.category_name}</span>
                      : "—"}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className={p.stock_quantity <= p.reorder_point ? "font-semibold text-red-500" : ""}>
                        {p.stock_quantity}
                      </span>
                      <span className="text-xs text-zinc-400">(min {p.reorder_point})</span>
                      {p.stock_quantity <= p.reorder_point && (
                        <button onClick={() => setRestockProduct(p)} title="Restock"
                          className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                          <PackagePlus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
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
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.sku_id)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No products found." />
      )}

      {/* Image lightbox */}
      {lightboxProduct?.image_url && (
        <ImageLightbox
          src={`${STATIC_BASE}${lightboxProduct.image_url}`}
          alt={lightboxProduct.name}
          onClose={() => setLightboxProduct(null)}
        />
      )}

      {showCatModal && (
        <CategoryManager categories={categories ?? []} onClose={() => setShowCatModal(false)} onRefresh={refetchCats} />
      )}

      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          categories={categories ?? []}
          suppliers={(suppliers ?? []) as { supplier_id: string; company_name: string }[]}
          warehouses={(warehouses ?? []) as { warehouse_id: string; location_name: string }[]}
          onClose={() => setShowProductModal(false)}
          onDone={refetch}
        />
      )}

      {restockProduct && (
        <RestockModal product={restockProduct} onClose={() => setRestockProduct(null)} onDone={refetch} />
      )}
    </div>
  );
}