import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ordersApi, productsApi, customersApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Order } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, StatusBadge,
  Table, Thead, Th, Tr, Td,
} from "../components/ui";

const STATUSES: Order["status"][] = ["pending","processing","shipped","delivered","cancelled"];

export default function OrdersPage() {
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const { data: orders, loading, error, refetch } = useApi(() => ordersApi.list());
  const { data: products } = useApi(() => productsApi.list());
  const { data: customers } = useApi(customersApi.list);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    customer_id: "", status: "pending" as Order["status"],
    sku_id: "", quantity: 1, notes: "",
  });

  async function handleCreate() {
    if (!form.sku_id) { setFormError("Please select a product."); return; }
    setSaving(true); setFormError("");
    try {
      const product = products?.find(p => p.sku_id === form.sku_id);
      const unit_price = product?.unit_price ?? 0;
      const total_amount = unit_price * form.quantity;
      await ordersApi.create({
        customer_id: form.customer_id || undefined,
        status: form.status,
        total_amount,
        items: [{ sku_id: form.sku_id, quantity: form.quantity, unit_price }],
      });
      setShowModal(false);
      setForm({ customer_id: "", status: "pending", sku_id: "", quantity: 1, notes: "" });
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    await ordersApi.delete(id).catch(() => {});
    refetch();
  }

  const filtered = (orders ?? []).filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage purchase orders across all warehouses and suppliers."
        action={
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New order</span>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === s
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "border border-black/10 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        filtered.length > 0 ? (
          <Table>
            <Thead>
              <tr><Th>Order ID</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th><Th /></tr>
            </Thead>
            <tbody>
              {filtered.map((o) => (
                <Tr key={o.order_id}>
                  <Td className="font-mono text-xs">{o.order_id.slice(0,8)}…</Td>
                  <Td>{o.customer_name ?? "—"}</Td>
                  <Td>${Number(o.total_amount).toFixed(2)}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td>{String(o.order_date).split("T")[0]}</Td>
                  <Td>
                    <button onClick={() => handleDelete(o.order_id)}
                      className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No orders match the selected filter." />
      )}

      {showModal && (
        <Modal title="New order" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Customer">
              <Select value={form.customer_id} onChange={(e) => setForm(f => ({ ...f, customer_id: e.target.value }))}>
                <option value="">— Select customer (optional) —</option>
                {(customers ?? []).map((c) => (
                  <option key={c.customer_id} value={c.customer_id}>{c.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Product">
              <Select value={form.sku_id} onChange={(e) => setForm(f => ({ ...f, sku_id: e.target.value }))}>
                <option value="">— Select product —</option>
                {(products ?? []).map((p) => (
                  <option key={p.sku_id} value={p.sku_id}>{p.name} (${Number(p.unit_price).toFixed(2)})</option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantity">
                <Input type="number" min="1" value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Order["status"] }))}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>
            </div>
            <FormField label="Notes (optional)">
              <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormField>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create order"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}