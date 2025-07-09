import "@/app/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import { Navbar } from "@/components/ui/navbar"; // ✅ CORRECT: Use the wrapper component
import { getAuthSession } from "@/lib/auth";

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
  // ✅ CORRECT: Fetch session here to pass to SessionProvider
  const session = await getAuthSession();

  return (
    <html lang="en">
      <body>
        {/* ✅ CORRECT: Session is passed to Providers and made available via SessionProvider */}
        <Providers session={session}>
          <Navbar />
          <main className="pt-24 md:pt-28">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
