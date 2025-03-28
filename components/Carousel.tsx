// components/Carousel.tsx
'use client'

import React from 'react'
import Slider from 'react-slick'
import Image from 'next/image'
import { motion } from 'framer-motion'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    adaptiveHeight: true,
  }

  const slides = [
    {
      image: '/images/chip-slide1.jpg',
      title: 'Next-Gen Microcontrollers',
      description: 'Experience unmatched performance and reliability',
    },
    {
      image: '/images/chip-slide2.jpg',
      title: 'High-Speed SoC Solutions',
      description: 'Optimized for robotics, AI, and data processing',
    },
    {
      image: '/images/chip-slide3.jpg',
      title: 'Ultra-Low-Power ICs',
      description: 'Perfect for wearables, IoT, and mobile devices',
    },
  ]

  return (
    <div className='overflow-hidden rounded-lg shadow-lg'>
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className='relative'
          >
            <Image
              src={slide.image}
              alt={slide.title}
              width={1200}
              height={600}
              className='w-full h-auto object-cover'
              priority={idx === 0}
            />
            <div className='absolute inset-0 bg-black bg-opacity-25 flex flex-col justify-center items-center text-white p-4'>
              <h2 className='text-2xl md:text-4xl font-bold'>{slide.title}</h2>
              <p className='mt-2 text-md md:text-lg'>{slide.description}</p>
            </div>
          </motion.div>
        ))}
      </Slider>
    </div>
  )
}
