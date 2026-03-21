import { useState } from "react";
import { Lock, Moon, ShieldCheck, Sun, User as UserIcon } from "lucide-react";
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
      const { token, user } = await authApi.login(username.trim(), password.trim());
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/40">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute bottom-[-100px] right-[-80px] h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-400/15" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-200/20 blur-3xl dark:bg-fuchsia-500/10" />
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid overflow-hidden rounded-[36px] border border-white/40 bg-white/70 shadow-[0_30px_100px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 p-10 text-white lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                <ShieldCheck className="h-4 w-4" />
                Smart inventory workspace
              </div>

              <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight">
                Inventory
                <br />
                Management System
              </h1>
            </div>
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="mb-10 flex items-center justify-between">
              <div className="lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Inventory System
                </div>
              </div>

              <button
                onClick={onToggleTheme}
                className="ml-auto rounded-2xl border border-black/5 bg-white/70 p-3 text-zinc-700 shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Login
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Please login to your account.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Username
                  </label>
                  <div className="group relative">
                    <UserIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition group-focus-within:text-indigo-500" />
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full rounded-2xl border border-zinc-200 bg-white/80 py-3.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    Password
                  </label>
                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition group-focus-within:text-indigo-500" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      className="w-full rounded-2xl border border-zinc-200 bg-white/80 py-3.5 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-zinc-950 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 dark:from-white dark:to-zinc-300 dark:text-zinc-950 dark:shadow-none"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
