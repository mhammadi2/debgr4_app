// app/(admin)/admin/payments/page.tsx
"use client";

import { DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

// Example payment data - replace with data fetched from your API
const payments = [
  {
    id: "txn_12345",
    orderId: "ord_abcde",
    amount: 150.0,
    status: "succeeded",
    date: "2025-06-20",
  },
  {
    id: "txn_67890",
    orderId: "ord_fghij",
    amount: 45.5,
    status: "succeeded",
    date: "2025-06-20",
  },
  {
    id: "txn_abcde",
    orderId: "ord_klmno",
    amount: 89.99,
    status: "failed",
    date: "2025-06-19",
  },
  {
    id: "txn_fghij",
    orderId: "ord_pqrst",
    amount: 250.0,
    status: "pending",
    date: "2025-06-18",
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "succeeded":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={14} className="mr-1" /> Succeeded
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={14} className="mr-1" /> Failed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={14} className="mr-1" /> Pending
        </span>
      );
    default:
      return null;
  }
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <DollarSign size={32} className="text-green-600" />
        <h1 className="ml-3 text-2xl font-bold text-gray-800">
          Payment Transactions
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Transaction ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
