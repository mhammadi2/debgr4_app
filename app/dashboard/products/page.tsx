"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductsManagementPage() {
  const {
    data: products,
    error,
    mutate,
  } = useSWR<any[]>("/api/products", fetcher);

  // CREATE product states
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCategory, setNewCategory] = useState(""); // New state for category

  // EDIT product states
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState(""); // New state for category

  // CREATE
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!newName) {
      alert("Product name is required");
      return;
    }

    if (!newCategory) {
      alert("Category is required");
      return;
    }

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Price must be a non-negative number");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          price: priceNum,
          imageUrl: newImageUrl || null,
          category: newCategory, // Added category
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create product");
      }

      mutate();
      alert("Product created!");
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      setNewImageUrl("");
      setNewCategory(""); // Clear category
      setShowCreate(false);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // OPEN EDIT
  function startEditing(prod: any) {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditDescription(prod.description || "");
    setEditPrice(prod.price.toString());
    setEditImageUrl(prod.imageUrl || "");
    setEditCategory(prod.category || ""); // Add category
  }

  // CANCEL EDIT
  function cancelEdit() {
    setEditingProduct(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditImageUrl("");
    setEditCategory(""); // Clear category
  }

  // SUBMIT EDIT
  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct?.id) return;

    if (!editCategory) {
      alert("Category is required");
      return;
    }

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Price must be a non-negative number");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editName,
          description: editDescription,
          price: priceNum,
          imageUrl: editImageUrl || null,
          category: editCategory, // Added category
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update product");
      }

      mutate();
      alert("Product updated!");
      cancelEdit();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // DELETE
  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }
      mutate();
      alert("Product deleted!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (error) return <div>Error loading products: {error.message}</div>;
  if (!products) return <div>Loading products...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Product Management</h1>

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
      >
        {showCreate ? "Hide Create Form" : "Create New Product"}
      </button>

      {/* CREATE FORM */}
      {showCreate && (
        <form
          onSubmit={handleCreateProduct}
          className="p-4 border rounded mb-6 space-y-4"
        >
          <h2 className="font-semibold">Create Product</h2>

          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {/* Added Category field */}
          <div>
            <label className="block mb-1">Category</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea
              className="border p-2 w-full"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border p-2 w-full"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Image URL (optional)</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
          </div>

          {/* Preview new image */}
          {newImageUrl && (
            <img
              src={newImageUrl}
              alt="Preview"
              className="max-w-xs border mt-2"
            />
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Create
          </button>
        </form>
      )}

      {/* EDIT FORM */}
      {editingProduct && (
        <form
          onSubmit={handleEditProduct}
          className="p-4 border rounded mb-6 space-y-4"
        >
          <h2 className="font-semibold">Edit Product: {editingProduct.name}</h2>

          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          {/* Added Category field */}
          <div>
            <label className="block mb-1">Category</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea
              className="border p-2 w-full"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border p-2 w-full"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Image URL (optional)</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={editImageUrl}
              onChange={(e) => setEditImageUrl(e.target.value)}
            />
          </div>

          {/* Preview edit image */}
          {editImageUrl && (
            <img
              src={editImageUrl}
              alt="Preview"
              className="max-w-xs border mt-2"
            />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* PRODUCT TABLE */}
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="border-collapse border w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Category</th>{" "}
              {/* Added Category column */}
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Image</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td className="border px-2 py-1">{prod.id}</td>
                <td className="border px-2 py-1">{prod.name}</td>
                <td className="border px-2 py-1">{prod.category}</td>{" "}
                {/* Added Category display */}
                <td className="border px-2 py-1">{prod.price}</td>
                <td className="border px-2 py-1">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="h-12 w-auto object-cover"
                    />
                  ) : (
                    "No image"
                  )}
                </td>
                <td className="border px-2 py-1">
                  {new Date(prod.createdAt).toLocaleString()}
                </td>
                <td className="border px-2 py-1 text-center space-x-2">
                  <button
                    onClick={() => startEditing(prod)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
