import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

async function callLangflow(input: string, sessionId: string) {
  const langflowUrl = process.env.LANGFLOW_API_URL;
  const langflowApiKey = process.env.LANGFLOW_API_KEY;

  if (!langflowUrl) throw new Error('LANGFLOW_API_URL is not set');
  if (!langflowApiKey) throw new Error('LANGFLOW_API_KEY is not set');

  const requestPayload = {
    output_type: "chat",
    input_type: "text",
    input_value: input,
    session_id: sessionId,
  };

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

  console.log("Full Langflow Response:", JSON.stringify(data, null, 2));
  
  const aiReply = data?.outputs?.[0]?.outputs?.[0]?.results?.text?.text;


  if (typeof aiReply !== 'string') {
    console.error('Could not parse AI reply from Langflow response:', data);
    throw new Error('Invalid response structure from Langflow'); 
  }
  return aiReply;
}
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
      prompt = body.messages[body.messages.length - 1]?.content;
      sessionId = body.sessionId;

      if (!prompt || !sessionId) {
        throw new Error('Invalid JSON request: Missing messages or sessionId');
      }
    } else if (body.chatInput) {
      prompt = body.chatInput;
      sessionId = randomUUID();
    } else {
      throw new Error('Invalid JSON request: Must provide either chatInput or (messages and sessionId)');
    }

    // Call Langflow with prepared prompt and session ID
    const aiReply = await callLangflow(prompt, sessionId);

    // Return reply and session ID
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