import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { creatorUsername, amount, txId, message, anonymous } = await request.json();
    
    if (!creatorUsername || !amount || !txId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get creator username to verify they exist
    const { data: creator } = await supabase
      .from('linkinbio_users')
      .select('username, wallet_address')
      .eq('username', creatorUsername.toLowerCase())
      .single();

    if (!creator) {
      return NextResponse.json(
        { message: 'Creator not found' },
        { status: 404 }
      );
    }

    // Record tip
    const { data: tip, error } = await supabase
      .from('linkinbio_tips')
      .insert({
        creator_username: creatorUsername.toLowerCase(),
        sender_address: creator.wallet_address,
        amount: parseFloat(amount),
        tx_id: txId,
        message: message || null,
        anonymous: anonymous || false,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) {
      console.error('Tip insert error:', error);
      return NextResponse.json(
        { message: 'Failed to record tip' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tip });
  } catch (error) {
    console.error('Tips record error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
