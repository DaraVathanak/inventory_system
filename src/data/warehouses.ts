import type { WarehouseRecord } from "@/types/warehouse"

export const warehouses: WarehouseRecord[] = [
  {
    warehouse_id: "WH-01",
    location_name: "North Hub",
    address: "Dallas, TX",
    capacity: 5200,
    utilization: 72,
  },
  {
    warehouse_id: "WH-02",
    location_name: "West Depot",
    address: "Phoenix, AZ",
    capacity: 4100,
    utilization: 64,
  },
  {
    warehouse_id: "WH-03",
    location_name: "East Center",
    address: "Atlanta, GA",
    capacity: 6100,
    utilization: 81,
  },
]