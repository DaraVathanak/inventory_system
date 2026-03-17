import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { suppliersApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Supplier } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, StatusBadge,
  Table, Thead, Th, Tr, Td,
} from "../components/ui";

export default function SuppliersPage() {
  const { data: suppliers, loading, error, refetch } = useApi(suppliersApi.list);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<Partial<Supplier>>({
    company_name: "", contact_person: "", email: "",
    phone: "", category_type: "", status: "active",
  });

  async function handleCreate() {
    if (!form.company_name) { setFormError("Company name is required."); return; }
    setSaving(true); setFormError("");
    try {
      await suppliersApi.create(form);
      setShowModal(false);
      setForm({ company_name: "", contact_person: "", email: "", phone: "", category_type: "", status: "active" });
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supplier?")) return;
    await suppliersApi.delete(id).catch(() => {});
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your sourcing partners and vendor contacts."
        action={
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New supplier</span>
          </Button>
        }
      />

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        suppliers && suppliers.length > 0 ? (
          <Table>
            <Thead>
              <tr><Th>Company</Th><Th>Contact</Th><Th>Email</Th><Th>Phone</Th><Th>Category</Th><Th>Status</Th><Th /></tr>
            </Thead>
            <tbody>
              {suppliers.map((s) => (
                <Tr key={s.supplier_id}>
                  <Td className="font-medium">{s.company_name}</Td>
                  <Td>{s.contact_person ?? "—"}</Td>
                  <Td>{s.email ?? "—"}</Td>
                  <Td>{s.phone ?? "—"}</Td>
                  <Td>{s.category_type ?? "—"}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>
                    <button onClick={() => handleDelete(s.supplier_id)}
                      className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No suppliers found." />
      )}

      {showModal && (
        <Modal title="New supplier" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Company name">
              <Input value={form.company_name ?? ""} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Acme Corp" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contact person">
                <Input value={form.contact_person ?? ""} onChange={(e) => setForm(f => ({ ...f, contact_person: e.target.value }))} />
              </FormField>
              <FormField label="Category type">
                <Input value={form.category_type ?? ""} onChange={(e) => setForm(f => ({ ...f, category_type: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <Input type="email" value={form.email ?? ""} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@company.com" />
              </FormField>
              <FormField label="Phone">
                <Input value={form.phone ?? ""} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 0100" />
              </FormField>
            </div>
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Supplier["status"] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create supplier"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}