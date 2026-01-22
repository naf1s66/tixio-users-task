import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser, fetchUsers, toggleActive, type Role, type User } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

function roleBadgeVariant(role: Role) {
  // keeping it simple; shadcn Badge has variants if you configured them
  return role;
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
        "w-full text-left rounded-lg border p-3 transition",
        selected ? "bg-muted" : "hover:bg-muted/60"
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{user.name}</div>
        <Badge>{roleBadgeVariant(user.role)}</Badge>
      </div>
      <div className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
        <span className={user.active ? "text-emerald-600" : "text-zinc-500"}>
          {user.active ? "active" : "inactive"}
        </span>
        <span className="text-xs">•</span>
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

  // Users list (React Query handles cancellation if we pass signal in queryFn)
  const usersQuery = useQuery({
    queryKey: ["users", { search, role }],
    queryFn: ({ signal }) => fetchUsers({ search, role }, signal),
    staleTime: 0
  });

  const sortedUsers = useMemo(() => {
    const list = usersQuery.data ?? [];
    if (!sortByName) return list;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [usersQuery.data, sortByName]);

  // Ensure selected user stays valid after refetch/filter
  useEffect(() => {
    if (!selectedId) return;
    if (usersQuery.isLoading) return;
    const exists = (usersQuery.data ?? []).some((u) => u.id === selectedId);
    if (!exists) setSelectedId(null);
  }, [usersQuery.data, usersQuery.isLoading, selectedId]);

  // User details query
  const userQuery = useQuery({
    queryKey: ["user", selectedId],
    queryFn: ({ signal }) => {
      if (!selectedId) throw new Error("No user selected");
      return fetchUser(selectedId, signal);
    },
    enabled: !!selectedId
  });

  // Bonus: viewing profile timer
  const [secondsViewing, setSecondsViewing] = useState(0);
  useEffect(() => {
    setSecondsViewing(0);
    if (!selectedId) return;

    const t = window.setInterval(() => setSecondsViewing((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [selectedId]);

  // Optimistic toggle mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleActive(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["users"] });
      await qc.cancelQueries({ queryKey: ["user", id] });

      const prevUsers = qc.getQueryData<User[]>(["users", { search, role }]);
      const prevUser = qc.getQueryData<User>(["user", id]);

      // optimistic update list
      if (prevUsers) {
        qc.setQueryData<User[]>(
          ["users", { search, role }],
          prevUsers.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
        );
      }

      // optimistic update details
      if (prevUser) {
        qc.setQueryData<User>(["user", id], { ...prevUser, active: !prevUser.active });
      }

      return { prevUsers, prevUser };
    },
    onError: (_err, id, ctx) => {
      if (ctx?.prevUsers) qc.setQueryData(["users", { search, role }], ctx.prevUsers);
      if (ctx?.prevUser) qc.setQueryData(["user", id], ctx.prevUser);
    },
    onSuccess: (updated) => {
      // ensure caches align with server response
      qc.setQueryData<User>(["user", updated.id], updated);
      qc.invalidateQueries({ queryKey: ["users"] });
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Typing refetches automatically; previous requests are cancelled via AbortSignal.
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Select value={role || "all"} onValueChange={(v) => setRole(v === "all" ? "" : (v as Role))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="editor">editor</SelectItem>
                <SelectItem value="viewer">viewer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortByName((s) => !s)}
              disabled={usersQuery.isLoading}
              title={usersQuery.isLoading ? "Disabled while loading" : "Toggle sort"}
            >
              {sortByName ? "Sorted by Name" : "Sort by Name"}
            </Button>
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
                <div className="space-y-2">
                  {sortedUsers.map((u) => (
                    <UsersListItem
                      key={u.id}
                      user={u}
                      selected={u.id === selectedId}
                      onClick={() => setSelectedId(u.id)}
                    />
                  ))}
                </div>
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
                <div className="space-y-3">
                  <div className="text-xl font-semibold">{userQuery.data.name}</div>
                  <div className="text-sm text-muted-foreground">{userQuery.data.email}</div>
                  <div className="flex items-center gap-2">
                    <Badge>{userQuery.data.role}</Badge>
                    <span className={userQuery.data.active ? "text-emerald-600" : "text-zinc-500"}>
                      {userQuery.data.active ? "active" : "inactive"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm">
                    <span className="font-medium">⭐ Bonus:</span>{" "}
                    <span className="text-muted-foreground">
                      Viewing profile for {secondsViewing} seconds
                    </span>
                  </div>

                  <Button
                    onClick={() => toggleMutation.mutate(userQuery.data.id)}
                    disabled={toggleMutation.isPending}
                  >
                    {toggleMutation.isPending ? "Toggling..." : "Toggle Active"}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="text-xs text-muted-foreground">
          Backend Swagger: <span className="font-mono">http://localhost:3000/docs</span>
        </div>
      </div>
    </div>
  );
}
