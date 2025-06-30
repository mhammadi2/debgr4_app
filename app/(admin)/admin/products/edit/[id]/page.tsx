// In: app/(admin)/admin/products/edit/[id]/page.tsx
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return product;
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <AdminPageHeader
        title={`Edit: ${product.name}`}
        backHref="/admin/products"
      />
      <div className="p-8">
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}
