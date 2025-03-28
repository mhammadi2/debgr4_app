// app/page.tsx
'use client'

import { motion } from 'framer-motion'
import Carousel from '@/components/Carousel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <motion.section
      // fade in + slight upward motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className='space-y-8'
    >
      {/* Carousel at the top */}
      <Carousel />

      {/* Animated intro */}
      <div className='text-center mt-8'>
        <h1 className='text-4xl font-bold'>Welcome to ChipCo</h1>
        <p className='text-lg mt-2 max-w-2xl mx-auto'>
          We specialize in cutting-edge integrated circuits and high-performance
          SoC solutions...
        </p>
      </div>

      {/* Cards for marketing sections */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* ...same card code as before... */}
        <Card>
          <CardHeader>
            <CardTitle>Full-Custom IC Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              From concept to silicon, our full-custom IC design services...
            </p>
            <Button className='mt-4'>Get Started</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Full-Custom IC Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              From concept to silicon, our full-custom IC design services...
            </p>
            <Button className='mt-4'>Get Started</Button>
          </CardContent>
        </Card>
        {/* ...more cards... */}
      </div>
    </motion.section>
  )
}
