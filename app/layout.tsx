// File: app/layout.tsx (Corrected)

import "@/app/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/components/ui/navbar"; // Correctly import the Navbar Server Component

// --- ✅ CORRECTED IMPORT ---
// Import our new, reliable helper function 'getAuth' instead of 'auth'.
import { getAuth } from "@/lib/auth";

export const metadata = {
  title: "DeBugR4 - IC & Electronic Design",
  description:
    "Your one-stop shop for electronic components and design services.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // --- ✅ CORRECTED FUNCTION CALL ---
  // Call our new 'getAuth' helper to fetch the session on the server.
  const session = await getAuth();

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <Navbar />
          <main className="pt-36">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
