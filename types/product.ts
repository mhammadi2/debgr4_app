// types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}
