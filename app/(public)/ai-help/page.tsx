// app/ai-help/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2, AlertTriangle } from "lucide-react";

// Define the structure of the API response
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export default function AIHelpPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined prompt contexts to guide the AI
  const SYSTEM_PROMPTS = [
    "You are an expert semiconductor and integrated circuit design assistant.",
    "Provide technical, precise, and clear answers about chip design.",
    "Focus on explaining complex concepts in an understandable manner.",
    "If a query is too broad, ask for more specific details.",
  ];

  const handleAskAI = async () => {
    // Reset previous states
    setResponse("");
    setError(null);

    // Validate query
    if (!query.trim()) {
      setError("Please enter a valid question.");
      return;
    }

    setLoading(true);

    try {
      // Construct the full prompt with system context
      const fullPrompt = [...SYSTEM_PROMPTS, `User Query: ${query}`].join(" ");

      // Call the Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: fullPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 10,
            },
          }),
        }
      );

      // Parse the response
      const data: GeminiResponse = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setResponse(aiResponse);
      } else if (data.error) {
        setError(data.error.message);
      } else {
        setError("No response from AI. Please try again.");
      }
    } catch (err) {
      console.error("AI Query Error:", err);
      setError(
        "An error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <Sparkles className="mr-3 text-blue-600" /> AI Semiconductor Design
            Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Get instant insights and explanations about integrated circuit
            design
          </p>
        </motion.header>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg p-8"
        >
          <div className="mb-6">
            <label
              htmlFor="ai-query"
              className="block mb-2 text-sm font-medium"
            >
              Your Question
            </label>
            <textarea
              id="ai-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about semiconductor design, IC architectures, design techniques..."
              rows={4}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded flex items-center">
              <AlertTriangle className="mr-2 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          <button
            onClick={handleAskAI}
            disabled={loading}
            className={`w-full flex items-center justify-center py-3 rounded-md transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" /> Generating Response...
              </>
            ) : (
              <>
                <Send className="mr-2" /> Ask AI
              </>
            )}
          </button>

          {response && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-gray-50 rounded-md"
            >
              <h3 className="font-semibold mb-2">AI Response:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500"
        >
          <p>
            Note: AI responses are generated based on available knowledge.
            Always verify critical technical information.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
