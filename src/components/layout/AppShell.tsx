import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "../ui/button"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import type { Page } from "../../App"

export default function AppShell({
  children,
  page,
  setPage,
}: {
  children: React.ReactNode
  page: Page
  setPage: (page: Page) => void
}) {
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_46%,#020617_100%)] text-white"
          : "min-h-screen bg-slate-100 text-slate-900"
      }
    >
      <div className="grid min-h-screen lg:grid-cols-[288px_1fr]">
        <Sidebar page={page} setPage={setPage} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setDarkMode((v) => !v)}
              className={
                darkMode
                  ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-900"
              }
            >
              {darkMode ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>

          <Topbar />
          {children}
        </main>
      </div>
    </div>
  )
}