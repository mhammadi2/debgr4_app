// // app/(admin)/layout.tsx

import AdminShell from "@/app/(admin)/admin/_AdminShell";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
