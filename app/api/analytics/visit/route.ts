import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { message: 'Username is required' },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Record visit
    const { error } = await supabase
      .from('linkinbio_analytics')
      .insert({
        username: username.toLowerCase(),
        event_type: 'visit',
        metadata: {
          timestamp: new Date().toISOString(),
        },
        user_agent: request.headers.get('user-agent'),
      });

    if (error) {
      console.error('Analytics insert error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics visit error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
