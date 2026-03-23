import { AlertTriangle, Loader2, X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "../lib/utils";

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}
export function StatCard({ label, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className={cn("rounded-2xl p-2.5", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  active:     "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive:   "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  pending:    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped:    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered:  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled:  "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium capitalize",
        statusStyles[status] ?? "bg-zinc-100 text-zinc-600"
      )}
    >
      {status}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
    </div>
  );
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 dark:text-zinc-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  children: ReactNode;
}
export function FormField({ label, children }: FormFieldProps) {
  // Render asterisk in red
  const parts = label.split("*");
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {parts[0]}{parts.length > 1 && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800",
        props.className
      )}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-800",
        props.className
      )}
    />
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost";
}
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary" &&
          "bg-zinc-950 text-white hover:opacity-90 dark:bg-white dark:text-zinc-950",
        variant === "danger" &&
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
        variant === "ghost" &&
          "border border-black/10 text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-900",
        className
      )}
    />
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 dark:border-white/10">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-black/5 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/60">
      {children}
    </thead>
  );
}

export function Th({ children, className, onClick }: { children?: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, onClick }: { children?: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <td
      onClick={onClick}
      className={cn(
        "px-5 py-4 text-zinc-700 dark:text-zinc-300",
        className
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className, onClick }: { children?: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-black/5 bg-white/70 last:border-0 dark:border-white/5 dark:bg-zinc-950/50",
        className
      )}
    >
      {children}
    </tr>
  );
}