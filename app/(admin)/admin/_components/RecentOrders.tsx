// File: app/(admin)/admin/_components/RecentOrders.tsx

"use client";

import { Order } from "./RecentActivity"; // Import the type from the parent container
import { ShoppingCart, PackageX } from "lucide-react";

interface RecentOrdersProps {
  orders: Order[] | undefined; // It can receive an array or be undefined during load
}

export const RecentOrders = ({ orders }: RecentOrdersProps) => {
  // 🛡️ --- THE SAFETY GUARD --- 🛡️
  // This check prevents the crash. If `orders` is undefined, null, or an empty
  // array, it will render a helpful message instead of trying to .map().
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center h-full flex flex-col justify-center">
        <PackageX className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-800">
          No Recent Orders
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          When new orders are placed, they will appear here.
        </p>
      </div>
    );
  }

  // If the guard passes, `orders` is a valid, non-empty array. The .map() is now safe.
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Recent Orders
      </h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full mr-4">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {order.user.name || "Guest User"}
                </p>
                <p className="text-sm text-gray-500">
                  Order ID: #{order.id.substring(0, 8)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                ${(order.amount / 100).toFixed(2)}
              </p>
              <p
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
