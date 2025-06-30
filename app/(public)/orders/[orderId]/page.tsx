// app/orders/[orderId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, Truck, Check, Clock } from "lucide-react";

// Order status type
type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Order interface
interface OrderDetails {
  orderId: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderItems: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError("Could not load order details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Render error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold text-red-700 mb-4">
            Order Not Found
          </h1>
          <p className="text-red-600 mb-6">
            {error || "Order details could not be loaded"}
          </p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get status step number
  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "PROCESSING":
        return 1;
      case "SHIPPED":
        return 2;
      case "DELIVERED":
        return 3;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep(order.status);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Order Header */}
        <div className="bg-green-500 text-white p-6">
          <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
          <p className="mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>

        {/* Order Status Tracking */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>

          {order.status === "CANCELLED" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
              <Clock className="mr-2" size={24} />
              <div>
                <p className="font-semibold">This order has been cancelled</p>
                <p className="text-sm">
                  Please contact customer support for further assistance
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      currentStep === 0
                        ? "10%"
                        : currentStep === 1
                        ? "40%"
                        : currentStep === 2
                        ? "70%"
                        : "100%",
                  }}
                  transition={{ duration: 1 }}
                />
              </div>

              {/* Status steps */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { title: "Order Received", icon: Package, step: 0 },
                  { title: "Processing", icon: Clock, step: 1 },
                  { title: "Shipped", icon: Truck, step: 2 },
                  { title: "Delivered", icon: Check, step: 3 },
                ].map((status) => (
                  <div key={status.title} className="text-center">
                    <div
                      className={`
                      w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center
                      ${
                        currentStep >= status.step
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }
                    `}
                    >
                      <status.icon size={24} />
                    </div>
                    <p
                      className={`font-medium ${
                        currentStep >= status.step
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {status.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Shipping Information */}
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="bg-gray-50 rounded p-4">
              <p className="font-medium">{order.customerName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="bg-gray-50 rounded p-4">
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`
                  ${
                    order.paymentStatus === "PAID"
                      ? "text-green-600"
                      : order.paymentStatus === "FAILED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                `}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <span className="font-medium">Total:</span> $
                {order.totalAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.customerEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-t">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-3 bg-gray-50 rounded"
              >
                <div className="relative w-16 h-16 mr-4 overflow-hidden rounded">
                  <Image
                    src={item.imageUrl || "/placeholder-product.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t flex justify-between">
          <button
            onClick={() => router.push("/products")}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => window.print()}
            className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-100"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
