// File: components/ui/navbar.tsx (Fixed)

// --- ✅ CORRECTED IMPORT ---
// We now import our new, custom helper function 'getAuth'.
import { getAuth } from "@/lib/auth";

import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  // --- ✅ CORRECTED FUNCTION CALL ---
  // We call our helper, which uses getServerSession under the hood. This works.
  const session = await getAuth();

  return <NavbarClient session={session} />;
}
