import { useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { reportsApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { Report } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, StatusBadge,
  Table, Thead, Th, Tr, Td,
} from "../components/ui";

function ReportFormModal({ report, onClose, onDone }: {
  report?: Report | null; onClose: () => void; onDone: () => void;
}) {
  const isEdit = !!report;
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    type: (report?.type ?? "weekly") as "weekly" | "monthly" | "custom",
    date: report?.date ? String(report.date).split("T")[0] : new Date().toISOString().split("T")[0],
  });

  async function handleSave() {
    setSaving(true); setFormError("");
    try {
      if (isEdit) {
        await reportsApi.update(report!.report_id, form);
      } else {
        await reportsApi.create(form);
      }
      onDone();
      onClose();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <Modal title={isEdit ? "Regenerate report" : "New report"} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
          📊 The summary will be <strong>automatically generated</strong> from real order, revenue, and product data for the selected period.
        </div>

        <FormField label="Report type">
          <Select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as "weekly" | "monthly" | "custom" }))}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (single day)</option>
          </Select>
        </FormField>

        <FormField label={form.type === "weekly" ? "Any date in the week" : form.type === "monthly" ? "Any date in the month" : "Date"}>
          <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
        </FormField>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Generating…" : isEdit ? "Regenerate summary" : "Generate report"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Expanded summary viewer
function SummaryModal({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <Modal title="Report summary" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={report.type} />
          <span className="text-sm text-zinc-500">{String(report.date).split("T")[0]}</span>
          {report.admin_username && (
            <span className="text-sm text-zinc-400">by {report.admin_username}</span>
          )}
        </div>
        <div className="rounded-2xl border border-black/5 bg-zinc-50 p-5 dark:border-white/10 dark:bg-zinc-900">
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
            {report.summary ?? "No summary available."}
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ReportsPage() {
  const { data: reports, loading, error, refetch } = useApi(reportsApi.list);
  const [showModal,      setShowModal]      = useState(false);
  const [editingReport,  setEditingReport]  = useState<Report | null>(null);
  const [viewingReport,  setViewingReport]  = useState<Report | null>(null);

  function openNew()           { setEditingReport(null); setShowModal(true); }
  function openEdit(r: Report) { setEditingReport(r);    setShowModal(true); }

  async function handleDelete(id: string) {
    if (!confirm("Delete this report?")) return;
    await reportsApi.delete(id).catch(() => {});
    refetch();
  }

  // Truncate summary for table display
  function truncate(str: string | undefined, max = 80) {
    if (!str) return "—";
    return str.length > max ? str.slice(0, max) + "…" : str;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Auto-generated summaries from real inventory and order data."
        action={
          <Button onClick={openNew}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New report</span>
          </Button>
        }
      />

      {/* Summary stat cards */}
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
              <tr>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Summary</Th>
                <Th>Created by</Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {reports.map((r) => (
                <Tr key={r.report_id}>
                  <Td><StatusBadge status={r.type} /></Td>
                  <Td>{String(r.date).split("T")[0]}</Td>
                  <Td>
                    <button
                      onClick={() => setViewingReport(r)}
                      className="text-left text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
                      title="Click to view full summary"
                    >
                      {truncate(r.summary)}
                    </button>
                  </Td>
                  <Td>{r.admin_username ?? "—"}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        title="Regenerate summary"
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        title="Edit"
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.report_id)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No reports yet. Click 'New report' to generate one." />
      )}

      {showModal && (
        <ReportFormModal
          report={editingReport}
          onClose={() => setShowModal(false)}
          onDone={refetch}
        />
      )}

      {viewingReport && (
        <SummaryModal
          report={viewingReport}
          onClose={() => setViewingReport(null)}
        />
      )}
    </div>
  );
}