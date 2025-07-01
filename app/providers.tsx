// File: app/providers.tsx (Revised and Corrected)
"use client";

import { ReactNode, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { CartProvider } from "@/contexts/CartContext";

// ✅ 1. IMPORT the necessary components from @tanstack/react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
  session?: Session | null; // It's safer to make session optional
}

export function Providers({ children, session }: ProvidersProps) {
  // ✅ 2. CREATE the QueryClient instance.
  // We use useState to ensure the client is only created once per component lifecycle,
  // preventing re-creations on every render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optional: You can set global default options here
            staleTime: 1000 * 10, // 10 seconds
          },
        },
      })
  );

  return (
    // ✅ 3. WRAP all other providers with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <CartProvider>
          {/* The SWRConfig is no longer needed if you are migrating fully to React Query */}
          {children}
        </CartProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
