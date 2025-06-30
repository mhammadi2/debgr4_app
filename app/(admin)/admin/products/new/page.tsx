// app/(admin)/admin/products/new/page.tsx
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <AdminPageHeader title="Create New Product" backHref="/admin/products" />
      <div className="p-8">
        <ProductForm initialData={null} />
      </div>
    </div>
  );
}
