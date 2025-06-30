// File: app/dashboard/layout.tsx (Corrected)

import { PropsWithChildren } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);

  // ✅ CORRECTED LOGIC:
  // This layout should protect the dashboard for ANY logged-in user.
  // We simply check if a session exists. If not, we redirect to login.
  // The role-specific check for 'admin' is correctly handled by the /admin/layout.tsx file.
  if (!session) {
    redirect("/login");
  }

  // If a session exists, we allow the user to see the page.
  return (
    <div className="flex min-h-screen">
      {/* Example side nav */}
      <aside className="w-64 bg-gray-200 p-4">
        <nav className="space-y-2">
          <a href="/dashboard" className="block">
            Home
          </a>
          {/* You might want to conditionally show these links based on role in the future,
              but for now, the routes themselves are protected. */}
          <a href="/dashboard/users" className="block">
            User Management
          </a>
          <a href="/dashboard/products" className="block">
            Product Management
          </a>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
