import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { usersApi, managersApi, employeesApi } from "../lib/api";
import { useApi } from "../lib/useApi";
import { User } from "../types";
import {
  PageHeader, Spinner, ErrorMessage, EmptyState, Modal,
  FormField, Input, Select, Button, Table, Thead, Th, Tr, Td,
} from "../components/ui";

type Role = "admin" | "manager" | "employee";

const ROLE_BADGE: Record<Role, string> = {
  admin:    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  manager:  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  employee: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${ROLE_BADGE[role as Role] ?? "bg-zinc-100 text-zinc-600"}`}>
      {role}
    </span>
  );
}

function formatDate(val: string | null | undefined) {
  if (!val) return <span className="text-xs text-zinc-400">Never</span>;
  return <span>{new Date(val).toLocaleString()}</span>;
}

function getDetails(u: User) {
  if (u.role === "admin")    return u.security_level ?? "standard";
  if (u.role === "manager")  return [u.department, u.access_level].filter(Boolean).join(" · ") || "—";
  if (u.role === "employee") return [u.full_name, u.position].filter(Boolean).join(" — ") || "—";
  return "—";
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────
function UserFormModal({ user, onClose, onDone }: {
  user?: User | null; onClose: () => void; onDone: () => void;
}) {
  const isEdit = !!user;
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    role:           (user?.role ?? "admin") as Role,
    username:       user?.username       ?? "",
    password:       "",
    // admin
    security_level: user?.security_level ?? "standard",
    // manager
    department:     user?.department     ?? "",
    access_level:   user?.access_level   ?? "read",
    // employee
    full_name:      user?.full_name ?? "",
    position:       user?.position  ?? "",
  });

  async function handleSave() {
    if (!isEdit && (!form.username || !form.password)) {
      setFormError("Username and password are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      if (isEdit) {
        // PATCH — only send changed fields
        const patch: Record<string, string> = {};
        if (form.password) patch.password = form.password;
        if (user!.role === "admin")    { patch.security_level = form.security_level; }
        if (user!.role === "manager")  { patch.department = form.department; patch.access_level = form.access_level; }
        if (user!.role === "employee") { patch.position = form.position; patch.full_name = form.full_name; }

        if (user!.role === "admin")    await usersApi.update(user!.id, patch);
        if (user!.role === "manager")  await managersApi.update(user!.id, patch);
        if (user!.role === "employee") await employeesApi.update(user!.id, patch);
      } else {
        if (form.role === "admin") {
          await usersApi.create({ username: form.username, password: form.password, security_level: form.security_level });
        } else if (form.role === "manager") {
          await managersApi.create({ username: form.username, password: form.password, department: form.department, access_level: form.access_level });
        } else {
          await employeesApi.create({ username: form.username, password: form.password, full_name: form.full_name, position: form.position });
        }
      }
      onDone(); onClose();
    } catch (e: unknown) {
      setFormError((e as { message: string }).message ?? "Failed.");
    } finally { setSaving(false); }
  }

  return (
    <Modal title={isEdit ? `Edit ${user!.role}` : "New user"} onClose={onClose}>
      <div className="space-y-4">

        {/* Role selector — only for new users */}
        {!isEdit && (
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</p>
            <div className="flex gap-2">
              {(["admin","manager","employee"] as Role[]).map((r) => (
                <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`flex-1 rounded-2xl border py-2.5 text-sm font-medium capitalize transition ${
                    form.role === r
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-black/10 text-zinc-600 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Username — only for new users */}
        {!isEdit && (
          <FormField label="Username">
            <Input value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} placeholder="john_doe" />
          </FormField>
        )}

        {/* Password — always optional on edit */}
        <FormField label={isEdit ? "New password (leave blank to keep)" : "Password"}>
          <Input type="password" value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="••••••••" />
        </FormField>

        {/* Role-specific fields */}
        {(isEdit ? user!.role : form.role) === "admin" && (
          <FormField label="Security level">
            <Select value={form.security_level} onChange={(e) => setForm(f => ({ ...f, security_level: e.target.value }))}>
              <option value="standard">Standard</option>
              <option value="super">Super</option>
            </Select>
          </FormField>
        )}

        {(isEdit ? user!.role : form.role) === "manager" && (
          <>
            <FormField label="Department">
              <Input value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Operations" />
            </FormField>
            <FormField label="Access level">
              <Select value={form.access_level} onChange={(e) => setForm(f => ({ ...f, access_level: e.target.value }))}>
                <option value="read">Read</option>
                <option value="full">Full</option>
              </Select>
            </FormField>
          </>
        )}

        {(isEdit ? user!.role : form.role) === "employee" && (
          <>
            <FormField label="Full name">
              <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
            </FormField>
            <FormField label="Position">
              <Input value={form.position} onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))} placeholder="e.g. Warehouse Staff" />
            </FormField>
          </>
        )}

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : `Create ${form.role}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { data: users, loading, error, refetch } = useApi(usersApi.list);
  const [showModal,   setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  function openNew()           { setEditingUser(null); setShowModal(true); }
  function openEdit(u: User)   { setEditingUser(u);    setShowModal(true); }

  async function handleDelete(id: string, role: Role) {
    if (!confirm(`Delete this ${role}?`)) return;
    if (role === "manager")       await managersApi.delete(id).catch(() => {});
    else if (role === "employee") await employeesApi.delete(id).catch(() => {});
    else                          await usersApi.delete(id).catch(() => {});
    refetch();
  }

  // Sort: admins first, then managers, then employees; within each sort by last_login desc
  const sorted = [...(users ?? [])].sort((a, b) => {
    const roleOrder = { admin: 0, manager: 1, employee: 2 };
    const ro = (roleOrder[a.role as Role] ?? 3) - (roleOrder[b.role as Role] ?? 3);
    if (ro !== 0) return ro;
    // Sort by last_login descending (most recent first, nulls last)
    if (!a.last_login && !b.last_login) return 0;
    if (!a.last_login) return 1;
    if (!b.last_login) return -1;
    return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage team accounts — view last login and edit details."
        action={
          <Button onClick={openNew}>
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New user</span>
          </Button>
        }
      />

      {loading && <Spinner />}
      {error   && <ErrorMessage message={error} />}
      {!loading && !error && (
        sorted.length > 0 ? (
          <Table>
            <Thead>
              <tr>
                <Th>Username</Th>
                <Th>Role</Th>
                <Th>Details</Th>
                <Th>Last login</Th>
                <Th />
              </tr>
            </Thead>
            <tbody>
              {sorted.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium">{u.username}</Td>
                  <Td><RoleBadge role={u.role} /></Td>
                  <Td className="text-sm text-zinc-500 dark:text-zinc-400">{getDetails(u)}</Td>
                  <Td className="text-sm">{formatDate(u.last_login)}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.role as Role)}
                        className="rounded-xl p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyState message="No users found." />
      )}

      {showModal && (
        <UserFormModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onDone={refetch}
        />
      )}
    </div>
  );
}