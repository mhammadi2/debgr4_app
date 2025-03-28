// app/ai-help/page.tsx
'use client'

import { useState } from 'react'

export default function AIHelpPage() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')

  const handleAskAI = async () => {
    // Example stub logic for an AI endpoint call
    setResponse(`AI says: I received your query, "${query}".`)
  }

  return (
    <section>
      <h1 className='text-2xl font-bold mb-4'>AI Help & Support</h1>
      <p>Ask our AI assistant about chip design, specs, or solutions:</p>
      <div className='mt-4'>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Type your question...'
          className='border p-2 w-full md:w-1/2'
        />
        <br />
        <button
          onClick={handleAskAI}
          className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-md'
        >
          Ask AI
        </button>
      </div>
      {response && (
        <div className='mt-4 bg-gray-50 p-2 rounded-md'>{response}</div>
      )}
    </section>
  )
}
