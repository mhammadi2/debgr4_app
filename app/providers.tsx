// app/providers.tsx (Corrected - This is the fix)
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Session } from "next-auth";
import { CartProvider } from "@/contexts/CartContext"; // <-- 1. IMPORT the CartProvider

// SWR fetcher function remains the same
const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      console.error("SWR Fetch Error:", res.status, errorText);
      const error = new Error("An error occurred while fetching the data.");
      // @ts-ignore
      error.info = await res.json().catch(() => ({ detail: errorText }));
      // @ts-ignore
      error.status = res.status;
      throw error;
    }
    return res.json();
  });

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {/* 👇 2. WRAP everything inside the CartProvider 👇 */}
      <CartProvider>
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: true,
          }}
        >
          {children}
        </SWRConfig>
      </CartProvider>
    </SessionProvider>
  );
}
