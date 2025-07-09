import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersClient } from "./OrdersClient";
import Link from "next/link";
import { ArrowLeft, User, Package } from "lucide-react";
import { Metadata } from "next";

// ✅ SEO: Add metadata for better SEO
export const metadata: Metadata = {
  title: "My Orders - Your Store",
  description: "View and track your order history",
};

// ✅ ENHANCED: Main server component with better error handling and layout
export default async function OrdersPage() {
  let session;

  try {
    session = await getAuthSession();
  } catch (error) {
    console.error("Authentication error:", error);
    redirect("/login?callbackUrl=/profile/orders&error=auth_failed");
  }

  // ✅ IMPROVED: More comprehensive auth check with better error handling
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile/orders");
  }

  // ✅ ENHANCED: Allow both USER and ADMIN roles, but redirect ADMIN to admin panel
  if (session.user.role === "ADMIN") {
    redirect("/admin/orders"); // Redirect admin to admin orders page
  }

  // ✅ IMPROVED: More specific role check
  if (session.user.role !== "USER") {
    redirect("/login?callbackUrl=/profile/orders&error=invalid_role");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ ENHANCED: Better container with proper spacing */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* ✅ ADDED: Breadcrumb navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link
            href="/profile"
            className="hover:text-gray-700 transition-colors flex items-center"
          >
            <User className="h-4 w-4 mr-1" />
            Profile
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium flex items-center">
            <Package className="h-4 w-4 mr-1" />
            My Orders
          </span>
        </nav>

        {/* ✅ ENHANCED: Better header with back button */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-green-700 hover:text-green-800 mr-4 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Back to Profile
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Package className="h-8 w-8 mr-3 text-green-600" />
                  My Orders
                </h1>
                <p className="mt-2 text-gray-600">
                  Review your past purchases and check their status.
                </p>
              </div>

              {/* ✅ ADDED: User info display */}
              <div className="hidden sm:block">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    Welcome back,{" "}
                    <span className="font-semibold">{session.user.name}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ENHANCED: Orders client with error boundary */}
        <main>
          <OrdersClient />
        </main>

        {/* ✅ ADDED: Footer with helpful links */}
        <footer className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600">
                Can't find what you're looking for?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                href="/support"
                className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors text-center"
              >
                Contact Support
              </Link>
              <Link
                href="/products"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
