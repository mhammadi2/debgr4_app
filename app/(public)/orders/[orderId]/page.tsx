"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  Check,
  Clock,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// Order status type matching your API
type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// ✅ EXCELLENT: Interface matching your actual API response
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number | string;
  imageUrl?: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    slug: string;
  };
}

interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderDetails {
  id: string;
  orderId: string;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number | string;
  paymentIntent: string | null;
  specialInstructions: string | null;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress | null;
}

// ✅ EXCELLENT: Helper functions
const toNumber = (value: number | string | any): number => {
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

// ✅ IMPROVED: Add currency symbol
const formatCurrency = (value: number | string | any): string => {
  const numValue = toNumber(value);
  return `${numValue.toFixed(2)}`;
};

// ✅ IMPROVED: Add order status colors
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-purple-100 text-purple-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default: // PENDING
      return "bg-yellow-100 text-yellow-800";
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push(`/login?redirect=/orders/${orderId}`);
            return;
          }

          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details ||
              errorData.error ||
              `Error ${response.status}: Could not fetch order`
          );
        }

        const data = await response.json();
        console.log("📦 Order data received:", data);
        setOrder(data);
      } catch (err: any) {
        setError(
          err.message || "Could not load order details. Please try again later."
        );
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, router]);

  // ✅ EXCELLENT: Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Loading your order...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ EXCELLENT: Error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-700 mb-4">
            Order Not Found
          </h1>
          <p className="text-red-600 mb-6">
            {error || "Order details could not be loaded"}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/products"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ EXCELLENT: Status step logic
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

  // ✅ EXCELLENT: Date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true, // ✅ IMPROVED: Add 12-hour format
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ IMPROVED: Better back button logic */}
      <div className="mb-6">
        {order.userId ? (
          <Link
            href="/profile/orders"
            className="inline-flex items-center text-sm text-green-700 hover:text-green-800 hover:underline group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Your Orders
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center text-sm text-green-700 hover:text-green-800 hover:underline group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* ✅ IMPROVED: Order Header with better status display */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center mb-2">
                <ShoppingBag className="h-8 w-8 mr-3" />
                Order #{order.orderId}
              </h1>
              <div className="space-y-1 text-green-100">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Placed on {formatDate(order.createdAt)}
                </p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {order.customerEmail}
                </p>
                <p className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  {order.customerName}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)} border-2 border-white`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ EXCELLENT: Order Status Tracking */}
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Order Status
          </h2>

          {order.status === "CANCELLED" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 flex items-center">
              <AlertCircle className="mr-3 flex-shrink-0" size={24} />
              <div>
                <p className="font-semibold text-lg">
                  This order has been cancelled
                </p>
                <p className="text-sm mt-1">
                  Please contact customer support for further assistance or
                  refund information.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* ✅ IMPROVED: Progress bar with better animation */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-10 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      currentStep === 0
                        ? "15%"
                        : currentStep === 1
                          ? "45%"
                          : currentStep === 2
                            ? "75%"
                            : "100%",
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              {/* ✅ IMPROVED: Status steps with better spacing */}
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {[
                  { title: "Order Received", icon: Package, step: 0 },
                  { title: "Processing", icon: Clock, step: 1 },
                  { title: "Shipped", icon: Truck, step: 2 },
                  { title: "Delivered", icon: Check, step: 3 },
                ].map((status) => (
                  <div key={status.title} className="text-center">
                    <motion.div
                      className={`
                        w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-4 transition-all duration-300
                        ${
                          currentStep >= status.step
                            ? "bg-green-500 text-white border-green-500 shadow-lg"
                            : "bg-gray-100 text-gray-400 border-gray-200"
                        }
                      `}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: currentStep >= status.step ? 1 : 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <status.icon size={28} />
                    </motion.div>
                    <p
                      className={`font-semibold text-sm ${
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

        {/* ✅ EXCELLENT: Order Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Shipping Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  {order.customerName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                {order.customerPhone && (
                  <p className="text-gray-600 flex items-center mt-3 pt-3 border-t">
                    <Phone className="h-4 w-4 mr-2" />
                    {order.customerPhone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No shipping address available
              </p>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span
                  className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              {order.paymentIntent && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Payment ID:</span>
                  <span className="font-mono text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                    {order.paymentIntent}
                  </span>
                </div>
              )}
            </div>
            {order.specialInstructions && (
              <div className="mt-4 pt-4 border-t">
                <span className="font-medium text-gray-700">
                  Special Instructions:
                </span>
                <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-3 rounded italic">
                  "{order.specialInstructions}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ EXCELLENT: Order Items */}
        <div className="p-6 border-t bg-gray-50">
          <h3 className="font-bold text-xl mb-6 text-gray-800">Order Items</h3>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-20 h-20 mr-6 overflow-hidden rounded-lg flex-shrink-0">
                  {item.imageUrl || item.product?.imageUrl ? (
                    <Image
                      src={
                        item.imageUrl ||
                        item.product.imageUrl ||
                        "/placeholder.png"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  {item.product?.slug ? (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-semibold text-lg text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="font-semibold text-lg text-gray-800">
                      {item.name}
                    </p>
                  )}
                  <p className="text-gray-600 mt-1">
                    Quantity: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    {formatCurrency(toNumber(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ IMPROVED: Order Summary */}
          <div className="mt-8 pt-6 border-t bg-white rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ IMPROVED: Actions */}
        <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-50 border-t">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link
              href="/products"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 text-center font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              Continue Shopping
            </Link>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Print Receipt
              </button>
              {order.userId && (
                <Link
                  href="/profile/orders"
                  className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-center font-medium"
                >
                  View All Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
