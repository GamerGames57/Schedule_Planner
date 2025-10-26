// app/chat/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image'; // For Boston University logo

// Define the "shape" of a message object
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput: Message = { role: 'user', content: input };
    const newMessages = [...messages, userInput];
    setMessages(newMessages);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', { // Calls YOUR Next.js API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: { reply: string } = await response.json();
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.reply },
      ]);

    } catch (error) {
      console.error('Failed to fetch AI reply:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, I ran into an error.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="flex items-center p-4 bg-gray-100 border-b border-gray-200">
        {/* <<< FIX: Updated src to use bu_logo.svg */}
        <Image src="/bu_logo.svg" alt="Boston University Logo" width={80} height={25} className="mr-4" />
        <h1 className="text-xl font-semibold text-gray-80text-gray-800">Schedule Planning Assistant</h1>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.length === 0 && !isLoading && (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>Start chatting with your assistant!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-lg shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-3 rounded-lg shadow-md text-gray-600">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <footer className="p-4 bg-gray-100 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="How can I help you?"
            disabled={isLoading}
            className="flex-1 p-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}