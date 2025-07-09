// components/useAdminGuard.ts
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function useAdminGuard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.replace("/"); // fallback redirect
    }
  }, [session, status, router]);
}
