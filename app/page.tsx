'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null); 
  const [chatInput, setChatInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranscriptFile(e.target.files[0]);
    }
  };

  const handleSend = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (!chatInput.trim()) {
      alert('Please type an initial message.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const payload = {
        chatInput: chatInput,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Server failed to process the request.';
        try {
          const errData = await response.json();
          errorMessage = errData.error || 'Server error';
        } catch (parseError) {
          errorMessage = `Server Error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json()

      const initialMessages = [
        { role: 'user', content: chatInput },
        { role: 'assistant', content: data.reply },
      ];

      sessionStorage.setItem('initialMessages', JSON.stringify(initialMessages));
      sessionStorage.setItem('chatSessionId', data.sessionId);

      router.push('/chat');
      
    } catch (err: unknown) {
      let errorMessage = 'An unknown error occurred. Please try again.';
      if (err instanceof Error) {
        errorMessage = `Error: ${err.message}. Please try again.`;
      }
      console.error('Failed to process or navigate:', err);
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-900 p-4">
      {/* BU Logo and Title */}
      <div className="absolute top-4 left-4">
        {/* Logo is 1.5x size AND a hyperlink */}
        <a
          href="https://www.bu.edu/mybu/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/bu_logo.svg"
            alt="Boston University Logo"
            width={180} // 1.5x size
            height={60} // 1.5x size
          />
        </a>
      </div>

      <h1 className="text-4xl font-bold text-red-600 mb-2 mt-16">Boston University</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-12">AI Schedule Planning Assistant</h2>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl px-4">
        {/* Upload Transcript Button (Visual Only) */}
        <label
          htmlFor="transcript-upload"
          className={`flex flex-col items-center justify-center w-full md:w-1/3 p-10 bg-red-600 text-white rounded-lg shadow-lg cursor-pointer transition-colors ${
            isProcessing ? 'opacity-50' : 'hover:bg-red-700'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="text-xl font-semibold">Upload Transcript</span>
          <input
            id="transcript-upload"
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
          {transcriptFile && (
            <p className="mt-2 text-sm text-gray-200">{transcriptFile.name}</p>
          )}
        </label>

        {/* Spacer for visual separation */}
        <div className="hidden md:block w-px h-48 bg-gray-300 mx-8"></div>
        <div className="md:hidden w-48 h-px bg-gray-300 my-8"></div>

        {/* Initial Chat Input */}
        <form onSubmit={handleSend} className="flex flex-col items-center justify-center w-full md:w-2/3">
            <div className="relative flex items-center w-full max-w-xl">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="How can I help you?"
                    className="flex-1 p-3 pr-12 bg-blue-100 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
                    disabled={isProcessing}
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                >
                  {/* Loading spinner logic */}
                  {isProcessing ? (
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
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
                  )}
                </button>
            </div>
            {/* Help text / Error message */}
            <p className="mt-2 text-sm text-gray-600 h-5">
              {isProcessing ? 'Thinking...' : 
              error ? <span className="text-red-500">{error}</span> : 
              'Type your initial message to start.'}
            </p>
        </form>
      </div>
    </div>
  );
}