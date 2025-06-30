// app/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);

  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid checkout session");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `/api/verify-payment?session_id=${sessionId}`
        );
        if (!response.ok) throw new Error("Failed to verify payment");

        const data = await response.json();
        setOrderDetails(data);

        // Clear the cart after successful payment
        clearCart();
      } catch (err) {
        setError("Failed to fetch order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart]);

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
          <h1 className="text-xl font-bold text-red-700 mb-4">Payment Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/products"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Shop
          </Link>
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
