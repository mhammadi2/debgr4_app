// app/(admin)/admin/analytics/page.tsx
"use client";

import { BarChart, DollarSign, Users, ShoppingCart } from "lucide-react";

// This is a placeholder component. You would replace this with a real charting library like Recharts or Chart.js
const PlaceholderChart = () => (
  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    <BarChart size={48} className="text-gray-400" />
    <p className="ml-4 text-gray-500">Chart data would be displayed here.</p>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BarChart size={32} className="text-purple-600" />
        <h1 className="ml-3 text-2xl font-bold text-gray-800">
          Sales Analytics
        </h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="text-green-500" size={24} />
            <h2 className="ml-3 text-lg font-medium text-gray-700">
              Total Revenue
            </h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">$12,450.00</p>
          <p className="mt-1 text-sm text-green-600">+15% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ShoppingCart className="text-blue-500" size={24} />
            <h2 className="ml-3 text-lg font-medium text-gray-700">
              Total Sales
            </h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">320</p>
          <p className="mt-1 text-sm text-green-600">+8% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="text-purple-500" size={24} />
            <h2 className="ml-3 text-lg font-medium text-gray-700">
              New Customers
            </h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">45</p>
          <p className="mt-1 text-sm text-red-600">-5% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Revenue Over Time
        </h3>
        <PlaceholderChart />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Top Selling Products
        </h3>
        <PlaceholderChart />
      </div>
    </div>
  );
}
