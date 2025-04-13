// app/verify-images/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerifyImagesPage() {
  const router = useRouter();
  const { data: products, error, isLoading } = useSWR("/api/products", fetcher);
  const [results, setResults] = useState<any[]>([]);
  const [testingComplete, setTestingComplete] = useState(false);

  useEffect(() => {
    if (products && products.length > 0) {
      testImages();
    }
  }, [products]);

  const testImages = async () => {
    setResults([]);
    setTestingComplete(false);

    const testResults = [];

    for (const product of products) {
      if (!product.imageUrl) {
        testResults.push({
          id: product.id,
          name: product.name,
          imageUrl: null,
          status: "No image URL",
        });
        continue;
      }

      try {
        // Test direct access first
        const directResult = await testDirectAccess(product.imageUrl);

        // Then test via our API endpoint
        const apiResult = await testApiAccess(product.imageUrl);

        testResults.push({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          directAccess: directResult,
          apiAccess: apiResult,
          status: directResult.success || apiResult.success ? "Ok" : "Failed",
        });
      } catch (err) {
        testResults.push({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          error: err instanceof Error ? err.message : String(err),
          status: "Error",
        });
      }
    }

    setResults(testResults);
    setTestingComplete(true);
  };

  const testDirectAccess = (
    url: string
  ): Promise<{ success: boolean; statusCode?: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ success: true });
      img.onerror = () => resolve({ success: false });
      img.src = url.startsWith("http") ? url : url;
    });
  };

  const testApiAccess = (
    url: string
  ): Promise<{ success: boolean; response?: any }> => {
    if (url.startsWith("http")) {
      return Promise.resolve({ success: false, response: "Not a local path" });
    }

    return fetch(`/api/test-image?path=${encodeURIComponent(url)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          return { success: false, response: errorData };
        }
        return { success: true, response: { status: res.status } };
      })
      .catch((err) => ({ success: false, response: err.message }));
  };

  if (isLoading) return <div className="p-8">Loading products...</div>;
  if (error)
    return <div className="p-8">Error loading products: {error.message}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Image Availability Test</h1>

      <button
        onClick={testImages}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        Re-Test Images
      </button>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Product</th>
            <th className="py-2 px-4 border">Image Path</th>
            <th className="py-2 px-4 border">Direct Access</th>
            <th className="py-2 px-4 border">API Access</th>
            <th className="py-2 px-4 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr
              key={index}
              className={
                result.status === "Ok"
                  ? "bg-green-50"
                  : result.status === "Failed"
                  ? "bg-red-50"
                  : "bg-yellow-50"
              }
            >
              <td className="py-2 px-4 border">{result.name}</td>
              <td className="py-2 px-4 border overflow-hidden text-xs">
                {result.imageUrl || "None"}
              </td>
              <td className="py-2 px-4 border">
                {result.directAccess
                  ? result.directAccess.success
                    ? "✅"
                    : "❌"
                  : "-"}
              </td>
              <td className="py-2 px-4 border">
                {result.apiAccess
                  ? result.apiAccess.success
                    ? "✅"
                    : "❌"
                  : "-"}
              </td>
              <td className="py-2 px-4 border font-medium">{result.status}</td>
            </tr>
          ))}
          {results.length === 0 && testingComplete && (
            <tr>
              <td colSpan={5} className="py-4 text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {testingComplete && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h2 className="font-medium mb-2">Next steps:</h2>
          <ol className="list-decimal pl-6">
            <li>
              Check that your files exist in the correct location
              (public/uploads/)
            </li>
            <li>Verify file permissions allow web access</li>
            <li>Make sure image URLs in the database are correct</li>
            <li>
              Use the API approach in the Carousel component if direct access
              fails
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
