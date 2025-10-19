import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserIdFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { profile, buttons, style } = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // Verify authentication
    const userId = getUserIdFromRequest(authHeader);
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user data
    const { data: currentUser } = await supabase
      .from('linkinbio_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Build updates object
    const updates: any = {};

    if (profile) {
      if (profile.displayName) updates.display_name = profile.displayName;
      if (profile.bio !== undefined) updates.bio = profile.bio;
      if (profile.avatar !== undefined) updates.avatar = profile.avatar;
      if (profile.coverImage !== undefined) updates.cover_image = profile.coverImage;
    }

    if (buttons) {
      updates.buttons = buttons.map((btn: any, index: number) => ({
        ...btn,
        order: index,
      }));
    }

    if (style) {
      updates.style = { ...currentUser.style, ...style };
    }

    // Update user
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
