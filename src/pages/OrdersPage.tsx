import { useMemo, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { orders as seedOrders } from "../data/orders"
import type { Order, OrderStatus, PaymentStatus, ShipmentStatus } from "../types/order"
import { currency } from "../lib/format"

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["Pending", "Processing", "Completed"]
const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["Awaiting Payment", "Paid"]
const SHIPMENT_STATUS_OPTIONS: ShipmentStatus[] = ["Not Shipped", "Label Created", "In Transit"]

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>(seedOrders)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [selected, setSelected] = useState<Order | null>(null)
  const emptyForm: Order = {
    order_id: "",
    customer_name: "",
    order_date: "",
    total_amount: 0,
    status: "Pending",
    payment_status: "Awaiting Payment",
    shipment_status: "Not Shipped",
  }
  const [form, setForm] = useState<Order>(emptyForm)

  const filtered = useMemo(
    () =>
      items.filter((o) =>
        `${o.order_id} ${o.customer_name} ${o.status}`.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  )

  const onCreate = () => {
    setMode("create")
    setForm(emptyForm)
    setSelected(null)
    setOpen(true)
  }

  const onEdit = (item: Order) => {
    setMode("edit")
    setForm(item)
    setSelected(item)
    setOpen(true)
  }

  const onView = (item: Order) => {
    setMode("view")
    setSelected(item)
    setOpen(true)
  }

  const onDelete = (item: Order) => {
    setItems((curr) => curr.filter((x) => x.order_id !== item.order_id))
  }

  const onSave = () => {
    if (mode === "create") {
      setItems((curr) => [form, ...curr])
    } else if (mode === "edit" && selected) {
      setItems((curr) => curr.map((x) => (x.order_id === selected.order_id ? form : x)))
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Orders</h2>
          <p className="text-sm text-slate-400">Manage order, payment, and shipment status.</p>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border-white/10 bg-white/5 text-white"
          />
          <Button onClick={onCreate}>New Order</Button>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription className="text-slate-400">
            Full CRUD order management.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3">Order ID</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3">Payment</th>
                <th className="py-3">Shipment</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.order_id} className="border-b border-white/5">
                  <td className="py-4">{item.order_id}</td>
                  <td className="py-4">{item.customer_name}</td>
                  <td className="py-4">{item.order_date}</td>
                  <td className="py-4">{currency(item.total_amount)}</td>
                  <td className="py-4"><OrderBadge value={item.status} /></td>
                  <td className="py-4"><OrderBadge value={item.payment_status} /></td>
                  <td className="py-4"><OrderBadge value={item.shipment_status} /></td>
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
              {mode === "create" ? "Create Order" : mode === "edit" ? "Edit Order" : "Order Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Order form with payment and shipment states.
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
              <InputField label="Order ID" value={form.order_id} onChange={(v) => setForm({ ...form, order_id: v })} />
              <InputField label="Customer" value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} />
              <InputField label="Order Date" type="date" value={form.order_date} onChange={(v) => setForm({ ...form, order_date: v })} />
              <InputField label="Total Amount" type="number" value={String(form.total_amount)} onChange={(v) => setForm({ ...form, total_amount: Number(v) || 0 })} />

              <SelectField<OrderStatus>
                label="Status"
                value={form.status}
                options={ORDER_STATUS_OPTIONS}
                onChange={(value) => setForm({ ...form, status: value })}
              />
              <SelectField<PaymentStatus>
                label="Payment Status"
                value={form.payment_status}
                options={PAYMENT_STATUS_OPTIONS}
                onChange={(value) => setForm({ ...form, payment_status: value })}
              />
              <SelectField<ShipmentStatus>
                label="Shipment Status"
                value={form.shipment_status}
                options={SHIPMENT_STATUS_OPTIONS}
                onChange={(value) => setForm({ ...form, shipment_status: value })}
              />
            </div>
          )}

          {mode !== "view" && (
            <DialogFooter>
              <Button onClick={onSave}>Save Order</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrderBadge({ value }: { value: string }) {
  let cls = "border-slate-500/20 bg-slate-500/10 text-slate-300"
  if (["Paid", "Completed", "In Transit"].includes(value)) {
    cls = "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
  } else if (["Pending", "Processing", "Awaiting Payment", "Not Shipped", "Label Created"].includes(value)) {
    cls = "border-amber-500/20 bg-amber-500/10 text-amber-300"
  }
  return <Badge className={cls}>{value}</Badge>
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

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  onChange: (value: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400">{label}</p>
      <Select value={value} onValueChange={(value) => onChange(value as T)}>
        <SelectTrigger className="border-white/10 bg-white/5 text-white">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-slate-900 text-white">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}