"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, DollarSign, ShoppingCart, Users } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType, SVGProps } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Dynamic imports to keep Chart.js on the client ───────── */
const ChartSetup = dynamic(() => import("@/app/(admin)/admin/chartSetup"), {
  ssr: false,
  loading: () => null,
});
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), {
  ssr: false,
  loading: () => null,
});
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((m) => m.Doughnut),
  { ssr: false, loading: () => null }
);

/* ── API types ─────────────────────────────────────────────── */
type AnalyticsData = {
  totalRevenue: number;
  totalSales: number;
  newCustomers: number;
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { name: string; qty: number }[];
};

/* ── Fetcher ───────────────────────────────────────────────── */
const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
};

/* ── KPI card helper ───────────────────────────────────────── */
const KpiCard = ({
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

/* ── Page component ───────────────────────────────────────── */
export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: fetchAnalytics,
    staleTime: 60_000,
  });

  /* Chart configs (empty data while loading) */
  const revenueChartData = {
    labels: data?.revenueByMonth.map((d) => d.month) ?? [],
    datasets: [
      {
        label: "Revenue",
        data: data?.revenueByMonth.map((d) => d.revenue) ?? [],
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
    ],
  };

  const topProductsData = {
    labels: data?.topProducts.map((p) => p.name) ?? [],
    datasets: [
      {
        label: "Qty",
        data: data?.topProducts.map((p) => p.qty) ?? [],
        backgroundColor: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#a78bfa",
        ],
      },
    ],
  };

  return (
    <>
      {/* registers Chart.js once in the browser */}
      <ChartSetup />

      {/* container gives left/right padding, max-width, and top padding
          so we sit below the fixed navbar */}
      <main className="container mx-auto max-w-6xl px-4 pt-24 space-y-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <BarChart3 size={30} className="text-primary" />
          Sales Analytics
        </h1>

        {/* KPI cards */}
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <KpiCard
                icon={DollarSign}
                label="Total Revenue"
                value={`$ ${data!.totalRevenue.toLocaleString()}`}
              />
              <KpiCard
                icon={ShoppingCart}
                label="Total Sales"
                value={data!.totalSales}
              />
              <KpiCard
                icon={Users}
                label="New Customers (30d)"
                value={data!.newCustomers}
              />
            </>
          )}
        </section>

        {/* Charts */}
        <section className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Revenue over time */}
          <Card className="h-[420px]">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {isLoading ? (
                <Skeleton className="h-full" />
              ) : (
                <Bar
                  data={revenueChartData}
                  options={{ maintainAspectRatio: false }}
                />
              )}
            </CardContent>
          </Card>

          {/* Top products */}
          <Card className="h-[420px]">
            <CardHeader>
              <CardTitle>Top-Selling Products (Qty)</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {isLoading ? (
                <Skeleton className="h-full" />
              ) : (
                <Doughnut
                  data={topProductsData}
                  options={{ maintainAspectRatio: false }}
                />
              )}
            </CardContent>
          </Card>
        </section>

        {error && (
          <p className="text-red-600">
            {error.message ?? "Failed to load analytics"}
          </p>
        )}
      </main>
    </>
  );
}
