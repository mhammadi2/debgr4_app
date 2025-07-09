// app/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Define types for better type safety
interface OrderDetails {
  id?: string;
  customer?: {
    email: string;
    name?: string;
  };
  amount?: number;
  status?: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const { clearCart } = useCart();

  useEffect(() => {
    // Check for both sessionId and orderId
    if (!sessionId || !orderId) {
      setError("Invalid checkout session or order ID");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `/api/verify-payment?session_id=${sessionId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to verify payment");
        }

        const data = await response.json();
        setOrderDetails(data);

        // Clear the cart after successful payment
        clearCart();
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details");
        console.error("Payment verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, orderId, clearCart]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-500 mr-2" />
            <h1 className="text-xl font-bold text-red-700">Payment Error</h1>
          </div>
          <p className="text-red-600 mb-6 text-center">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/products"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mt-2">
            Your order #{orderId} has been placed successfully.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Order ID:</span> {orderId}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {orderDetails?.customer?.email || "Not available"}
            </p>
            {orderDetails?.amount && (
              <p>
                <span className="font-medium">Total:</span> $
                {(orderDetails.amount / 100).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700">
            We've sent a confirmation email with your order details. Your items
            will be shipped soon.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-green-500 text-white px-6 py-2 rounded-md text-center hover:bg-green-600 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href={`/orders/${orderId}`}
              className="bg-blue-500 text-white px-6 py-2 rounded-md text-center hover:bg-blue-600 transition"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
