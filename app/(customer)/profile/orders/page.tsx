// app/(customer)/profile/orders/page.tsx
"use client"; // This component fetches data on the client side

import useSWR from "swr";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

// The fetcher function for useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const OrderStatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
  if (status.toLowerCase() === "delivered") {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        Delivered
      </span>
    );
  }
  if (status.toLowerCase() === "shipped") {
    return (
      <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
        Shipped
      </span>
    );
  }
  return (
    <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
      Processing
    </span>
  );
};

export default function OrderHistoryPage() {
  // This API endpoint will be created in the next step.
  // It securely fetches orders for the currently logged-in user.
  const { data: orders, error, isLoading } = useSWR("/api/orders", fetcher);

  if (error)
    return (
      <div className="text-center text-red-500">Failed to load orders.</div>
    );
  if (isLoading)
    return (
      <div className="text-center text-gray-500">Loading your orders...</div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href="/profile"
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <ShoppingBag size={32} className="text-blue-600" />
        <h1 className="ml-3 text-2xl font-bold text-gray-800">
          My Order History
        </h1>
      </div>

      <div className="space-y-4">
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-4 border"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">
                  Order #{order.id.slice(-8)}
                </h3>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-sm text-gray-600">
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>
                  Total:{" "}
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                </p>
              </div>
              <div className="mt-4 pt-2 border-t">
                <h4 className="font-medium text-sm mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item: any) => (
                    <li
                      key={item.id}
                      className="text-xs text-gray-500 flex justify-between"
                    >
                      <span>
                        {item.product.name} (x{item.quantity})
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-md">
            You haven't placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
