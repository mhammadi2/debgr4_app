"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  AlertCircle,
  FileText,
  Loader2,
  ChevronRight,
  Package,
} from "lucide-react";

// ✅ CORRECT TYPE: Matches your API response from `/api/orders`
type OrderSummary = {
  id: string;
  orderId: string;
  createdAt: string;
  status: string;
  totalAmount: number | string; // ✅ FIXED: Can be Decimal or number
};

// ✅ HELPER FUNCTION: Convert Decimal to number safely
const toNumber = (value: number | string | any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return value.toNumber(); // Prisma Decimal
  }
  if (value && typeof value === "object" && "toString" in value) {
    return parseFloat(value.toString()); // Convert to string then to number
  }
  return 0;
};

// ✅ HELPER FUNCTION: Format currency safely
const formatCurrency = (value: number | string | any): string => {
  const numValue = toNumber(value);
  return `${numValue.toFixed(2)}`;
};

// ✅ IMPROVED FETCHER: Better error handling
const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please log in to view your orders");
    }

    let errorMessage = "Failed to fetch orders";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If we can't parse JSON, use the default message
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// ✅ ENHANCED STATUS BADGE: More comprehensive status handling
const OrderStatusBadge = ({ status }: { status: string }) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase";
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case "DELIVERED":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <Package size={12} className="mr-1" />
          {normalizedStatus}
        </span>
      );
    case "SHIPPED":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          <Package size={12} className="mr-1" />
          {normalizedStatus}
        </span>
      );
    case "PROCESSING":
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          <Package size={12} className="mr-1" />
          {normalizedStatus}
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <Package size={12} className="mr-1" />
          {normalizedStatus}
        </span>
      );
    default: // PENDING
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <Package size={12} className="mr-1" />
          {normalizedStatus}
        </span>
      );
  }
};

// ✅ IMPROVED LOADING STATE
const LoadingState = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
    <div className="flex justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <span className="ml-3 text-gray-600">Loading your orders...</span>
    </div>
  </div>
);

// ✅ IMPROVED ERROR STATE
const ErrorState = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
    <h2 className="mt-4 text-xl font-semibold text-red-700">
      Could not load orders
    </h2>
    <p className="mt-2 text-sm text-red-600">{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Try Again
    </button>
  </div>
);

// ✅ IMPROVED EMPTY STATE
const EmptyState = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
    <FileText className="mx-auto h-16 w-16 text-gray-400" />
    <h2 className="mt-4 text-xl font-semibold text-gray-700">
      No Orders Found
    </h2>
    <p className="mt-2 text-sm text-gray-500">
      You haven't placed any orders with us yet. Start shopping to see your
      orders here!
    </p>
    <Link
      href="/products"
      className="mt-6 inline-block px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
    >
      Start Shopping
    </Link>
  </div>
);

// ✅ IMPROVED DATE FORMATTING
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ✅ INDIVIDUAL ORDER ITEM COMPONENT
const OrderItem = ({ order }: { order: OrderSummary }) => (
  <li className="hover:bg-gray-50 transition-colors duration-200">
    <Link href={`/orders/${order.orderId}`} className="block p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700 truncate">
                Order #{order.orderId}
              </p>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  📅 {formatDate(order.createdAt)}
                </span>
                <span className="flex items-center">
                  💰 Total:{" "}
                  <span className="font-medium text-gray-700 ml-1">
                    {formatCurrency(order.totalAmount)}{" "}
                    {/* ✅ FIXED: Use helper function */}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </Link>
  </li>
);

// ✅ MAIN COMPONENT
export function OrdersClient() {
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR<OrderSummary[]>("/api/orders", fetcher, {
    // ✅ IMPROVED SWR CONFIG
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    onError: (error) => {
      console.error("Orders fetch error:", error);
    },
  });

  // ✅ IMPROVED LOADING STATE
  if (isLoading) return <LoadingState />;

  // ✅ IMPROVED ERROR STATE
  if (error) return <ErrorState message={error.message} />;

  // ✅ IMPROVED EMPTY STATE
  if (!orders || orders.length === 0) return <EmptyState />;

  return (
    <div className="space-y-6">
      {/* ✅ HEADER WITH COUNT */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Your Orders ({orders.length})
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Click on any order to view detailed tracking information
        </p>
      </div>

      {/* ✅ ORDERS LIST */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <ul role="list" className="divide-y divide-gray-200">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </ul>
      </div>

      {/* ✅ FOOTER ACTION */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Looking for something specific?
        </p>
        <Link
          href="/products"
          className="inline-block px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
