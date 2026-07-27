import { NextResponse } from 'next/server';

export async function GET() {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://172.16.7.240:11434';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Ollama models:', error);
    return NextResponse.json({ 
      models: [], 
      error: error.message || 'Failed to connect to Ollama server'
    }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
