// File: app/(admin)/admin/_components/QuickActions.tsx (Revised)
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, FileText } from "lucide-react";

// The data for our action buttons
const actions = [
  {
    title: "Add New Product",
    href: "/admin/products/new",
    icon: <PlusCircle className="mr-2 h-4 w-4" />,
  },
  {
    title: "Manage Products",
    href: "/admin/products",
    icon: <Package className="mr-2 h-4 w-4" />,
  },
  {
    title: "View Reports",
    href: "/admin/analytics",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
];

/**
 * ✅ 1. EXPORT: Changed to a named export to match the import on the dashboard page.
 * Provides quick navigation buttons for common admin tasks.
 */
export function QuickActions() {
  return (
    /**
     * ✅ 2. STRUCTURE & STYLE: The component now renders a simple list of buttons.
     * The Card, CardHeader, and CardContent are handled by the parent page.
     * We use theme-aware Button components instead of custom divs and styles.
     */
    <div className="space-y-2">
      {actions.map((action) => (
        <Button
          key={action.title}
          asChild // Allows the Button to wrap the Link component
          variant="ghost" // A clean, theme-aware style
          className="w-full justify-start"
        >
          {/* ✅ 3. NAVIGATION: Using Next.js <Link> for proper client-side routing */}
          <Link href={action.href}>
            {action.icon}
            {action.title}
          </Link>
        </Button>
      ))}
    </div>
  );
}
