import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { warehousesApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Warehouse } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Button, Table, Thead, Th, Tr, Td,
} from "../components/ui";

export default function WarehousesPage() {
  const { data: warehouses, loading, error, refetch } = useApi(warehousesApi.list);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<Partial<Warehouse>>({
    location_name: "", address: "", capacity: 0, used: 0, manager: "",
  });

  async function handleCreate() {
    if (!form.location_name) { setFormError("Location name is required."); return; }
    setSaving(true); setFormError("");
    try {
      await warehousesApi.create(form);
      setShowModal(false);
      setForm({ location_name: "", address: "", capacity: 0, used: 0, manager: "" });
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this warehouse?")) return;
    await warehousesApi.delete(id).catch(() => {});
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Monitor storage capacity and usage across all locations."
        action={
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New warehouse</span>
          </Button>
        }
      />

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        warehouses && warehouses.length > 0 ? (
          <Table>
            <Thead>
              <tr><Th>Name</Th><Th>Address</Th><Th>Manager</Th><Th>Capacity</Th><Th>Usage</Th><Th /></tr>
            </Thead>
            <tbody>
              {warehouses.map((w) => {
                const pct = w.capacity > 0 ? Math.round((w.used / w.capacity) * 100) : 0;
                return (
                  <Tr key={w.warehouse_id}>
                    <Td className="font-medium">{w.location_name}</Td>
                    <Td>{w.address ?? "—"}</Td>
                    <Td>{w.manager ?? "—"}</Td>
                    <Td>{w.capacity.toLocaleString()}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500">{pct}%</span>
                      </div>
                    </Td>
                    <Td>
                      <button onClick={() => handleDelete(w.warehouse_id)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : <EmptyState message="No warehouses found." />
      )}

      {showModal && (
        <Modal title="New warehouse" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Location name">
              <Input value={form.location_name ?? ""} onChange={(e) => setForm(f => ({ ...f, location_name: e.target.value }))} placeholder="Warehouse A" />
            </FormField>
            <FormField label="Address">
              <Input value={form.address ?? ""} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Industrial Rd, City" />
            </FormField>
            <FormField label="Manager">
              <Input value={form.manager ?? ""} onChange={(e) => setForm(f => ({ ...f, manager: e.target.value }))} placeholder="Jane Smith" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Capacity">
                <Input type="number" value={form.capacity ?? 0} onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
              </FormField>
              <FormField label="Used">
                <Input type="number" value={form.used ?? 0} onChange={(e) => setForm(f => ({ ...f, used: Number(e.target.value) }))} />
              </FormField>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create warehouse"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}