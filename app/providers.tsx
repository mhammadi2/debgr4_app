"use client";

import { ReactNode, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { CartProvider } from "@/contexts/CartContext";

// React Query imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// ✅ ENHANCED: Error Boundary for better error handling
import { ErrorBoundary } from "react-error-boundary";

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

// ✅ ENHANCED: Error Fallback Component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          We're sorry, but something unexpected happened. Please try refreshing
          the page.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            gcTime: 1000 * 60 * 10, // 10 minutes
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // ✅ ENHANCED: Log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Application Error:", error, errorInfo);
        }
        // In production, you might want to send this to an error tracking service
        // like Sentry, LogRocket, etc.
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider
          session={session}
          refetchInterval={5 * 60}
          refetchOnWindowFocus={true}
        >
          <CartProvider>{children}</CartProvider>
        </SessionProvider>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
