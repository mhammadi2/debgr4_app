// File: app/(admin)/layout.tsx (Corrected and Simplified)

import { ReactNode } from "react";

// This is the root layout for the entire (admin) route group.
// It does not need to do anything special. It just needs to pass the children through.
// The middleware has already secured this entire route group.
export default function AdminAreaLayout({ children }: { children: ReactNode }) {
  // Return the children directly.
  // The specific layout for the admin dashboard (with the shell) is handled
  // by the more nested layout file: /app/(admin)/admin/layout.tsx.
  return <>{children}</>;
}
