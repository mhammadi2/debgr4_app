// File: app/(admin)/admin/page.tsx (Corrected)
"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Use named imports for all components
import {
  AdminDashboardStats,
  type StatsData,
} from "./_components/AdminDashboardStats";
import { RecentActivity } from "./_components/RecentActivity";
import { QuickActions } from "./_components/QuickActions";

// Use shadcn/ui components for consistency
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// The fetching function for our stats
const fetchAdminStats = async (): Promise<StatsData> => {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }
  return res.json();
};

export default function AdminDashboard() {
  const {
    data: stats,
    error,
    isLoading,
    refetch,
  } = useQuery<StatsData>({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            A summary of your store's activity.
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
          Refresh Data
        </Button>
      </div>

      {/* --- GLOBAL ERROR ALERT --- */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard Data</AlertTitle>
          {/* ✅ CORRECTION: The closing tag is now correct. */}
          <AlertDescription>
            {error.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      )}

      {/* --- STATS CARDS --- */}
      <AdminDashboardStats />

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Recent orders and new user sign-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
      </div>
    </div>
  );
}
