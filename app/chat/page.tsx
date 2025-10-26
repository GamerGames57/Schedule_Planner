'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Helper function to load initial state from sessionStorage
function getInitialState(): { messages: Message[]; sessionId: string | null } {
  if (typeof window === 'undefined') {
    return { messages: [], sessionId: null };
  }
  
  try {
    const storedMessages = sessionStorage.getItem('initialMessages');
    const sessionId = sessionStorage.getItem('chatSessionId');
    
    if (storedMessages) {
      sessionStorage.removeItem('initialMessages'); 
      return {
        messages: JSON.parse(storedMessages),
        sessionId: sessionId,
      };
    }
  } catch (error) {
    console.error('Failed to parse stored messages', error);
  }
  
  // Default state if nothing is found (page refresh)
  return { messages: [], sessionId: sessionStorage.getItem('chatSessionId') };
}

export default function ChatPage() {
  // Helper function for lazy initialization
  // Runs on first component load only
  const [initialState] = useState(getInitialState);
  
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [sessionId, setSessionId] = useState<string | null>(initialState.sessionId);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handles all SUBSEQUENT messages
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) {
      if (!sessionId) alert('Chat session not found. Please start over.');
      return;
    }

    const userInput: Message = { role: 'user', content: input };
    const newMessages = [...messages, userInput];
    setMessages(newMessages);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: { reply: string; sessionId: string } = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.reply },
      ]);
      setSessionId(data.sessionId); 
      
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
        <Image src="/bu_logo.svg" alt="Boston University Logo" width={80} height={25} className="mr-4" />
        <h1 className="text-xl font-semibold text-gray-800">Schedule Planning Assistant</h1>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
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

      {/* Input Form (Styled to match image) */}
      <footer className="p-4 bg-white border-t border-gray-200 flex justify-center">
        <form onSubmit={handleSubmit} className="flex items-center w-full max-w-2xl px-4 py-2 bg-blue-100 rounded-full shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            placeholder="How can I help you?"
            disabled={isLoading}
            className="flex-1 p-0 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0 border-none"
          />
          <button
            type="submit"
            disabled={isLoading || !sessionId}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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