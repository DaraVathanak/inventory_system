import type { ReportRecord } from "@/types/report"

export const reports: ReportRecord[] = [
  {
    report_id: "REP-201",
    type: "Inventory Summary",
    date: "2026-03-01",
    summary: "Stock movement and reorder insights",
  },
  {
    report_id: "REP-202",
    type: "Order Performance",
    date: "2026-03-05",
    summary: "Delivery and payment overview",
  },
  {
    report_id: "REP-203",
    type: "Warehouse Capacity",
    date: "2026-03-07",
    summary: "Utilization across all warehouse locations",
  },
]