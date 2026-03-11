import { Button } from "@/components/ui/button"

type Column<RowType> = {
  key: keyof RowType | string
  label: string
  render?: (value: unknown, row: RowType) => React.ReactNode
}

export default function DataTable<RowType extends Record<string, unknown>>({
  columns,
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  columns: Column<RowType>[]
  rows: RowType[]
  onView?: (row: RowType) => void
  onEdit?: (row: RowType) => void
  onDelete?: (row: RowType) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-slate-400">
            {columns.map((col) => (
              <th key={String(col.key)} className="py-3">
                {col.label}
              </th>
            ))}
            {(onView || onEdit || onDelete) && <th className="py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-white/5">
              {columns.map((col) => (
                <td key={String(col.key)} className="py-4">
                  {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "")}
                </td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td className="py-4">
                  <div className="flex gap-2">
                    {onView && (
                      <Button size="sm" variant="outline" onClick={() => onView(row)}>
                        View
                      </Button>
                    )}
                    {onEdit && (
                      <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="destructive" onClick={() => onDelete(row)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}