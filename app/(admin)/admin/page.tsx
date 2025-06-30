// app/(admin)/admin/page.tsx (Revised for Theme and Structure)
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import StatsCards, { StatsData } from "./_components/StatsCards";
import QuickActions from "./_components/QuickActions";
import RecentActivity from "./_components/RecentActivity";

// The local 'fetcher' function is no longer needed. SWR uses the global one from providers.tsx.

export default function AdminDashboard() {
  // --- STATE AND DATA FETCHING ---
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<StatsData>("/api/admin/stats", {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here's a summary of your store's activity.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {currentTime.toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
          <button
            onClick={() => mutateStats()}
            disabled={statsLoading}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-white border rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh data"
          >
            {statsLoading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* --- GLOBAL ERROR ALERT --- */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Dashboard Data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {statsError.message ||
                    "An unexpected error occurred while fetching dashboard statistics."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATS & CHARTS --- */}
      <StatsCards stats={stats} isLoading={statsLoading} />

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
