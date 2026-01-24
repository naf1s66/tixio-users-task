import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser, fetchUsers, toggleActive, type PaginatedResponse, type Role, type User } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpAZ, CheckCircle2, Search, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

function roleBadgeVariant(role: Role) {
  return role;
}

function roleLabel(role: Role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function UsersListItem({
  user,
  selected,
  onClick
}: {
  user: User;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-lg border p-3 transition-colors duration-200",
        selected ? "bg-muted" : "hover:bg-muted/60"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{user.name}</div>
        <Badge>{roleLabel(roleBadgeVariant(user.role))}</Badge>
      </div>
      <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
        <span
          className={[
            "inline-flex items-center gap-1 text-xs font-medium",
            user.active ? "text-emerald-600" : "text-rose-600"
          ].join(" ")}
        >
          {user.active ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {user.active ? "active" : "inactive"}
        </span>
        <span className="text-xs">-</span>
        <span className="text-xs">{user.email}</span>
      </div>
    </button>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

export default function App() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [sortByName, setSortByName] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, role]);

  const usersQuery = useQuery({
    queryKey: ["users", { search, role, page, limit }],
    queryFn: ({ signal }) => fetchUsers({ search, role, page, limit }, signal),
    staleTime: 0
  });

  const sortedUsers = useMemo(() => {
    const list = usersQuery.data?.data ?? [];
    if (!sortByName) return list;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [usersQuery.data?.data, sortByName]);

  // Ensure selected user stays valid after refetch/filter
  useEffect(() => {
    if (!selectedId) return;
    if (usersQuery.isLoading) return;
    const exists = (usersQuery.data?.data ?? []).some((u) => u.id === selectedId);
    if (!exists) setSelectedId(null);
  }, [usersQuery.data?.data, usersQuery.isLoading, selectedId]);

  const userQuery = useQuery({
    queryKey: ["user", selectedId],
    queryFn: ({ signal }) => {
      if (!selectedId) throw new Error("No user selected");
      return fetchUser(selectedId, signal);
    },
    enabled: !!selectedId
  });

  const [secondsViewing, setSecondsViewing] = useState(0);
  useEffect(() => {
    setSecondsViewing(0);
    if (!selectedId) return;

    const t = window.setInterval(() => setSecondsViewing((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [selectedId]);

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleActive(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["users"] });
      await qc.cancelQueries({ queryKey: ["user", id] });

      const prevUsers = qc.getQueryData<PaginatedResponse<User>>(["users", { search, role, page, limit }]);
      const prevUser = qc.getQueryData<User>(["user", id]);

      if (prevUsers) {
        qc.setQueryData<PaginatedResponse<User>>(
          ["users", { search, role, page, limit }],
          {
            ...prevUsers,
            data: prevUsers.data.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
          }
        );
      }

      if (prevUser) {
        qc.setQueryData<User>(["user", id], { ...prevUser, active: !prevUser.active });
      }

      return { prevUsers, prevUser };
    },
    onError: (_err, id, ctx) => {
      if (ctx?.prevUsers) qc.setQueryData(["users", { search, role, page, limit }], ctx.prevUsers);
      if (ctx?.prevUser) qc.setQueryData(["user", id], ctx.prevUser);
    },
    onSuccess: (updated) => {
      qc.setQueryData<User>(["user", updated.id], updated);
      qc.invalidateQueries({ queryKey: ["users"] });
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pr-10"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="w-[160px] shrink-0">
              <Select value={role || "all"} onValueChange={(v) => setRole(v === "all" ? "" : (v as Role))}>
                <SelectTrigger className="w-full min-w-0">
                <SelectValue className="truncate" placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            </div>

            <div className="w-[150px] shrink-0">
              <Button
                variant="outline"
                onClick={() => setSortByName((s) => !s)}
                disabled={usersQuery.isLoading}
                title={usersQuery.isLoading ? "Disabled while loading" : "Toggle sort"}
                className={[
                  "relative w-full justify-center gap-2 transition-colors",
                  sortByName
                    ? "border-black bg-black text-white hover:bg-black/90 hover:text-white"
                    : ""
                ].join(" ")}
                aria-pressed={sortByName}
              >
                <ArrowUpAZ className={sortByName ? "h-4 w-4 text-white" : "h-4 w-4 text-muted-foreground"} />
                {sortByName ? "Sorted A-Z" : "Sort by Name"}
                {sortByName ? (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500" />
                ) : null}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="min-h-[420px]">
            <CardHeader>
              <CardTitle>Users List</CardTitle>
            </CardHeader>
            <CardContent>
              {usersQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : usersQuery.isError ? (
                <div className="text-sm text-red-600">
                  Failed to load users. {(usersQuery.error as Error)?.message}
                </div>
              ) : sortedUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No users found.</div>
              ) : (
                <>
                  <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
                    {sortedUsers.map((u) => (
                      <UsersListItem
                        key={u.id}
                        user={u}
                        selected={u.id === selectedId}
                        onClick={() => setSelectedId(u.id)}
                      />
                    ))}
                  </div>
                  {usersQuery.data && usersQuery.data.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Page {usersQuery.data.meta.page} of {usersQuery.data.meta.totalPages}
                        {" "}({usersQuery.data.meta.total} total)
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p - 1)}
                          disabled={page === 1 || usersQuery.isFetching}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= usersQuery.data.meta.totalPages || usersQuery.isFetching}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="min-h-[420px]">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedId ? (
                <div className="text-sm text-muted-foreground">Select a user to view details.</div>
              ) : userQuery.isLoading ? (
                <DetailsSkeleton />
              ) : userQuery.isError ? (
                <div className="text-sm text-red-600">
                  Failed to load user. {(userQuery.error as Error)?.message}
                </div>
              ) : userQuery.data ? (
                <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                  <div className="text-xl font-semibold">{userQuery.data.name}</div>
                  <div className="text-sm text-muted-foreground">{userQuery.data.email}</div>
                  <div className="flex items-center gap-2">
                    <Badge>{roleLabel(userQuery.data.role)}</Badge>
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                        userQuery.data.active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      ].join(" ")}
                    >
                      {userQuery.data.active ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {userQuery.data.active ? "active" : "inactive"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    Viewing profile for {secondsViewing} seconds
                  </div>

                  <Button
                    onClick={() => toggleMutation.mutate(userQuery.data.id)}
                    disabled={toggleMutation.isPending}
                  >
                    {toggleMutation.isPending
                      ? "Toggling..."
                      : userQuery.data.active
                        ? "Deactivate"
                        : "Activate"}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-muted-foreground">
          Backend Swagger:{" "}
          <span className="font-mono">https://nestjs-showcase-backend.up.railway.app/docs</span>
        </div>
      </div>
    </div>
  );
}
