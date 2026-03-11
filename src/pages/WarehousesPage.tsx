import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { warehouses as seedWarehouses } from "../data/warehouses"
import type { WarehouseRecord } from "../types/warehouse"

export default function WarehousesPage() {
  const [items, setItems] = useState<WarehouseRecord[]>(seedWarehouses)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [selected, setSelected] = useState<WarehouseRecord | null>(null)
  const emptyForm: WarehouseRecord = {
    warehouse_id: "",
    location_name: "",
    address: "",
    capacity: 0,
    utilization: 0,
  }
  const [form, setForm] = useState<WarehouseRecord>(emptyForm)

  const filtered = useMemo(
    () =>
      items.filter((w) =>
        `${w.warehouse_id} ${w.location_name} ${w.address}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const onCreate = () => {
    setMode("create")
    setForm(emptyForm)
    setSelected(null)
    setOpen(true)
  }

  const onEdit = (item: WarehouseRecord) => {
    setMode("edit")
    setForm(item)
    setSelected(item)
    setOpen(true)
  }

  const onView = (item: WarehouseRecord) => {
    setMode("view")
    setSelected(item)
    setOpen(true)
  }

  const onDelete = (item: WarehouseRecord) => {
    setItems((curr) => curr.filter((x) => x.warehouse_id !== item.warehouse_id))
  }

  const onSave = () => {
    if (mode === "create") {
      setItems((curr) => [form, ...curr])
    } else if (mode === "edit" && selected) {
      setItems((curr) => curr.map((x) => (x.warehouse_id === selected.warehouse_id ? form : x)))
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Warehouses</h2>
          <p className="text-sm text-slate-400">Manage warehouse locations and capacity.</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search warehouses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border-white/10 bg-white/5 text-white"
          />
          <Button onClick={onCreate}>New Warehouse</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {filtered.map((item) => (
          <motion.div key={item.warehouse_id} whileHover={{ y: -4 }}>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-cyan-300">{item.warehouse_id}</p>
                    <h3 className="mt-2 text-xl font-semibold">{item.location_name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" /> {item.address}
                    </p>
                  </div>
                  <Badge className="border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
                    {item.utilization}% used
                  </Badge>
                </div>

                <div className="mt-5 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{ width: `${item.utilization}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>Capacity</span>
                  <span>{item.capacity.toLocaleString()} units</span>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => onView(item)}>
                    View
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => onDelete(item)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Warehouse" : mode === "edit" ? "Edit Warehouse" : "Warehouse Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Manage warehouse record data.
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
              <InputField label="Warehouse ID" value={form.warehouse_id} onChange={(v) => setForm({ ...form, warehouse_id: v })} />
              <InputField label="Location Name" value={form.location_name} onChange={(v) => setForm({ ...form, location_name: v })} />
              <InputField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
              <InputField label="Capacity" type="number" value={String(form.capacity)} onChange={(v) => setForm({ ...form, capacity: Number(v) || 0 })} />
              <InputField label="Utilization %" type="number" value={String(form.utilization)} onChange={(v) => setForm({ ...form, utilization: Number(v) || 0 })} />
            </div>
          )}

          {mode !== "view" && (
            <DialogFooter>
              <Button onClick={onSave}>Save Warehouse</Button>
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