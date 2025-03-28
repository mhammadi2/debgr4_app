// app/products/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error('Error fetching products:', error))
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className='text-2xl font-bold mb-4'>Our Products</h1>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm'>Category: {product.category}</p>
              <p className='text-sm'>Description: {product.description}</p>
              <p className='font-semibold mt-2'>Price: ${product.price}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  )
}
