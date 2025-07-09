import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Package, Home } from "lucide-react";

// ✅ Helper function to safely convert Decimal to number
const toNumber = (value: any): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  if (value && typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }
  if (value && typeof value === "object" && "toString" in value) {
    return parseFloat(value.toString());
  }
  return 0;
};

// This Server Component fetches data and handles security before rendering.
export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await getAuthSession();

  // 🔒 SECURITY 1: Redirect unauthenticated users.
  if (!session?.user || session.user.role !== "USER") {
    redirect(`/login?callbackUrl=/profile/orders/${params.orderId}`);
  }

  // Fetch the order, but only if it belongs to the logged-in user.
  const order = await prisma.order.findUnique({
    where: {
      orderId: params.orderId,
      // 🔒 SECURITY 2: Ensure the order's userId matches the session userId.
      userId: session.user.id,
    },
    include: {
      // ✅ ALIGNED DATA: Include the related models defined in our schema.
      shippingAddress: true,
      orderItems: {
        include: {
          product: true, // Also include product details for each item.
        },
      },
    },
  });

  // If the order is not found or doesn't belong to the user, show a clear message.
  if (!order) {
    return (
      <div className="max-w-md mx-auto p-8 text-center text-red-600 bg-red-50 rounded-lg shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Order Not Found</h2>
        <p className="mt-1 text-sm text-gray-500">
          This order does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/profile/orders"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
          Back to My Orders
        </Link>
      </div>
    );
  }

  // If the order is found, render the details.
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href="/profile/orders"
        className="inline-flex items-center text-sm text-green-700 hover:underline mb-4 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to All Orders
      </Link>

      <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Order #</dt>
            <dd className="text-gray-800 font-mono">{order.orderId}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Date</dt>
            <dd className="text-gray-800">
              {new Date(order.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Total</dt>
            <dd className="text-gray-800 font-semibold">
              {/* ✅ IMPROVED: Use helper function for Decimal conversion */}$
              {toNumber(order.totalAmount).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "SHIPPED"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "PROCESSING"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <Package size={12} className="mr-1.5" />
                {order.status}
              </span>
            </dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Items Ordered
            </h2>
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <li key={item.id} className="flex py-4 items-center">
                  <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                    <Image
                      src={item.imageUrl || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="rounded-md object-cover border"
                      sizes="64px"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {/* ✅ IMPROVED: Use helper function for Decimal conversion */}
                      ${(toNumber(item.price) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      (${toNumber(item.price).toFixed(2)} each)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home size={18} className="mr-2 text-gray-400" /> Shipped To
            </h2>
            {order.shippingAddress ? (
              <address className="text-sm text-gray-600 not-italic space-y-1">
                <p className="font-semibold text-gray-800">
                  {order.customerName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-gray-500">
                No shipping information available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
