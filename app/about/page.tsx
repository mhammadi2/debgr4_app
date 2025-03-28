// app/about/page.tsx
'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <motion.section
      // Simple fade-up animation
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Title */}
      <h1 className='text-3xl font-bold mb-6'>About Us</h1>

      {/* Intro / Overview */}
      <p className='mb-4'>
        Welcome to <strong>DeBugR4</strong>, your innovative partner in
        integrated circuit (IC) design and high-performance electronics
        solutions. We’re a fast-growing startup driven by a passion for crafting
        cutting-edge hardware that powers the latest advancements in IoT, AI,
        industrial automation, and consumer devices.
      </p>

      {/* Founders & Origins */}
      <h2 className='text-2xl font-semibold mt-8 mb-4'>Our Origin Story</h2>
      <p className='mb-4'>
        Founded by a team of seasoned semiconductor engineers, software
        developers, and entrepreneurs, ChipCo began with a shared vision: to
        revolutionize the hardware landscape through agility, creativity, and
        relentless innovation. With backgrounds spanning leading tech giants and
        academic research labs, our founders combined their expertise to create
        a nimble, visionary startup that could respond to market demands at
        lightning speed.
      </p>

      {/* Mission & Values */}
      <h2 className='text-2xl font-semibold mt-8 mb-4'>Our Mission & Values</h2>
      <p className='mb-4'>
        At ChipCo, we believe every breakthrough starts with a daring idea. Our
        mission is to push the boundaries of electronics design—delivering chips
        and modules that power next-generation devices while optimizing energy
        consumption, performance, and form factor. We stand by our core values
        of:
      </p>
      <ul className='list-disc ml-5 mb-4 space-y-2'>
        <li>
          <strong>Innovation</strong> – We constantly experiment, iterate, and
          improve our solutions.
        </li>
        <li>
          <strong>Quality</strong> – Each design undergoes rigorous testing,
          ensuring reliability from prototype to mass production.
        </li>
        <li>
          <strong>Collaboration</strong> – We view each client as a partner,
          working closely to meet and exceed requirements.
        </li>
        <li>
          <strong>Sustainability</strong> – We prioritize eco-friendly
          processes, from material selection to energy efficiency.
        </li>
      </ul>

      {/* Products & Specialties */}
      <h2 className='text-2xl font-semibold mt-8 mb-4'>Our Specialties</h2>
      <p className='mb-4'>
        From flexible wireless modules to robust microcontrollers for industrial
        robotics, we focus on designing products that excel in both performance
        and power efficiency. Our current lineup includes:
      </p>
      <ul className='list-disc ml-5 mb-4 space-y-2'>
        <li>
          <em>AI-Ready SoCs</em> – Ultra-fast processors tailored for on-device
          machine learning.
        </li>
        <li>
          <em>Ultra-Low-Power MCUs</em> – Optimized for wearables and IoT
          sensors.
        </li>
        <li>
          <em>Mixed-Signal ICs</em> – Bridging the analog and digital realms for
          medical and automotive applications.
        </li>
      </ul>

      {/* Team & Culture */}
      <h2 className='text-2xl font-semibold mt-8 mb-4'>Team & Culture</h2>
      <p className='mb-4'>
        Our culture is built around open communication, cross-disciplinary
        collaboration, and a readiness to explore new ideas—no matter how
        unconventional. Whether perfecting hardware security features or
        refining a low-noise analog front-end, we tackle challenges with a
        creative, solutions-first mindset.
      </p>

      {/* Looking Ahead */}
      <h2 className='text-2xl font-semibold mt-8 mb-4'>Looking Ahead</h2>
      <p className='mb-4'>
        As ChipCo continues to grow, we remain committed to our startup roots:
        maintaining agility, nurturing innovation, and delivering transformative
        products that help our clients stay ahead of the curve. We envision a
        future where powerful, efficient ICs become the backbone of every smart
        device—creating cleaner, smarter, and more connected communities
        worldwide.
      </p>

      {/* Call to Action */}
      <p className='mb-4 font-medium'>
        Have questions or want to learn more about our process? Reach out to us
        anytime at
        <a href='/contact' className='text-blue-600 hover:underline ml-1'>
          our contact page
        </a>
        , or explore our
        <a href='/products' className='text-blue-600 hover:underline ml-1'>
          product lineup
        </a>
        to see what we’re building next.
      </p>
    </motion.section>
  )
}
