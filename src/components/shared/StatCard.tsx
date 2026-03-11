import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
}) {
  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            {subtitle ? (
              <p className="mt-2 text-sm text-emerald-500">{subtitle}</p>
            ) : null}
          </div>
          {icon ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}