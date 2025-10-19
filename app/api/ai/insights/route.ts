import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/insights`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('AI insights proxy error:', error);
    return NextResponse.json(
      { 
        insights: ['Unable to load AI insights at this time'],
        score: null,
        recommendations: []
      },
      { status: 500 }
    );
  }
}
