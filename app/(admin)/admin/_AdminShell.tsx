// In: app/admin/_AdminShell.tsx (Revised and Refined)
"use client";

import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  LucideIcon, // Import LucideIcon for type safety
} from "lucide-react";

// --- REFINEMENT 1: Create a reusable NavItem component to avoid duplicate code ---
interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  currentPath: string;
  onClick?: () => void;
}

const NavItem = ({
  href,
  label,
  icon: Icon,
  currentPath,
  onClick,
}: NavItemProps) => {
  const isActive = currentPath === href;
  // Define a base class string for common styles
  const baseClasses =
    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors";
  // Define active vs. inactive styles
  const activeClasses = "bg-blue-100 text-blue-700";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
      {label}
    </Link>
  );
};

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // currentPath is more descriptive
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- REFINEMENT 2: Type the navigation array for better safety ---
  const navigation: { name: string; href: string; icon: LucideIcon }[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: "/login" });
    router.push("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  // --- REFINEMENT 3: Create a reusable SidebarNav component ---
  const SidebarNav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={`flex-1 space-y-1 px-2 py-4 ${mobile ? "mt-4" : ""}`}>
      {navigation.map((item) => (
        <NavItem
          key={item.name}
          href={item.href}
          label={item.name}
          icon={item.icon}
          currentPath={pathname}
          onClick={mobile ? closeSidebar : undefined}
        />
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar (Overlay) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/30"
          onClick={closeSidebar}
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <button onClick={closeSidebar} aria-label="Close sidebar">
              <X size={24} />
            </button>
          </div>
          <SidebarNav mobile />
        </div>
      </div>

      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-16 shrink-0 items-center border-b bg-blue-700 px-4">
          <Shield className="mr-3 h-8 w-8 text-white" />
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto bg-white">
          <SidebarNav />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          {/* This div is a spacer to push the user menu to the right on mobile */}
          <div className="lg:hidden flex-1" />
          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.name || session?.user?.email}
            </span>
            {session?.user?.role && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 capitalize">
                {session.user.role}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-x-1 p-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
