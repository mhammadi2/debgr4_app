// app/(admin)/admin/_components/QuickActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, PlusCircle, Package, FileText } from "lucide-react";

const ActionButton = ({ title, description, icon, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all group"
  >
    <div className="flex items-center">
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white">
        {icon}
      </div>
      <div className="ml-4">
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  </button>
);

export default function QuickActions() {
  const router = useRouter();
  const actions = [
    {
      title: "Add New Product",
      description: "Expand your catalog",
      icon: <PlusCircle className="text-blue-600" />,
      onClick: () => router.push("/admin/products/new"), // Example route
    },
    {
      title: "Manage Inventory",
      description: "Update stock levels",
      icon: <Package className="text-green-600" />,
      onClick: () => router.push("/admin/products"),
    },
    {
      title: "Generate Report",
      description: "Create a new sales report",
      icon: <FileText className="text-purple-600" />,
      onClick: () => router.push("/admin/analytics"),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
        <TrendingUp className="text-gray-400" size={22} />
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <ActionButton key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}
