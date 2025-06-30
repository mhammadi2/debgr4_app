// app/admin/products/page.tsx (COMPLETE UPDATED VERSION)
"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import useSWR, { mutate } from "swr";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  X,
  Loader2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";

type Decimalish = number | string;
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: Decimalish;
  stock: number;
  category: string;
  imageUrl: string | null;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  });

async function readError(res: Response) {
  try {
    const data = await res.json();
    if (data && typeof data === "object" && "error" in data) {
      return data.error as string;
    }
    return JSON.stringify(data);
  } catch {
    const text = await res.text().catch(() => "");
    return text || res.statusText || "Unknown server error";
  }
}

const formatMoney = (value: Decimalish) => {
  const num = typeof value === "string" ? Number(value) : value;
  return isNaN(num) ? String(value) : num.toFixed(2);
};

// Placeholder image for when no image is available
const PLACEHOLDER_IMAGE = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==`;

export default function ProductsManagementPage() {
  const { data: products, error } = useSWR<Product[]>(
    "/api/admin/products",
    fetcher
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  // Using selectedFile instead of imageFile for consistency with ProductForm
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(products?.map((p) => p.category) || [])];

  const filteredProducts =
    products?.filter(
      (p) =>
        (!searchTerm ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!categoryFilter || p.category === categoryFilter)
    ) || [];

  // Function to resolve image path - same as in ProductForm
  const resolveImagePath = (imagePath?: string | null): string => {
    if (!imagePath) return PLACEHOLDER_IMAGE;

    // Handle both absolute and relative paths
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Ensure no double slashes and clean up path
    return `/${imagePath.replace(/^\/+/, "")}`;
  };

  const resetAndCloseForms = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
    setFormState({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setFormError(null);
    setDebugInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Log for debugging
      setDebugInfo(
        `Selected file: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB`
      );
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleFormInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = (product: Product) => {
    resetAndCloseForms();
    setEditingProduct(product);
    setFormState({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      category: product.category,
      stock: product.stock.toString(),
    });
    setImagePreview(product.imageUrl);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const url = "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();

      // Add all form fields
      formData.append("name", formState.name);
      formData.append("description", formState.description || "");
      formData.append("price", formState.price);
      formData.append("category", formState.category);
      formData.append("stock", formState.stock || "0");

      // Add ID for edit mode
      if (editingProduct) {
        formData.append("id", String(editingProduct.id));
      }

      // Handle image - CRITICAL: Use "file" field name to match the api/upload endpoint
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (editingProduct?.imageUrl) {
        // Existing image URL (for edit mode)
        formData.append("imageUrl", editingProduct.imageUrl);
        formData.append("keepExistingImage", "true");
      }

      // Log form fields for debugging
      let formFields = "";
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          formFields += `${key}: [File ${value.name}], `;
        } else {
          formFields += `${key}: ${value}, `;
        }
      }
      console.log("Submitting form with:", formFields);

      // Make the API request
      const res = await fetch(url, {
        method,
        body: formData, // No headers - browser sets them correctly with boundary
      });

      if (!res.ok) {
        const errorMsg = await readError(res);
        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log("Product saved:", result);

      // Success - update products list and close form
      mutate("/api/admin/products");
      resetAndCloseForms();
    } catch (err: any) {
      console.error("Form submission error:", err);
      setFormError(err.message || "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced delete function with better user experience
  const handleDeleteProduct = async (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    // First attempt - try normal delete or mark as out of stock
    const firstConfirm = confirm(
      `Delete "${product.name}"?\n\nIf this product is in orders, it will be marked as out of stock instead.`
    );

    if (!firstConfirm) return;

    setIsDeleting(productId);

    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const result = await res.json();

        if (result.markedOutOfStock) {
          const forceDelete = confirm(
            `"${product.name}" was marked as out of stock because it's in existing orders.\n\nDo you want to FORCE DELETE it anyway? This will remove it from all orders!`
          );

          if (forceDelete) {
            // Force delete
            const forceRes = await fetch(
              `/api/admin/products?id=${productId}&force=true`,
              {
                method: "DELETE",
              }
            );

            if (forceRes.ok) {
              const forceResult = await forceRes.json();
              alert(
                `Product deleted! Removed from ${forceResult.removedOrderItems} order(s).`
              );
            } else {
              throw new Error(await readError(forceRes));
            }
          } else {
            alert("Product marked as out of stock.");
          }
        } else {
          alert("Product deleted successfully!");
        }

        mutate("/api/admin/products");
      } else {
        throw new Error(await readError(res));
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  if (error)
    return (
      <div className="text-red-600 flex items-center">
        <AlertCircle className="mr-2" /> Error loading products: {error.message}
      </div>
    );
  if (!products)
    return (
      <div className="flex items-center text-gray-600">
        <Package className="mr-2 animate-pulse" /> Loading products...
      </div>
    );

  const isFormOpen = showCreateForm || !!editingProduct;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="mr-3" />
          Product Management
        </h1>
        <button
          onClick={() => {
            if (showCreateForm) {
              resetAndCloseForms();
            } else {
              resetAndCloseForms();
              setShowCreateForm(true);
            }
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? (
            <X className="mr-2" size={20} />
          ) : (
            <Plus className="mr-2" size={20} />
          )}
          {showCreateForm ? "Cancel" : "Create New Product"}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className={`p-6 border rounded-lg shadow-sm bg-white space-y-4 ${
            editingProduct ? "border-yellow-300" : "border-gray-200"
          }`}
          encType="multipart/form-data"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            {editingProduct
              ? `Editing: ${editingProduct.name}`
              : "Create New Product"}
          </h2>

          {formError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" /> <p>{formError}</p>
            </div>
          )}

          {debugInfo && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
              <p className="text-sm font-mono">{debugInfo}</p>
            </div>
          )}

          {/* Image Upload Section - Updated to match ProductForm */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Product Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                {selectedFile ? (
                  // Show selected file preview
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : imagePreview ? (
                  // Show existing image
                  <img
                    src={resolveImagePath(imagePreview)}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // Show placeholder
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <input
                  id="file-upload"
                  name="file" // IMPORTANT: Must match the field name expected by the server
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  {selectedFile ? "Change File" : "Choose File"}
                </button>
                {(imagePreview || selectedFile) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                )}
                {selectedFile && (
                  <p className="text-sm text-green-600">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                name="name"
                type="text"
                value={formState.name}
                onChange={handleFormInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                name="category"
                type="text"
                value={formState.category}
                onChange={handleFormInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleFormInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                name="price"
                type="number"
                value={formState.price}
                onChange={handleFormInputChange}
                required
                step="0.01"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                name="stock"
                type="number"
                value={formState.stock}
                onChange={handleFormInputChange}
                required
                step="1"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
            <button
              type="button"
              onClick={resetAndCloseForms}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative w-12 h-12">
                    <Image
                      src={resolveImagePath(prod.imageUrl)}
                      alt={prod.name}
                      fill
                      className="object-cover rounded-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {prod.name}
                  </div>
                  <div className="text-sm text-gray-500">{prod.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span
                    className={
                      prod.stock === 0
                        ? "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                        : prod.stock <= 5
                        ? "inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"
                        : "text-gray-900"
                    }
                  >
                    {prod.stock}
                    {prod.stock === 0 && " (Out of Stock)"}
                    {prod.stock > 0 && prod.stock <= 5 && " (Low Stock)"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${formatMoney(prod.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => startEditing(prod)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      title="Edit product"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      disabled={isDeleting === prod.id}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400 transition-colors duration-200"
                      title="Delete product"
                    >
                      {isDeleting === prod.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter
              ? "No products match your search criteria."
              : "Get started by creating your first product."}
          </p>
        </div>
      )}
    </div>
  );
}
