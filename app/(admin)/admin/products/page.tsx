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
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
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
  // ✅ ADDED: Stock filter options
  const [stockFilter, setStockFilter] = useState<
    "all" | "in-stock" | "out-of-stock" | "low-stock"
  >("all");
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(products?.map((p) => p.category) || [])];

  // ✅ IMPROVED: Enhanced filtering with stock options
  const filteredProducts =
    products?.filter((p) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !categoryFilter || p.category === categoryFilter;

      // Stock filter
      const matchesStock = (() => {
        switch (stockFilter) {
          case "in-stock":
            return p.stock > 0;
          case "out-of-stock":
            return p.stock === 0;
          case "low-stock":
            return p.stock > 0 && p.stock <= 5;
          default:
            return true;
        }
      })();

      // Show/hide out of stock toggle
      const matchesOutOfStockToggle = showOutOfStock || p.stock > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesOutOfStockToggle
      );
    }) || [];

  // ✅ ADDED: Get counts for different stock levels
  const stockCounts = {
    total: products?.length || 0,
    inStock: products?.filter((p) => p.stock > 0).length || 0,
    outOfStock: products?.filter((p) => p.stock === 0).length || 0,
    lowStock: products?.filter((p) => p.stock > 0 && p.stock <= 5).length || 0,
  };

  const resolveImagePath = (imagePath?: string | null): string => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
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
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("description", formState.description || "");
      formData.append("price", formState.price);
      formData.append("category", formState.category);
      formData.append("stock", formState.stock || "0");

      if (editingProduct) {
        formData.append("id", String(editingProduct.id));
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (editingProduct?.imageUrl) {
        formData.append("imageUrl", editingProduct.imageUrl);
        formData.append("keepExistingImage", "true");
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorMsg = await readError(res);
        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log("Product saved:", result);

      mutate("/api/admin/products");
      resetAndCloseForms();
    } catch (err: any) {
      console.error("Form submission error:", err);
      setFormError(err.message || "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ IMPROVED: Enhanced delete function with better options
  const handleDeleteProduct = async (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    // Different approach based on stock status
    if (product.stock === 0) {
      // For out of stock items, ask if they want to permanently delete
      const confirmDelete = confirm(
        `"${product.name}" is currently out of stock.\n\nDo you want to permanently delete this product? This action cannot be undone.`
      );

      if (!confirmDelete) return;

      setIsDeleting(productId);

      try {
        const res = await fetch(
          `/api/admin/products?id=${productId}&force=true`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          const result = await res.json();
          alert(
            `Product permanently deleted! ${result.removedOrderItems ? `Removed from ${result.removedOrderItems} order(s).` : ""}`
          );
          mutate("/api/admin/products");
        } else {
          throw new Error(await readError(res));
        }
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      } finally {
        setIsDeleting(null);
      }
    } else {
      // For in-stock items, use the existing logic
      const firstConfirm = confirm(
        `Delete "${product.name}"?\n\nStock: ${product.stock} units\n\nIf this product is in orders, it will be marked as out of stock instead.`
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
    }
  };

  // ✅ ADDED: Bulk delete out of stock items
  const handleBulkDeleteOutOfStock = async () => {
    const outOfStockProducts = products?.filter((p) => p.stock === 0) || [];

    if (outOfStockProducts.length === 0) {
      alert("No out of stock products to delete.");
      return;
    }

    const confirmBulkDelete = confirm(
      `Delete all ${outOfStockProducts.length} out of stock products?\n\n${outOfStockProducts.map((p) => `• ${p.name}`).join("\n")}\n\nThis action cannot be undone.`
    );

    if (!confirmBulkDelete) return;

    setIsBulkDeleting(true);

    try {
      const deletePromises = outOfStockProducts.map((product) =>
        fetch(`/api/admin/products?id=${product.id}&force=true`, {
          method: "DELETE",
        })
      );

      const results = await Promise.all(deletePromises);
      const successful = results.filter((r) => r.ok).length;
      const failed = results.length - successful;

      if (failed > 0) {
        alert(
          `Bulk delete completed with some errors.\nSuccessful: ${successful}\nFailed: ${failed}`
        );
      } else {
        alert(`Successfully deleted ${successful} out of stock products.`);
      }

      mutate("/api/admin/products");
    } catch (err: any) {
      alert(`Bulk delete error: ${err.message}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ✅ ADDED: Restore stock function
  const handleRestoreStock = async (productId: number) => {
    const product = products?.find((p) => p.id === productId);
    if (!product) return;

    const newStock = prompt(
      `Restore stock for "${product.name}":\n\nEnter new stock quantity:`,
      "10"
    );

    if (newStock === null) return;

    const stockNumber = parseInt(newStock, 10);
    if (isNaN(stockNumber) || stockNumber < 0) {
      alert("Please enter a valid stock number (0 or greater).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(productId));
      formData.append("name", product.name);
      formData.append("description", product.description || "");
      formData.append("price", String(product.price));
      formData.append("category", product.category);
      formData.append("stock", String(stockNumber));
      formData.append("imageUrl", product.imageUrl || "");
      formData.append("keepExistingImage", "true");

      const res = await fetch("/api/admin/products", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert(
          `Stock restored! "${product.name}" now has ${stockNumber} units.`
        );
        mutate("/api/admin/products");
      } else {
        throw new Error(await readError(res));
      }
    } catch (err: any) {
      alert(`Error restoring stock: ${err.message}`);
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
      {/* ✅ IMPROVED: Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-3" />
            Product Management
          </h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>Total: {stockCounts.total}</span>
            <span className="text-green-600">
              In Stock: {stockCounts.inStock}
            </span>
            <span className="text-red-600">
              Out of Stock: {stockCounts.outOfStock}
            </span>
            <span className="text-yellow-600">
              Low Stock: {stockCounts.lowStock}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* ✅ ADDED: Bulk actions */}
          {stockCounts.outOfStock > 0 && (
            <button
              onClick={handleBulkDeleteOutOfStock}
              disabled={isBulkDeleting}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isBulkDeleting ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <Trash2 className="mr-2" size={16} />
              )}
              Delete All Out of Stock ({stockCounts.outOfStock})
            </button>
          )}
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
      </div>

      {/* Form section - keeping your existing form code */}
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

          {/* Image Upload Section */}
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
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : imagePreview ? (
                  <img
                    src={resolveImagePath(imagePreview)}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UploadCloud className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <input
                  id="file-upload"
                  name="file"
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

      {/* ✅ IMPROVED: Enhanced filters */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 items-start lg:items-center">
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

        {/* ✅ ADDED: Stock filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock ({stockCounts.inStock})</option>
          <option value="out-of-stock">
            Out of Stock ({stockCounts.outOfStock})
          </option>
          <option value="low-stock">Low Stock ({stockCounts.lowStock})</option>
        </select>

        {/* ✅ ADDED: Toggle out of stock visibility */}
        <button
          onClick={() => setShowOutOfStock(!showOutOfStock)}
          className={`inline-flex items-center px-3 py-2 rounded-md border ${
            showOutOfStock
              ? "bg-gray-100 text-gray-700 border-gray-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {showOutOfStock ? (
            <Eye className="mr-2" size={16} />
          ) : (
            <EyeOff className="mr-2" size={16} />
          )}
          {showOutOfStock ? "Showing Out of Stock" : "Hiding Out of Stock"}
        </button>
      </div>

      {/* ✅ IMPROVED: Product table with enhanced actions */}
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
              <tr
                key={prod.id}
                className={`hover:bg-gray-50 ${prod.stock === 0 ? "bg-red-50" : ""}`}
              >
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(prod)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-200"
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* ✅ ADDED: Restore stock button for out of stock items */}
                    {prod.stock === 0 && (
                      <button
                        onClick={() => handleRestoreStock(prod.id)}
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors duration-200"
                        title="Restore stock"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      disabled={isDeleting === prod.id}
                      className={`p-1 rounded transition-colors duration-200 ${
                        prod.stock === 0
                          ? "text-red-600 hover:text-red-900"
                          : "text-orange-600 hover:text-orange-900"
                      } disabled:text-gray-400`}
                      title={
                        prod.stock === 0
                          ? "Permanently delete"
                          : "Delete product"
                      }
                    >
                      {isDeleting === prod.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
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
            {searchTerm || categoryFilter || stockFilter !== "all"
              ? "No products match your search criteria."
              : "Get started by creating your first product."}
          </p>
        </div>
      )}
    </div>
  );
}
