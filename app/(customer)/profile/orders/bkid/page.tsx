"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react"; // Key import for the fix
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Order, OrderItem, Product } from "@prisma/client";

// Define the full type for a single order from our API
type DetailedOrder = Order & {
  items: (OrderItem & { product: Product })[];
};

// The fetcher function for useSWR. It throws an error on non-ok responses.
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      const error = new Error("An error occurred while fetching the data.");
      // Attach extra info to the error object, which we'll use in ErrorState
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  });

// A reusable component for the loading state
const LoadingState = () => (
  <div className="flex justify-center items-center p-20">
    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
  </div>
);

// A reusable component for handling errors, including 404 Not Found
const ErrorState = ({ status }: { status?: number }) => (
  <div className="max-w-md mx-auto p-8 text-center text-red-600 bg-red-50 rounded-lg shadow-sm">
    <AlertCircle className="mx-auto h-12 w-12" />
    <h2 className="mt-4 text-xl font-semibold">
      {status === 404 ? "Order Not Found" : "Could Not Load Order"}
    </h2>
    <p className="mt-1 text-sm text-gray-500">
      {status === 404
        ? "This order does not exist or you don't have permission to view it."
        : "Something went wrong on our end. Please try again later."}
    </p>
    <Link
      href="/profile/orders"
      className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
    >
      <ArrowLeft className="-ml-1 mr-2 h-5 w-5" />
      Back to My Orders
    </Link>
  </div>
);

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // --- THE FIX ---
  // 1. Get the session status. `required: true` will automatically handle
  //    redirecting unauthenticated users to the login page.
  const { status: sessionStatus } = useSession({ required: true });

  // 2. Make the SWR key conditional. It will be `null` until the session
  //    is 'authenticated', preventing the API call from being made too early.
  const {
    data: order,
    error,
    isLoading,
  } = useSWR<DetailedOrder>(
    sessionStatus === "authenticated" ? `/api/orders/${id}` : null,
    fetcher
  );
  // --- END OF FIX ---

  // Display a loading state if the session is loading OR the data is fetching.
  if (sessionStatus === "loading" || isLoading) {
    return <LoadingState />;
  }

  // Handle any errors from the API call.
  if (error) {
    return <ErrorState status={(error as any).status} />;
  }

  // This state should ideally not be reached if error handling is correct,
  // but it's a good safeguard.
  if (!order) {
    return <ErrorState status={404} />;
  }

  // Assuming `shippingInfo` is a JSON field on your Order model from Stripe
  const { shippingInfo } = order as any;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-0">
      <Link
        href="/profile/orders"
        className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4 group"
      >
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to All Orders
      </Link>

      <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Order ID</dt>
            <dd className="text-gray-800 font-mono">
              #{order.id.split("-")[0]}
            </dd>
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
              ${(order.totalAmount / 100).toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
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
              Items in Order
            </h2>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="flex py-4">
                  <Image
                    src={item.product.imageUrl || "/placeholder.png"}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-md object-cover border"
                  />
                  <div className="ml-4 flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-gray-800">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-800">
                      ${(item.price / 100).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipped To
            </h2>
            {shippingInfo ? (
              <address className="text-sm text-gray-600 not-italic space-y-1">
                <p className="font-semibold text-gray-800">
                  {shippingInfo.name}
                </p>
                <p>{shippingInfo.address.line1}</p>
                {shippingInfo.address.line2 && (
                  <p>{shippingInfo.address.line2}</p>
                )}
                <p>
                  {shippingInfo.address.city}, {shippingInfo.address.state}{" "}
                  {shippingInfo.address.postal_code}
                </p>
                <p>{shippingInfo.address.country}</p>
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
