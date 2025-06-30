// app/admin/layout.tsx (AFTER THE FIX)

import { requireAdmin } from "@/lib/auth";
import { Providers } from "@/app/providers"; // <-- Import your new component
import AdminShell from "@/app/(admin)/admin/_AdminShell";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This part remains the same. It runs on the server.
  await requireAdmin();

  return (
    // Your new Providers component wraps the children.
    // This creates a client boundary where context is allowed.
    <Providers>
      <AdminShell>{children}</AdminShell>
    </Providers>
  );
}
