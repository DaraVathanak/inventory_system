import { useMemo, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { suppliers as seedSuppliers } from "../data/suppliers"
import type { Supplier } from "../types/supplier"

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>(seedSuppliers)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [selected, setSelected] = useState<Supplier | null>(null)
  const emptyForm: Supplier = {
    supplier_id: "",
    company_name: "",
    contact_person: "",
    category_type: "",
  }
  const [form, setForm] = useState<Supplier>(emptyForm)

  const filtered = useMemo(
    () =>
      items.filter((s) =>
        `${s.supplier_id} ${s.company_name} ${s.contact_person} ${s.category_type}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const onCreate = () => {
    setMode("create")
    setForm(emptyForm)
    setSelected(null)
    setOpen(true)
  }

  const onEdit = (item: Supplier) => {
    setMode("edit")
    setForm(item)
    setSelected(item)
    setOpen(true)
  }

  const onView = (item: Supplier) => {
    setMode("view")
    setSelected(item)
    setOpen(true)
  }

  const onDelete = (item: Supplier) => {
    setItems((curr) => curr.filter((x) => x.supplier_id !== item.supplier_id))
  }

  const onSave = () => {
    if (mode === "create") {
      setItems((curr) => [form, ...curr])
    } else if (mode === "edit" && selected) {
      setItems((curr) => curr.map((x) => (x.supplier_id === selected.supplier_id ? form : x)))
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Suppliers</h2>
          <p className="text-sm text-slate-400">Manage suppliers and categories.</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border-white/10 bg-white/5 text-white"
          />
          <Button onClick={onCreate}>New Supplier</Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription className="text-slate-400">
            Full CRUD supplier management.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3">Supplier ID</th>
                <th className="py-3">Company</th>
                <th className="py-3">Contact</th>
                <th className="py-3">Category</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.supplier_id} className="border-b border-white/5">
                  <td className="py-4">{item.supplier_id}</td>
                  <td className="py-4">{item.company_name}</td>
                  <td className="py-4">{item.contact_person}</td>
                  <td className="py-4">
                    <Badge className="border-white/10 bg-white/5 text-slate-200">
                      {item.category_type}
                    </Badge>
                  </td>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Supplier" : mode === "edit" ? "Edit Supplier" : "Supplier Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Manage supplier data.
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
              <InputField label="Supplier ID" value={form.supplier_id} onChange={(v) => setForm({ ...form, supplier_id: v })} />
              <InputField label="Company Name" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
              <InputField label="Contact Person" value={form.contact_person} onChange={(v) => setForm({ ...form, contact_person: v })} />
              <InputField label="Category Type" value={form.category_type} onChange={(v) => setForm({ ...form, category_type: v })} />
            </div>
          )}

          {mode !== "view" && (
            <DialogFooter>
              <Button onClick={onSave}>Save Supplier</Button>
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
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">{label}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-white/10 bg-white/5 text-white"
      />
    </div>
  )
}