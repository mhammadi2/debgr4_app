// File: app/(admin)/admin/layout.tsx (Corrected and Aligned with Middleware)

// ❌ REMOVED: The faulty import for `requireAdmin` is gone.
// import { requireAdmin } from "@/lib/auth";

import AdminShell from "@/app/(admin)/admin/_AdminShell";
import { ReactNode } from "react";
// ❌ REMOVED: The import for `redirect` is no longer needed.
// import { redirect } from "next/navigation";

// The layout component is now much simpler. It just sets up the UI.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ❌ REMOVED: The call to the non-existent `requireAdmin()` function.
  // The middleware.ts file handles this protection automatically for all routes
  // within this directory.
  // await requireAdmin();

  // ✅ CORRECT: The layout's only responsibility is to render the shared shell
  // and the specific page content (`children`).
  return <AdminShell>{children}</AdminShell>;
}
