// File: app/(admin)/admin/layout.tsx (Corrected)

import { requireAdmin } from "@/lib/auth"; // This import will now work
import AdminShell from "@/app/(admin)/admin/_AdminShell";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // --- ✅ THIS IS THE GUARD ---
  // We call the function here. It will run before rendering the page.
  // If the user is not an admin, it will redirect them and stop rendering.
  await requireAdmin();

  // This code will only be reached if the user is an authenticated admin.
  return <AdminShell>{children}</AdminShell>;
}
