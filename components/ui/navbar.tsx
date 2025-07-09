// File: components/ui/navbar.tsx (Revised & Simplified)

import { NavbarClient } from "./NavbarClient"; // ✅ FIXED: Correct import path

/**
 * Navbar - Server Component Wrapper
 * ---------------------------------
 * This is a simple wrapper that renders the client component.
 * Since we're already providing the session through SessionProvider
 * in the layout, the client component can access it via useSession().
 * This approach avoids hydration issues and keeps the code simple.
 */
export function Navbar() {
  // ✅ SIMPLIFIED: No need to fetch session here since it's already
  // provided through SessionProvider in the layout and accessible via useSession()
  return <NavbarClient />;
}
