import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

/**
 * Calls the remote Langflow API
 */
async function callLangflow(input: string, sessionId: string) {
  // 1. Get the URL and Key from your environment file
  const langflowUrl = process.env.LANGFLOW_API_URL;
  const langflowApiKey = process.env.LANGFLOW_API_KEY;

  if (!langflowUrl) throw new Error('LANGFLOW_API_URL is not set');
  if (!langflowApiKey) throw new Error('LANGFLOW_API_KEY is not set');

  // 2. Build the *exact* payload your API needs
  const requestPayload = {
    output_type: "text",
    input_type: "text",
    input_value: input,     // The user's prompt
    session_id: sessionId,  // The conversation ID
  };

  // 3. Make the fetch call with the API key
  const response = await fetch(langflowUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': langflowApiKey,
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Langflow API error:', errorText);
    throw new Error(`Langflow API responded with status ${response.status}`);
  }

  const data = await response.json();

  // This log is great for debugging
  console.log("Full Langflow Response:", JSON.stringify(data, null, 2));
  
  // 4. Use the correct path to the reply
  // This path (results.text.text) matches your previous successful log
  const aiReply = data?.outputs?.[0]?.outputs?.[0]?.results?.text?.text;


  if (typeof aiReply !== 'string') {
    console.error('Could not parse AI reply from Langflow response:', data);
    throw new Error('Invalid response structure from Langflow'); 
  }
  return aiReply;
}

/**
 * Handles all POST requests for the chat (JSON only)
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported Content-Type. This route only accepts application/json' }, { status: 415 });
    }

    const body = await req.json();
    let prompt: string;
    let sessionId: string;

    if (body.sessionId && body.messages) {
      // --- HANDLE FOLLOW-UP MESSAGE ---
      prompt = body.messages[body.messages.length - 1]?.content;
      sessionId = body.sessionId;

      if (!prompt || !sessionId) {
        throw new Error('Invalid JSON request: Missing messages or sessionId');
      }
    } else if (body.chatInput) {
      // --- HANDLE INITIAL REQUEST (TEXT-ONLY) ---
      prompt = body.chatInput;
      sessionId = randomUUID(); // Create a new session
    } else {
      throw new Error('Invalid JSON request: Must provide either chatInput or (messages and sessionId)');
    }

    // Call the LIVE function with the prepared prompt and session ID
    const aiReply = await callLangflow(prompt, sessionId);

    // Return the reply and the session ID
    return NextResponse.json({
      reply: aiReply,
      sessionId: sessionId,
    });
    
  } catch (error: unknown) {
    let errorMessage = 'An unknown server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in /api/chat route:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}