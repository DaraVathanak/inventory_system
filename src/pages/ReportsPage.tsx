import { useMemo, useState } from "react"
import { Shield, UserCog } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { reports as seedReports } from "../data/reports"
import type { ReportRecord } from "../types/report"

export default function ReportsPage() {
  const [items, setItems] = useState<ReportRecord[]>(seedReports)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [selected, setSelected] = useState<ReportRecord | null>(null)
  const emptyForm: ReportRecord = {
    report_id: "",
    type: "",
    date: "",
    summary: "",
  }
  const [form, setForm] = useState<ReportRecord>(emptyForm)

  const filtered = useMemo(
    () =>
      items.filter((r) =>
        `${r.report_id} ${r.type} ${r.summary}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const onCreate = () => {
    setMode("create")
    setForm(emptyForm)
    setSelected(null)
    setOpen(true)
  }

  const onEdit = (item: ReportRecord) => {
    setMode("edit")
    setForm(item)
    setSelected(item)
    setOpen(true)
  }

  const onView = (item: ReportRecord) => {
    setMode("view")
    setSelected(item)
    setOpen(true)
  }

  const onDelete = (item: ReportRecord) => {
    setItems((curr) => curr.filter((x) => x.report_id !== item.report_id))
  }

  const onSave = () => {
    if (mode === "create") {
      setItems((curr) => [form, ...curr])
    } else if (mode === "edit" && selected) {
      setItems((curr) => curr.map((x) => (x.report_id === selected.report_id ? form : x)))
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Reports</h2>
          <p className="text-sm text-slate-400">Manage reports and access overview.</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border-white/10 bg-white/5 text-white"
          />
          <Button onClick={onCreate}>New Report</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="border-white/10 bg-white/5 text-white xl:col-span-8">
          <CardHeader>
            <CardTitle>Reports Library</CardTitle>
            <CardDescription className="text-slate-400">
              Full CRUD report management.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3">Report ID</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Summary</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.report_id} className="border-b border-white/5">
                    <td className="py-4">{item.report_id}</td>
                    <td className="py-4">{item.type}</td>
                    <td className="py-4">{item.date}</td>
                    <td className="py-4">{item.summary}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onView(item)}>View</Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(item)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white xl:col-span-4">
          <CardHeader>
            <CardTitle>Access Roles</CardTitle>
            <CardDescription className="text-slate-400">
              Admin and manager overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-rose-400" />
                <p className="font-medium">Admin</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Full configuration, reporting, and access control.
              </p>
            </div>
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5 text-amber-400" />
                <p className="font-medium">Manager</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Operational control over orders, products, and inventory.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Report" : mode === "edit" ? "Edit Report" : "Report Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Manage report record data.
            </DialogDescription>
          </DialogHeader>

          {mode === "view" && selected ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(selected).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {key.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-sm">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Report ID" value={form.report_id} onChange={(v) => setForm({ ...form, report_id: v })} />
              <InputField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
              <InputField label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm text-slate-400">Summary</p>
                <Input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
          )}

          {mode !== "view" && (
            <DialogFooter>
              <Button onClick={onSave}>Save Report</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">{label}</p>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/10 bg-white/5 text-white"
      />
    </div>
  )
}