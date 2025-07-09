"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/* ───── Types that match /api/admin/analytics ───── */
type AnalyticsApi = {
  totalRevenue: number; // dollars
  totalSales: number; // orders count
  newCustomers: number; // users
};

/* ───── Dashboard slice we care about ───── */
type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
};

/* ───── Fetch & map helper ───── */
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Failed to fetch dashboard statistics");

  const data: AnalyticsApi = await res.json();
  return {
    totalRevenue: data.totalRevenue,
    totalOrders: data.totalSales,
    totalUsers: data.newCustomers,
  };
};

/* ───── Re-usable KPI card ───── */
import type { ComponentType, SVGProps } from "react";
const DashboardKpiCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-3">
      <Icon size={24} className="text-primary shrink-0" />
      <div>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription className="text-3xl font-bold">
          {value}
        </CardDescription>
      </div>
    </CardHeader>
  </Card>
);

/* ───── Page ───── */
export default function AdminDashboard() {
  const { data, error, isLoading, refetch } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });

  return (
    <main className="container mx-auto max-w-6xl px-4 pt-24 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            A summary of your store&apos;s activity.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <RefreshCw size={16} className="mr-2 animate-spin" />
          ) : (
            <RefreshCw size={16} className="mr-2" />
          )}
          Refresh&nbsp;Data
        </Button>
      </header>

      {/* Global error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Data</AlertTitle>
          <AlertDescription>
            {error.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI row  – identical figures/format as Analytics page */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // very small skeleton for brevity
          [...Array(3)].map((_, i) => (
            <Card key={i} className="h-24 animate-pulse" />
          ))
        ) : (
          <>
            <DashboardKpiCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$ ${data!.totalRevenue.toLocaleString()}`}
            />
            <DashboardKpiCard
              icon={ShoppingCart}
              label="Total Orders"
              value={data!.totalOrders}
            />
            <DashboardKpiCard
              icon={Users}
              label="New Customers (30d)"
              value={data!.totalUsers}
            />
          </>
        )}
      </section>

      {/* Main grid – unchanged */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Recent orders and new user sign-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* keep your existing component */}
            <RecentActivity />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

/* ─── keep these imports at the bottom to avoid circular ref hint ─── */
import { RecentActivity } from "./_components/RecentActivity";
import { QuickActions } from "./_components/QuickActions";
