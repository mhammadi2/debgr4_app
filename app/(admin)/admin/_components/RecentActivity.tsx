// File: app/(admin)/admin/_components/RecentActivity.tsx (Corrected)

"use client";

// ✅ 1. IMPORT STATEMENTS: These are necessary and correct.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { UserRole } from "@prisma/client";

// --- Define the data types we expect from our APIs ---
type RecentOrder = {
  id: string;
  totalAmount: number;
  user: { name: string | null; email: string | null } | null;
};

type RecentUser = {
  id: string;
  name: string | null;
  email: string | null;
};

// --- API Fetching Functions ---
const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
  const res = await fetch("/api/admin/orders/recent");
  if (!res.ok) throw new Error("Failed to fetch recent orders");
  return res.json();
};

const fetchRecentUsers = async (): Promise<RecentUser[]> => {
  const res = await fetch("/api/admin/users/recent");
  if (!res.ok) throw new Error("Failed to fetch recent users");
  return res.json();
};

// --- The Main Component ---
export function RecentActivity() {
  const { data: orders, isLoading: isLoadingOrders } = useQuery<RecentOrder[]>({
    queryKey: ["admin-recent-orders"],
    queryFn: fetchRecentOrders,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<RecentUser[]>({
    queryKey: ["admin-recent-users"],
    queryFn: fetchRecentUsers,
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-md font-medium">Recent Orders</h3>
        <div className="mt-4 space-y-4">
          {isLoadingOrders && <p>Loading orders...</p>}
          {orders?.map((order) => (
            <div className="flex items-center" key={`order-${order.id}`}>
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {order.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {/* ✅ 2. THE FIX: Safely access user.name with a fallback */}
                  {order.user?.name || "Deleted User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.user?.email || "No email"}
                </p>
              </div>
              <div className="ml-auto font-medium">
                +${(order.totalAmount / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium">New Users</h3>
        <div className="mt-4 space-y-4">
          {isLoadingUsers && <p>Loading users...</p>}
          {users?.map((user) => (
            <div className="flex items-center" key={`user-${user.id}`}>
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {/* Also apply defensive coding here for robustness */}
                  {user.name || "Unnamed User"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.email || "No email"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
