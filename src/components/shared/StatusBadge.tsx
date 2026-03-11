import { Badge } from "@/components/ui/badge"

export default function StatusBadge({ value }: { value: string }) {
  let cls = "border-slate-500/20 bg-slate-500/10 text-slate-300"

  if (["Paid", "Completed", "In Transit"].includes(value)) {
    cls = "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
  } else if (
    ["Pending", "Processing", "Awaiting Payment", "Not Shipped", "Label Created"].includes(value)
  ) {
    cls = "border-amber-500/20 bg-amber-500/10 text-amber-300"
  }

  return <Badge className={cls}>{value}</Badge>
}