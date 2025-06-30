// app/(customer)/layout.tsx (Fixed - Option 1)
import { ReactNode } from "react";
// ✅ FIX: Use the correct function name from your auth file
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ✅ Use the correct function name
  const session = await getAuthSession();

  // If there is no session OR the user is an admin, they cannot access the
  // customer-specific pages and should be sent to the customer login page.
  // This is a crucial security boundary.
  if (
    !session?.user ||
    session.user.role === "ADMIN" ||
    session.user.role === "SUPER_ADMIN"
  ) {
    // Redirect to the customer login page.
    redirect("/login");
  }

  // If the checks pass, it means we have a valid, logged-in customer.
  // Render the child pages (e.g., the profile page this layout is protecting).
  return <>{children}</>;
}
