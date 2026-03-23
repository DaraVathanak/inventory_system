import { useState, useMemo } from "react";
import { PackagePlus, Search, ArrowUpDown, CheckCircle2, History, Trash2 } from "lucide-react";
import { productsApi, restockLogApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Product } from "../types";
import { STATIC_BASE } from "../lib/api";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState,
  Modal, FormField, Input, Button, Table, Thead, Th, Tr, Td,
} from "../components/ui";

// ── Restock Modal ─────────────────────────────────────────────────────────────
function RestockModal({ product, onClose, onDone }: {
  product: Product; onClose: () => void; onDone: () => void;
}) {
  const [amount,    setAmount]    = useState<number>(1);
  const [note,      setNote]      = useState("");
  const [saving,    setSaving]    = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [done,      setDone]      = useState(false);
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

      // Update product stock
      await productsApi.update(product.sku_id, { stock_quantity: stock_after });

      // Record the restock log
      await restockLogApi.create({
        sku_id:         product.sku_id,
        product_name:   product.name,
        quantity_added: amount,
        stock_before,
        stock_after,
        note: note.trim() || undefined,
      });

      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1400);
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed to restock.");
    } finally { setSaving(false); }
  }

  if (done) {
    return (
      <Modal title="Restock product" onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-6">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="text-lg font-semibold">Restocked successfully!</p>
          <p className="text-sm text-zinc-500 text-center">
            <strong>{product.name}</strong> stock updated to{" "}
            <strong className="text-emerald-600">{product.stock_quantity + amount}</strong>
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Restock product" onClose={onClose}>
      <div className="space-y-4">
        {/* Product info */}
        <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          {product.image_url
            ? <img src={`${STATIC_BASE}${product.image_url}`} alt={product.name}
                className="h-14 w-14 rounded-xl object-cover border border-black/5 dark:border-white/10 shrink-0" />
            : <div className="h-14 w-14 rounded-xl bg-zinc-200 dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                <PackagePlus className="h-5 w-5 text-zinc-400" />
              </div>
          }
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-xs text-zinc-400">SKU: {product.sku_id}</p>
            {product.category_name && (
              <span className="mt-1 inline-block rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-400">
                {product.category_name}
              </span>
            )}
          </div>
        </div>

        {/* Stock counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-xs text-zinc-400 mb-1">Current</p>
            <p className={`text-2xl font-bold ${product.stock_quantity <= product.reorder_point ? "text-red-500" : "text-zinc-800 dark:text-white"}`}>
              {product.stock_quantity}
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-zinc-900">
            <p className="text-xs text-zinc-400 mb-1">Adding</p>
            <p className="text-2xl font-bold text-blue-500">+{amount || 0}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
            <p className="text-xs text-zinc-400 mb-1">After</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {product.stock_quantity + (amount || 0)}
            </p>
          </div>
        </div>

        <FormField label="Restock amount">
          <Input type="number" min="1" value={amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))} />
        </FormField>

        <FormField label="Note (optional)">
          <Input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Monthly restock from supplier" />
        </FormField>

        <label className="flex items-start gap-3 cursor-pointer rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-zinc-900 dark:accent-white" />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            I confirm restocking <strong>{product.name}</strong> by{" "}
            <strong>{amount}</strong> unit{amount !== 1 ? "s" : ""}, bringing total to{" "}
            <strong>{product.stock_quantity + (amount || 0)}</strong>.
          </span>
        </label>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRestock} disabled={saving || !confirmed}>
            {saving ? "Restocking…" : "Confirm restock"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Restock History Modal ─────────────────────────────────────────────────────
function HistoryModal({ sku_id, productName, onClose, isAdmin }: {
  sku_id?: string; productName?: string; onClose: () => void; isAdmin?: boolean;
}) {
  const { data: logs, loading, error, refetch } = useApi(() => restockLogApi.list(sku_id));
  const [clearing, setClearing] = useState(false);

  async function handleClearAll() {
    if (!confirm("Clear ALL restock history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await restockLogApi.clearAll();
      refetch();
    } finally { setClearing(false); }
  }

  async function handleDeleteOne(id: number) {
    if (!confirm("Delete this record?")) return;
    await restockLogApi.deleteOne(id).catch(() => {});
    refetch();
  }

  return (
    <Modal title={sku_id ? `Restock history — ${productName}` : "All restock history"} onClose={onClose}>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {loading && <Spinner />}
        {error   && <ErrorMessage message={error} />}
        {!loading && !error && (
          logs && logs.length > 0 ? (
            logs.map((r) => (
              <div key={r.id}
                className="rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {!sku_id && (
                      <p className="font-medium text-sm mb-1">{r.product_name}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        +{r.quantity_added} units
                      </span>
                      <span className="text-xs text-zinc-500">
                        {r.stock_before} → <strong className="text-zinc-700 dark:text-zinc-200">{r.stock_after}</strong>
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-1.5 text-xs text-zinc-500 italic">"{r.note}"</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {r.restocked_by}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(r.restocked_at).toLocaleString()}
                      </p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteOne(r.id)}
                        className="shrink-0 rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No restock history yet." />
          )
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10 mt-4">
        {isAdmin && logs && logs.length > 0 ? (
          <Button variant="danger" onClick={handleClearAll} disabled={clearing}>
            <span className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {clearing ? "Clearing…" : "Clear all history"}
            </span>
          </Button>
        ) : <span />}
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type SortKey = "name" | "stock_quantity" | "reorder_point";
type SortDir = "asc" | "desc";

// Accept optional currentUser so we know if admin
interface RestockPageProps { isAdmin?: boolean; }

export default function RestockPage({ isAdmin = false }: RestockPageProps) {
  const { data: products, loading, error, refetch } = useApi(() => productsApi.list());
  const [restockProduct,  setRestockProduct]  = useState<Product | null>(null);
  const [historyProduct,  setHistoryProduct]  = useState<Product | null | "all">(null);
  const [search,  setSearch]  = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("stock_quantity");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAll, setShowAll] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const processed = useMemo(() => {
    let list = [...(products ?? [])];
    if (!showAll) list = list.filter(p => p.stock_quantity <= p.reorder_point);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku_id.toLowerCase().includes(q) ||
        (p.category_name ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp = typeof av === "number" ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, sortKey, sortDir, showAll]);

  const lowCount = (products ?? []).filter(p => p.stock_quantity <= p.reorder_point).length;

  function SortIcon({ k }: { k: SortKey }) {
    return <ArrowUpDown className={`inline ml-1 h-3 w-3 ${sortKey === k ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restock"
        description="Review low-stock products and restock them quickly."
        action={
          <Button variant="ghost" onClick={() => setHistoryProduct("all")}>
            <span className="flex items-center gap-2"><History className="h-4 w-4" /> Restock history</span>
          </Button>
        }
      />

      {/* Summary banner */}
      {!loading && !error && (
        <div className={`rounded-2xl px-5 py-4 text-sm font-medium flex items-center justify-between gap-4 ${
          lowCount > 0
            ? "border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        }`}>
          <span>
            {lowCount > 0
              ? `⚠ ${lowCount} product${lowCount > 1 ? "s" : ""} need restocking`
              : "✅ All products are adequately stocked"}
          </span>
          <button onClick={() => setShowAll(v => !v)}
            className="rounded-full border border-current px-3 py-1 text-xs transition hover:opacity-70">
            {showAll ? "Show low stock only" : "Show all products"}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <input type="text" placeholder="Search by name, SKU, or category…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white/70 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800" />
      </div>

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        processed.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Image</Th>
                <Th onClick={() => toggleSort("name")} className="cursor-pointer select-none">Name <SortIcon k="name" /></Th>
                <Th>Category</Th>
                <Th>Supplier</Th>
                <Th onClick={() => toggleSort("stock_quantity")} className="cursor-pointer select-none">Stock <SortIcon k="stock_quantity" /></Th>
                <Th onClick={() => toggleSort("reorder_point")} className="cursor-pointer select-none">Min <SortIcon k="reorder_point" /></Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {processed.map((p) => {
                const isLow = p.stock_quantity <= p.reorder_point;
                const pct   = p.reorder_point > 0 ? Math.min(100, Math.round((p.stock_quantity / p.reorder_point) * 100)) : 100;
                return (
                  <Tr key={p.sku_id}>
                    <Td>
                      {p.image_url
                        ? <img src={`${STATIC_BASE}${p.image_url}`} alt={p.name}
                            className="h-10 w-10 rounded-xl object-cover border border-black/5 dark:border-white/10" />
                        : <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                      }
                    </Td>
                    <Td>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-zinc-400 font-mono">{p.sku_id}</p>
                      </div>
                    </Td>
                    <Td>{p.category_name ?? "—"}</Td>
                    <Td>{p.supplier_name ?? "—"}</Td>
                    <Td>
                      <div className="space-y-1">
                        <span className={`font-semibold ${isLow ? "text-red-500" : "text-zinc-700 dark:text-zinc-200"}`}>
                          {p.stock_quantity}
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div className={`h-full rounded-full ${pct <= 50 ? "bg-red-500" : pct <= 100 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </Td>
                    <Td>{p.reorder_point}</Td>
                    <Td>
                      {isLow
                        ? <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">Low stock</span>
                        : <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">OK</span>
                      }
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button onClick={() => setRestockProduct(p)} variant={isLow ? "primary" : "ghost"}>
                          <span className="flex items-center gap-1.5"><PackagePlus className="h-4 w-4" /> Restock</span>
                        </Button>
                        <button onClick={() => setHistoryProduct(p)} title="View history"
                          className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : <EmptyState message={showAll ? "No products found." : "No products need restocking."} />
      )}

      {restockProduct && (
        <RestockModal product={restockProduct} onClose={() => setRestockProduct(null)} onDone={refetch} />
      )}

      {historyProduct && (
        <HistoryModal
          sku_id={historyProduct === "all" ? undefined : (historyProduct as Product).sku_id}
          productName={historyProduct === "all" ? undefined : (historyProduct as Product).name}
          onClose={() => setHistoryProduct(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}