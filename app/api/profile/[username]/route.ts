import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .select('id, username, display_name, bio, avatar, cover_image, wallet_address, buttons, style, stats, created_at')
      .eq('username', username.toLowerCase())
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for frontend consistency
    const profile = {
      username: user.username,
      displayName: user.display_name,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.cover_image,
      walletAddress: user.wallet_address,
      buttons: user.buttons || [],
      style: user.style || {},
      stats: user.stats || {},
      createdAt: user.created_at,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
