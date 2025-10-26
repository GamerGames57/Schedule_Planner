// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // For Boston University logo

export default function LandingPage() {
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [chatInput, setChatInput] = useState<string>(''); // For the input field on the landing page
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTranscriptFile(e.target.files[0]);
    }
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (transcriptFile && chatInput.trim()) { // Check if both file and text are present
      // In a real app, you'd send the transcript file to an API here
      // and maybe the initial chatInput. For now, we just transition.
      console.log('Transcript uploaded:', transcriptFile.name);
      console.log('Initial chat:', chatInput);
      router.push('/chat'); // Navigate to the chat page
    } else {
        alert('Please upload a transcript AND type an initial message.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-900 p-4">
      {/* Header with BU Logo and Title */}
      <div className="absolute top-4 left-4">
        {/* <<< FIX: Updated src to use bu_logo.svg */}
        <Image src="/bu_logo.svg" alt="Boston University Logo" width={120} height={40} />
      </div>

      <h1 className="text-4xl font-bold text-red-600 mb-2 mt-16">Boston University</h1>
      <h2 className="text-3xl font-semibold text-gray-800 mb-12">AI Schedule Planning Assistant</h2>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl px-4">
        {/* Upload Transcript Button */}
        <label
          htmlFor="transcript-upload"
          className="flex flex-col items-center justify-center w-full md:w-1/3 p-10 bg-red-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-red-700 transition-colors"
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
            accept=".pdf,.doc,.docx,.txt" // Specify accepted file types
            onChange={handleFileChange}
            className="hidden"
          />
          {transcriptFile && (
            <p className="mt-2 text-sm text-gray-200">{transcriptFile.name}</p>
          )}
        </label>

        {/* Spacer for visual separation */}
        <div className="hidden md:block w-px h-48 bg-gray-300 mx-8"></div> {/* Vertical line */}
        <div className="md:hidden w-48 h-px bg-gray-300 my-8"></div> {/* Horizontal line for small screens */}

        {/* Initial Chat Input */}
        <form onSubmit={handleSend} className="flex flex-col items-center justify-center w-full md:w-2/3">
            <div className="relative flex items-center w-full max-w-xl">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="How can I help you?"
                    className="flex-1 p-3 pr-12 bg-blue-100 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
                />
                <button
                    type="submit"
                    className="absolute right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
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
            </div>
            <p className="mt-2 text-sm text-gray-600">
                {transcriptFile ? 'Now type your initial message and click send.' : 'Upload your transcript and type an initial message.'}
            </p>
        </form>
      </div>
    </div>
  );
}