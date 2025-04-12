// app/dashboard/layout.tsx
import { PropsWithChildren } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // your NextAuth config
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in or not admin
  if (!session || session.user.role !== "admin") {
    redirect("/login"); // or show a 403 page
  }

  return (
    <div className="flex min-h-screen">
      {/* Example side nav */}
      <aside className="w-64 bg-gray-200 p-4">
        <nav className="space-y-2">
          <a href="/dashboard" className="block">
            Home
          </a>
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
