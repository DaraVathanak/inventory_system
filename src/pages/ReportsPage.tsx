import { useState } from "react";
import { Plus } from "lucide-react";
import { reportsApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, StatusBadge,
  Table, Thead, Th, Tr, Td,
} from "../components/ui";

export default function ReportsPage() {
  const { data: reports, loading, error, refetch } = useApi(reportsApi.list);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ type: "weekly", summary: "", date: new Date().toISOString().split("T")[0] });

  async function handleCreate() {
    setSaving(true); setFormError("");
    try {
      await reportsApi.create(form);
      setShowModal(false);
      setForm({ type: "weekly", summary: "", date: new Date().toISOString().split("T")[0] });
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review weekly and monthly inventory performance."
        action={
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New report</span>
          </Button>
        }
      />

      {!loading && !error && reports && (
        <div className="grid gap-4 sm:grid-cols-3">
          {(["weekly","monthly","custom"] as const).map((type) => (
            <div key={type} className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">{type} reports</p>
              <p className="mt-2 text-3xl font-semibold">{reports.filter(r => r.type === type).length}</p>
            </div>
          ))}
        </div>
      )}

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        reports && reports.length > 0 ? (
          <Table>
            <Thead>
              <tr><Th>Type</Th><Th>Date</Th><Th>Summary</Th><Th>Created by</Th></tr>
            </Thead>
            <tbody>
              {reports.map((r) => (
                <Tr key={r.report_id}>
                  <Td><StatusBadge status={r.type} /></Td>
                  <Td>{String(r.date).split("T")[0]}</Td>
                  <Td>{r.summary ?? "—"}</Td>
                  <Td>{r.admin_username ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No reports available yet." />
      )}

      {showModal && (
        <Modal title="New report" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <FormField label="Type">
              <Select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </Select>
            </FormField>
            <FormField label="Date">
              <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Summary">
              <Input value={form.summary} onChange={(e) => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Brief summary of this report period…" />
            </FormField>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create report"}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}