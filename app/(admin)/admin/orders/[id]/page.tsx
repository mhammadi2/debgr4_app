"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  RefreshCw,
  Edit,
  Save,
  X,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface OrderDetails {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  adminNotes?: string;
  stripePaymentIntentId?: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      images: string[];
    };
  }[];
  address: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  refunds: {
    id: string;
    amount: number;
    reason: string;
    refundType: string;
    status: string;
    createdAt: string;
    stripeRefundId?: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  /* ----------------------- local state ---------------------------- */
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    trackingNumber: "",
    adminNotes: "",
  });

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    amount: 0,
    reason: "",
    refundType: "PARTIAL",
  });

  /* ----------------------- fetch order ---------------------------- */
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data);
      setEditData({
        status: data.status,
        trackingNumber: data.trackingNumber || "",
        adminNotes: data.adminNotes || "",
      });
    } catch (err) {
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  /* ----------------------- update order --------------------------- */
  const handleSaveChanges = async () => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order?.id, ...editData }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      await fetchOrder();
      setEditing(false);
      alert("Order updated successfully");
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order");
    }
  };

  /* ----------------------- refund order --------------------------- */
  const handleRefund = async () => {
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order?.id, ...refundData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to process refund");
      }

      await fetchOrder();
      setShowRefundModal(false);
      setRefundData({ amount: 0, reason: "", refundType: "PARTIAL" });
      alert("Refund processed successfully");
    } catch (err) {
      console.error("Error processing refund:", err);
      alert(err instanceof Error ? err.message : "Failed to process refund");
    }
  };

  /* ----------------------- render --------------------------------- */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    );
  }

  const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0);
  const canRefund =
    order.paymentStatus === "PAID" && totalRefunded < order.totalAmount;

  /* ----------------------- UI ------------------------------------- */
  return (
    <div className="space-y-6">
      {/* ───────────────── Header ───────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderId}
          </h1>
        </div>

        <div className="flex space-x-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Edit size={16} className="mr-2" />
              Edit Order
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveChanges}
                className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
            </div>
          )}

          {canRefund && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Process Refund
            </button>
          )}
        </div>
      </div>

      {/* ───────────────── Main Grid ───────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---------- Left side (details) ---------- */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Status card */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Order Status
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order Status
                </label>
                {editing ? (
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                ) : (
                  <BadgeStatus status={order.status} />
                )}
              </div>

              {/* payment status */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <BadgePayment status={order.paymentStatus} />
              </div>
            </div>

            {/* tracking number */}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tracking Number
              </label>
              {editing ? (
                <input
                  value={editData.trackingNumber}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      trackingNumber: e.target.value,
                    })
                  }
                  placeholder="Enter tracking number"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-gray-900">
                  {order.trackingNumber || "Not provided"}
                </p>
              )}
            </div>

            {/* admin notes */}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin Notes
              </label>
              {editing ? (
                <textarea
                  rows={3}
                  value={editData.adminNotes}
                  onChange={(e) =>
                    setEditData({ ...editData, adminNotes: e.target.value })
                  }
                  placeholder="Add internal notes..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-sm text-gray-900">
                  {order.adminNotes || "No notes"}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                    {item.product.images.length ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <p className="font-medium text-gray-900">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Right side (sidebar) ---------- */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Customer Information
            </h2>
            <InfoRow label="Name" value={order.customerName} />
            <InfoRow label="Email" value={order.customerEmail} />
            {order.customerPhone && (
              <InfoRow label="Phone" value={order.customerPhone} />
            )}
          </div>

          {/* Address */}
          {order.address && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                <MapPin size={18} className="mr-2" />
                Shipping Address
              </h2>
              <p className="text-sm text-gray-900">{order.address.street}</p>
              <p className="text-sm text-gray-900">
                {order.address.city}, {order.address.state}{" "}
                {order.address.zipCode}
              </p>
              <p className="text-sm text-gray-900">{order.address.country}</p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <DollarSign size={18} className="mr-2" />
              Payment Summary
            </h2>

            <SummaryRow
              label="Order Total"
              value={`${order.totalAmount.toFixed(2)}`}
            />
            {totalRefunded > 0 && (
              <SummaryRow
                label="Total Refunded"
                value={`-${totalRefunded.toFixed(2)}`}
                valueClass="text-red-900"
                labelClass="text-red-700"
              />
            )}
            <hr className="my-2" />
            <SummaryRow
              label="Net Amount"
              value={`${(order.totalAmount - totalRefunded).toFixed(2)}`}
              bold
            />

            {order.stripePaymentIntentId && (
              <p className="mt-4 border-t pt-4 text-xs text-gray-500">
                Stripe Payment ID: {order.stripePaymentIntentId}
              </p>
            )}
          </div>

          {/* Refund History */}
          {order.refunds.length > 0 && (
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Refund History
              </h2>

              <div className="space-y-3">
                {order.refunds.map((r) => (
                  <div key={r.id} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          ${r.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.refundType} – {r.reason}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          r.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : r.status === "PROCESSING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────── Refund Modal ───────────────── */}
      {showRefundModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
          onClick={() => setShowRefundModal(false)}
        >
          {/* stop propagation */}
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Process Refund
            </h3>

            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Refund Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={order.totalAmount - totalRefunded}
                  value={refundData.amount}
                  onChange={(e) =>
                    setRefundData({
                      ...refundData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Max refundable: $
                  {(order.totalAmount - totalRefunded).toFixed(2)}
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Refund Type
                </label>
                <select
                  value={refundData.refundType}
                  onChange={(e) =>
                    setRefundData({
                      ...refundData,
                      refundType: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PARTIAL">Partial Refund</option>
                  <option value="FULL">Full Refund</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={refundData.reason}
                  onChange={(e) =>
                    setRefundData({ ...refundData, reason: e.target.value })
                  }
                  placeholder="e.g. Item returned damaged…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={
                  refundData.amount <= 0 ||
                  refundData.amount > order.totalAmount - totalRefunded ||
                  refundData.reason.trim() === ""
                }
                onClick={handleRefund}
                className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white  
                           enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} className="mr-2" />
                Process
              </button>
            </div>

            <div className="mt-4 flex items-start space-x-2 text-xs text-amber-600">
              <AlertTriangle size={14} />
              <p>
                Refunds are irreversible. Double-check the amount before
                confirming.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper sub-components                                             */
/* ------------------------------------------------------------------ */
function BadgeStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    DELIVERED: "bg-green-100 text-green-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status === "SHIPPED" && <Truck size={16} className="mr-1" />}
      {status === "PROCESSING" && <Package size={16} className="mr-1" />}
      {status}
    </span>
  );
}

function BadgePayment({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-800",
    REFUNDED: "bg-gray-100 text-gray-800",
    PARTIALLY_REFUNDED: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium ${
        map[status] || "bg-red-100 text-red-800"
      }`}
    >
      <CreditCard size={16} className="mr-1" />
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mb-3 space-y-0.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  valueClass = "",
  labelClass = "",
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
  labelClass?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className={`text-sm ${bold ? "font-medium" : ""} ${labelClass}`}>
        {label}
      </span>
      <span
        className={`text-sm ${
          bold ? "font-bold" : "font-medium"
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
