'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      alert('Registration successful! Please login')
      router.push('/login')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className='max-w-md mx-auto mt-10'>
      <h1 className='text-2xl font-bold mb-4'>Register</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block mb-1'>Email</label>
          <input
            type='email'
            required
            className='border p-2 w-full'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className='block mb-1'>Password</label>
          <input
            type='password'
            required
            className='border p-2 w-full'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md'
        >
          Register
        </button>
      </form>
    </div>
  )
}
