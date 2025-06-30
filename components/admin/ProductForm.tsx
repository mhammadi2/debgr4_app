// components/admin/ProductForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { UploadCloud, Loader, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  initialData?: Product | null; // Product data for editing, null for creating
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Using selectedFile instead of imageUrl for new uploads
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(initialData);

  // Load initial data when editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        price: String(initialData.price),
        stock: String(initialData.stock),
        category: initialData.category || "",
        imageUrl: initialData.imageUrl || "",
      });
    }
  }, [initialData, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Clear existing imageUrl to avoid confusion
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    } else {
      setSelectedFile(null);
    }
  };

  const clearErrors = () => {
    setError(null);
    setDebugInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    try {
      // Create FormData object for multipart/form-data submission
      const submitFormData = new FormData();

      // Add all form fields
      submitFormData.append("name", formData.name);
      submitFormData.append("description", formData.description || "");
      submitFormData.append("price", formData.price);
      submitFormData.append("stock", formData.stock);
      submitFormData.append("category", formData.category);

      // Add ID for edit mode
      if (isEditMode && initialData) {
        submitFormData.append("id", String(initialData.id));
      }

      // Handle image - CRITICAL: Use "file" field name to match your api/upload endpoint
      if (selectedFile) {
        submitFormData.append("file", selectedFile);
        // Log for debugging
        setDebugInfo(
          `Selected file: ${selectedFile.name}, size: ${(
            selectedFile.size / 1024
          ).toFixed(2)} KB`
        );
      } else if (formData.imageUrl) {
        // Existing image URL (for edit mode)
        submitFormData.append("imageUrl", formData.imageUrl);
        submitFormData.append("keepExistingImage", "true");
      }

      // Log form fields for debugging
      let formFields = "";
      for (const [key, value] of submitFormData.entries()) {
        if (value instanceof File) {
          formFields += `${key}: [File ${value.name}], `;
        } else {
          formFields += `${key}: ${value}, `;
        }
      }
      console.log("Submitting form with:", formFields);

      // Make the API request
      const url = "/api/admin/products";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: submitFormData, // No headers - browser sets them correctly with boundary
      });

      // Handle response
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || "Server returned an error";
        } catch (e) {
          // If not JSON, try to get text
          errorMessage = await response
            .text()
            .catch(
              () => `HTTP error ${response.status}: ${response.statusText}`
            );
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Product saved:", result);

      // Success - redirect back to products page
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Form submission error:", err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // For direct debugging access in browser console
  useEffect(() => {
    // @ts-ignore
    window._debugProductForm = {
      formData,
      selectedFile,
      clearFile: () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      clearForm: () => {
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          imageUrl: "",
        });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    };
  }, [formData, selectedFile]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      encType="multipart/form-data"
    >
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" /> <p>{error}</p>
        </div>
      )}

      {debugInfo && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
          <p className="text-sm font-mono">{debugInfo}</p>
        </div>
      )}

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
            ) : formData.imageUrl ? (
              // Show existing image
              <img
                src={formData.imageUrl}
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
            {(formData.imageUrl || selectedFile) && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, imageUrl: "" }));
                  setSelectedFile(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
            Stock
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
            min="0"
            step="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="mr-4 px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading && <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />}
          {isEditMode ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
