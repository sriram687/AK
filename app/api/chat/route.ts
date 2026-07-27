import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://172.16.7.240:11434';
  
  try {
    const { model, messages, temperature, contextLength } = await req.json();

    // Prepare options for Ollama
    const options: Record<string, any> = {};
    if (typeof temperature === 'number') {
      options.temperature = temperature;
    }
    if (typeof contextLength === 'number') {
      options.num_ctx = contextLength;
    }

    const requestBody = {
      model: model || 'qwen2.5-coder:14b',
      messages: messages || [],
      stream: true,
      options: Object.keys(options).length > 0 ? options : undefined,
    };

    // Forward request to local Ollama instance
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errJson = await response.json();
        errorMessage = errJson.error || errorMessage;
      } catch {
        try {
          const errText = await response.text();
          errorMessage = errText || errorMessage;
        } catch {}
      }
      return NextResponse.json({ 
        error: `Ollama error (${response.status}): ${errorMessage}` 
      }, { status: response.status });
    }

    if (!response.body) {
      return NextResponse.json({ error: 'No response body received from Ollama' }, { status: 500 });
    }

    // Set streaming headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx if proxying
    });

    return new Response(response.body, { headers });
  } catch (error: any) {
    console.error('Error in api/chat proxy route:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred during communication with Ollama' 
    }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
