import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { usersApi, managersApi, employeesApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { User } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, StatusBadge,
  Table, Thead, Th, Tr, Td,
} from "../components/ui";

type Role = "admin" | "manager" | "employee";

const ROLE_COLORS: Record<Role, string> = {
  admin:    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  manager:  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  employee: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export default function UsersPage() {
  const { data: users, loading, error, refetch } = useApi(usersApi.list);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    username:       "",
    password:       "",
    role:           "admin" as Role,
    // admin fields
    security_level: "standard",
    // manager fields
    department:     "",
    access_level:   "read",
    // employee fields
    full_name:      "",
    position:       "",
  });

  function resetForm() {
    setForm({
      username: "", password: "", role: "admin",
      security_level: "standard", department: "", access_level: "read",
      full_name: "", position: "",
    });
    setFormError("");
  }

  async function handleCreate() {
    if (!form.username || !form.password) {
      setFormError("Username and password are required.");
      return;
    }
    setSaving(true); setFormError("");
    try {
      if (form.role === "admin") {
        await usersApi.create({
          username:       form.username,
          password:       form.password,
          security_level: form.security_level,
        });
      } else if (form.role === "manager") {
        await managersApi.create({
          username:     form.username,
          password:     form.password,
          department:   form.department,
          access_level: form.access_level,
        });
      } else {
        await employeesApi.create({
          username:  form.username,
          password:  form.password,
          full_name: form.full_name,
          position:  form.position,
        });
      }
      setShowModal(false);
      resetForm();
      refetch();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed to create user.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, role: Role) {
    if (!confirm(`Delete this ${role}?`)) return;
    if (role === "manager")       await managersApi.delete(id).catch(() => {});
    else if (role === "employee") await employeesApi.delete(id).catch(() => {});
    else                          await usersApi.delete(id).catch(() => {});
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage team accounts — admins, managers, and employees."
        action={
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New user</span>
          </Button>
        }
      />

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        users && users.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Username</Th>
                <Th>Role</Th>
                <Th>Level / Dept / Position</Th>
                <Th>Last Login</Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium">{u.username}</Td>
                  <Td>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${ROLE_COLORS[u.role as Role] ?? ""}`}>
                      {u.role}
                    </span>
                  </Td>
                  <Td>{u.security_level ?? u.department ?? u.access_level ?? "—"}</Td>
                  <Td>{u.last_login ? String(u.last_login).split("T")[0] : "—"}</Td>
                  <Td>
                    <button
                      onClick={() => handleDelete(u.id, u.role as Role)}
                      className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No users found." />
      )}

      {showModal && (
        <Modal title="New user" onClose={() => { setShowModal(false); resetForm(); }}>
          <div className="space-y-4">

            {/* Role selector */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</p>
              <div className="flex gap-2">
                {(["admin", "manager", "employee"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`flex-1 rounded-2xl border py-2.5 text-sm font-medium capitalize transition ${
                      form.role === r
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-black/10 text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Username">
              <Input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="john_doe"
              />
            </FormField>

            <FormField label="Password">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </FormField>

            {/* Role-specific fields */}
            {form.role === "admin" && (
              <FormField label="Security level">
                <Select
                  value={form.security_level}
                  onChange={(e) => setForm((f) => ({ ...f, security_level: e.target.value }))}
                >
                  <option value="standard">Standard</option>
                  <option value="super">Super</option>
                </Select>
              </FormField>
            )}

            {form.role === "manager" && (
              <>
                <FormField label="Department">
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    placeholder="e.g. Operations"
                  />
                </FormField>
                <FormField label="Access level">
                  <Select
                    value={form.access_level}
                    onChange={(e) => setForm((f) => ({ ...f, access_level: e.target.value }))}
                  >
                    <option value="read">Read</option>
                    <option value="full">Full</option>
                  </Select>
                </FormField>
              </>
            )}

            {form.role === "employee" && (
              <>
                <FormField label="Full name">
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </FormField>
                <FormField label="Position">
                  <Input
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    placeholder="e.g. Warehouse Staff"
                  />
                </FormField>
              </>
            )}

            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : `Create ${form.role}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}