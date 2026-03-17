import { useState } from "react";
import {
  ArrowRight,
  Lock,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { authApi } from "../lib/api";
import { User } from "../types";

interface Props {
  onLogin: (user: User, token: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function LoginPage({ onLogin, isDark, onToggleTheme }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { token, user } = await authApi.login(username, password);
      onLogin(user, token);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Invalid credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-100 px-6 dark:bg-zinc-950">
      <div className="absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.15] dark:opacity-[0.05]" />
      </div>

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/30 bg-white/70 shadow-[0_30px_100px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/70 lg:grid-cols-2">
        {/* Left */}
        <div className="hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4" />
              Secure role-based inventory platform
            </div>

            <h1 className="max-w-xl text-5xl font-semibold tracking-tight leading-tight">
              Inventory Management System
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex w-full items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/70">
              <div className="relative overflow-hidden border-b border-black/5 bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 p-6 text-white dark:border-white/10 dark:from-white dark:via-zinc-100 dark:to-zinc-300 dark:text-zinc-950">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl dark:bg-zinc-400/20" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Secure inventory access</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
                  </div>

                  <button
                    onClick={onToggleTheme}
                    className="rounded-2xl bg-white/10 p-3 transition hover:scale-105 dark:bg-zinc-950/10"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-5 p-6">

                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full rounded-2xl border border-black/10 bg-zinc-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full rounded-2xl border border-black/10 bg-zinc-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                  />
                </div>

                {error && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 disabled:opacity-50 dark:bg-white dark:text-zinc-950"
                >
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}