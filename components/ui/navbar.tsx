// components/ui/navbar.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header>
      {/* Top Bar (Row 1) - dark green background, white text */}
      <div className='bg-green-700 text-white'>
        <div className='container mx-auto px-4 py-2 flex justify-between items-center'>
          <span className='text-sm'>
            <strong>DebugR4</strong> – Leading the Future of IC Design
          </span>
          <span className='text-sm hidden md:inline'>
            Contact: (800) 123-4567
          </span>
        </div>
      </div>

      {/* Navigation Bar (Row 2) */}
      <motion.nav
        // Slide down animation
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className='bg-white shadow-sm'
      >
        <div className='container mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between py-4'>
          {/* Brand / Logo */}
          <Link
            href='/'
            className='text-xl font-bold tracking-tight text-gray-800'
          >
            deBugR4
          </Link>

          {/* Hamburger Menu (mobile) */}
          <button
            className='md:hidden block text-gray-700 hover:text-blue-600'
            onClick={toggleMenu}
          >
            <Menu size={24} />
          </button>

          {/* Navigation Links */}
          <div
            className={`${
              isOpen ? 'block' : 'hidden'
            } w-full md:w-auto md:flex mt-4 md:mt-0`}
          >
            <ul className='flex flex-col md:flex-row md:space-x-6'>
              <li>
                <Link
                  href='/'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href='/about'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/products'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href='/supply'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Supply
                </Link>
              </li>
              <li>
                <Link
                  href='/design-service'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Design Service
                </Link>
              </li>
              <li>
                <Link
                  href='/login'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href='/ai-help'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  AI Help
                </Link>
              </li>
              <li>
                <Link
                  href='/contact'
                  className='block py-2 text-gray-800 hover:text-blue-600 md:p-0'
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </motion.nav>
    </header>
  )
}
