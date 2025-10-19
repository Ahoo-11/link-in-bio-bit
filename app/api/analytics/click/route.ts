import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, buttonId } = await request.json();
    
    if (!username || !buttonId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user and current stats
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('id, stats')
      .eq('username', username.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Record click in analytics table
    const { error: analyticsError } = await supabase
      .from('linkinbio_analytics')
      .insert({
        username: username.toLowerCase(),
        event_type: 'click',
        button_id: buttonId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
        user_agent: request.headers.get('user-agent'),
      });

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError);
    }

    // Update user stats
    const currentStats = user.stats || { totalVisits: 0, totalClicks: 0, totalTips: 0, totalEarnings: 0 };
    const { error: statsError } = await supabase
      .from('linkinbio_users')
      .update({
        stats: {
          ...currentStats,
          totalClicks: (currentStats.totalClicks || 0) + 1,
        },
      })
      .eq('username', username.toLowerCase());

    if (statsError) {
      console.error('Stats update error:', statsError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { message: 'Failed to track click' },
      { status: 500 }
    );
  }
}
