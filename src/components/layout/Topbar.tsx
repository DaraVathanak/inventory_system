import { Bell, Filter, Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          placeholder="Global search..."
          className="w-72 border-0 bg-transparent p-0 text-white placeholder:text-slate-500 focus-visible:ring-0"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
          <Bell className="mr-2 h-4 w-4" />
          Alerts
        </Button>
        <Button variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
          This Month
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}