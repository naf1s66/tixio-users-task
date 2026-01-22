export type Role = "admin" | "editor" | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export async function fetchUsers(params: { search?: string; role?: Role | "" }, signal?: AbortSignal) {
  const url = new URL(`${API_BASE}/users`);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.role) url.searchParams.set("role", params.role);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error("Failed to fetch users");
  return (await res.json()) as User[];
}

export async function fetchUser(id: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/users/${id}`, { signal });
  if (!res.ok) throw new Error("Failed to fetch user");
  return (await res.json()) as User;
}

export async function toggleActive(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}/toggle-active`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to toggle active");
  return (await res.json()) as User;
}
