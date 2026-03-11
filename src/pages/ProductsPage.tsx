import { useMemo, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { products as seedProducts } from "../data/products"
import type { Product } from "../types/product"
import { currency, isExpiringSoon } from "../lib/format"

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [selected, setSelected] = useState<Product | null>(null)
  const emptyForm: Product = {
    sku_id: "",
    name: "",
    unit_price: 0,
    stock_quantity: 0,
    reorder_point: 0,
    expire_date: "",
    category_name: "",
    supplier_name: "",
    manager_name: "",
  }
  const [form, setForm] = useState<Product>(emptyForm)

  const filtered = useMemo(
    () =>
      items.filter((p) =>
        `${p.sku_id} ${p.name} ${p.category_name} ${p.supplier_name}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const onCreate = () => {
    setMode("create")
    setForm(emptyForm)
    setSelected(null)
    setOpen(true)
  }

  const onEdit = (item: Product) => {
    setMode("edit")
    setForm(item)
    setSelected(item)
    setOpen(true)
  }

  const onView = (item: Product) => {
    setMode("view")
    setSelected(item)
    setOpen(true)
  }

  const onDelete = (item: Product) => {
    setItems((curr) => curr.filter((x) => x.sku_id !== item.sku_id))
  }

  const onSave = () => {
    if (mode === "create") {
      setItems((curr) => [form, ...curr])
    } else if (mode === "edit" && selected) {
      setItems((curr) => curr.map((x) => (x.sku_id === selected.sku_id ? form : x)))
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Products</h2>
          <p className="text-sm text-slate-400">Manage products and expiry dates.</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border-white/10 bg-white/5 text-white"
          />
          <Button onClick={onCreate}>New Product</Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription className="text-slate-400">
            Full CRUD product management.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3">SKU</th>
                <th className="py-3">Name</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Expire Date</th>
                <th className="py-3">Category</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.sku_id} className="border-b border-white/5">
                  <td className="py-4">{item.sku_id}</td>
                  <td className="py-4">{item.name}</td>
                  <td className="py-4">{currency(item.unit_price)}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span>{item.stock_quantity}</span>
                      {item.stock_quantity <= item.reorder_point && (
                        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                          Reorder
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span>{item.expire_date}</span>
                      {isExpiringSoon(item.expire_date) && (
                        <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-300">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4">{item.category_name}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onView(item)}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
                        Delete
                      </Button>
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
              {mode === "create" ? "Create Product" : mode === "edit" ? "Edit Product" : "Product Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Product form with expiry tracking.
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
              <InputField label="SKU ID" value={form.sku_id} onChange={(v) => setForm({ ...form, sku_id: v })} />
              <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <InputField label="Price" type="number" value={String(form.unit_price)} onChange={(v) => setForm({ ...form, unit_price: Number(v) || 0 })} />
              <InputField label="Stock Quantity" type="number" value={String(form.stock_quantity)} onChange={(v) => setForm({ ...form, stock_quantity: Number(v) || 0 })} />
              <InputField label="Reorder Point" type="number" value={String(form.reorder_point)} onChange={(v) => setForm({ ...form, reorder_point: Number(v) || 0 })} />
              <InputField label="Expire Date" type="date" value={form.expire_date} onChange={(v) => setForm({ ...form, expire_date: v })} />
              <InputField label="Category" value={form.category_name} onChange={(v) => setForm({ ...form, category_name: v })} />
              <InputField label="Supplier" value={form.supplier_name} onChange={(v) => setForm({ ...form, supplier_name: v })} />
              <InputField label="Manager" value={form.manager_name} onChange={(v) => setForm({ ...form, manager_name: v })} />
            </div>
          )}

          {mode !== "view" && (
            <DialogFooter>
              <Button onClick={onSave}>Save Product</Button>
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