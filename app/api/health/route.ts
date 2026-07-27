import { NextResponse } from 'next/server';

export async function GET() {
  const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://172.16.7.240:11434';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for ping

    // We can ping the root URL or /api/tags
    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok || response.status === 200) {
      return NextResponse.json({ status: 'connected', url: OLLAMA_BASE_URL });
    }
    
    return NextResponse.json({ 
      status: 'offline', 
      url: OLLAMA_BASE_URL,
      message: `Ollama returned status ${response.status}`
    }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'offline', 
      url: OLLAMA_BASE_URL,
      message: error.name === 'AbortError' ? 'Connection timed out' : error.message || 'Cannot reach server'
    }, { status: 503 });
  }
}
export const dynamic = 'force-dynamic';
