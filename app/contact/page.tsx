// app/contact/page.tsx
'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // send formData to your backend or an external service
    alert('Form submitted!')
  }

  return (
    <section>
      <h1 className='text-2xl font-bold mb-4'>Contact Us</h1>
      <form onSubmit={handleSubmit} className='space-y-4 max-w-md'>
        <div>
          <label className='block mb-1'>Name</label>
          <input
            required
            className='border p-2 w-full'
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div>
          <label className='block mb-1'>Email</label>
          <input
            required
            type='email'
            className='border p-2 w-full'
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div>
          <label className='block mb-1'>Message</label>
          <textarea
            required
            className='border p-2 w-full'
            rows={4}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
          />
        </div>
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md'
        >
          Submit
        </button>
      </form>
    </section>
  )
}
