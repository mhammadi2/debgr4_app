// File: app/(admin)/admin/_components/RecentOrders.tsx (Corrected)

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

// Define a type for the order data we expect from the API
type RecentOrder = {
  id: string;
  totalAmount: number;
  user: {
    name: string | null; // User's name can be null
    email: string | null; // User's email can be null
  } | null; // The entire user object can be null
};

// Function to fetch the recent orders data
const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
  const res = await fetch("/api/admin/orders/recent");
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

export function RecentOrders() {
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<RecentOrder[]>({
    queryKey: ["admin-recent-orders"],
    queryFn: fetchRecentOrders,
  });

  if (isLoading) return <div>Loading recent orders...</div>;
  if (isError) return <div>Error fetching orders.</div>;

  return (
    <div className="space-y-8">
      {orders?.map((order) => (
        <div className="flex items-center" key={order.id}>
          <Avatar className="h-9 w-9">
            {/* The user might not exist, so we provide a fallback */}
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>
              {/* Fallback initials, e.g., "DU" for "Deleted User" */}
              {order.user?.name?.charAt(0).toUpperCase() || "D"}
              {order.user?.name?.split(" ")[1]?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {/* 
                ✅ THE FIX: Use optional chaining `?.` and a fallback.
                If `order.user` is null, it will display "Deleted User".
              */}
              {order.user?.name || "Deleted User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {/* Also protect the email field for robustness */}
              {order.user?.email || "No email available"}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +${(order.totalAmount / 100).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
