// app/(admin)/layout.tsx

import AdminShell from "@/app/(admin)/admin/_AdminShell"; // Ensure the import path is correct
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      <div className="pt-24">{children}</div>{" "}
      {/* Adds padding to avoid navbar overlap */}
    </AdminShell>
  );
}
