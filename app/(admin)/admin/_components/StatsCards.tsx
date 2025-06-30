// app/(admin)/admin/_components/StatsCards.tsx
"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";

export interface StatsData {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
}

interface StatsCardsProps {
  stats: StatsData | undefined;
  isLoading: boolean;
}

const StatCard = ({ icon, title, value, href, color, isLoading }: any) => (
  <Link href={href} className="block group">
    <div
      className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color} hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {isLoading ? (
              <Loader2 className="animate-spin text-gray-400" size={24} />
            ) : (
              value
            )}
          </p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      </div>
    </div>
  </Link>
);

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cardData = [
    {
      title: "Total Revenue",
      value: `${(stats?.monthlyRevenue ?? 0).toFixed(2)}`,
      icon: <DollarSign className="text-green-600" size={24} />,
      color: "border-green-500",
      href: "/admin/analytics",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: <ShoppingCart className="text-blue-600" size={24} />,
      color: "border-blue-500",
      href: "/admin/orders",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      icon: <Users className="text-purple-600" size={24} />,
      color: "border-purple-500",
      href: "/admin/customers",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: <Package className="text-amber-600" size={24} />,
      color: "border-amber-500",
      href: "/admin/products",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardData.map((card) => (
        <StatCard key={card.title} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
