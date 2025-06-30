// File: app/(admin)/admin/_components/RecentActivity.tsx

"use client";

import useSWR from "swr";
import { Loader2, AlertTriangle } from "lucide-react";
import { RecentOrders } from "./RecentOrders";
import { NewUsers } from "./NewUsers";

// Define the data shapes for type safety. Adjust these to match your Prisma models.
export interface Order {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  createdAt: string; // Or Date
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface NewUser {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string; // Or Date
}

// This is now a "Container Component"
export default function RecentActivity() {
  // 1. Fetch the data needed for this section using SWR.
  const { data: orders, error: ordersError } = useSWR<Order[]>(
    "/api/admin/orders/recent"
  );
  const { data: users, error: usersError } = useSWR<NewUser[]>(
    "/api/admin/users/recent"
  );

  // 2. Determine the overall loading and error states for the entire section.
  const isLoading = !orders && !ordersError && !users && !usersError;
  const error = ordersError || usersError;

  // 3. Render a consolidated error state if any data fetch fails.
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <div>
            <p className="font-semibold text-red-800">
              Could not load recent activity
            </p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Render a skeleton loader while waiting for data. This prevents content layout shifts.
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-14 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-14 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="lg:col-span-1 p-6 bg-white rounded-lg shadow-md space-y-4">
          <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // 5. Once loaded, render the child components, passing the now-validated data as props.
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <RecentOrders orders={orders} />
      </div>
      <div className="lg:col-span-1">
        <NewUsers users={users} />
      </div>
    </div>
  );
}
