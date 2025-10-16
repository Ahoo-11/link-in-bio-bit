const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Record a new tip
router.post('/record', async (req, res) => {
  try {
    const { creatorUsername, amount, txId, message, anonymous } = req.body;

    if (!creatorUsername || !amount || !txId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if tip already recorded
    const { data: existingTip } = await supabase
      .from('linkinbio_tips')
      .select('id')
      .eq('tx_id', txId)
      .single();

    if (existingTip) {
      return res.status(400).json({ message: 'Tip already recorded' });
    }

    // Create tip record
    const { data: tip, error } = await supabase
      .from('linkinbio_tips')
      .insert({
        creator_username: creatorUsername.toLowerCase(),
        sender_address: req.body.senderAddress || 'anonymous',
        amount,
        tx_id: txId,
        message,
        anonymous: anonymous || false,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Update user stats
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('stats')
      .eq('username', creatorUsername.toLowerCase())
      .single();

    if (user) {
      await supabase
        .from('linkinbio_users')
        .update({ stats: { ...user.stats, totalTips: (user.stats.totalTips || 0) + 1 } })
        .eq('username', creatorUsername.toLowerCase());
    }

    res.status(201).json({ message: 'Tip recorded successfully', tip });
  } catch (error) {
    console.error('Record tip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent tips for authenticated user
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('username')
      .eq('id', req.userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: tips } = await supabase
      .from('linkinbio_tips')
      .select('*')
      .eq('creator_username', user.username)
      .order('created_at', { ascending: false })
      .limit(50);

    res.json(tips);
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tips by username (public, respects privacy settings)
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('settings')
      .eq('username', username.toLowerCase())
      .single();

    if (!user || !user.settings.showEarnings) {
      return res.json([]);
    }

    const { data: tips } = await supabase
      .from('linkinbio_tips')
      .select('id, creator_username, amount, message, anonymous, tx_id, status, created_at')
      .eq('creator_username', username.toLowerCase())
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(20);

    res.json(tips);
  } catch (error) {
    console.error('Get user tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tip status (for blockchain confirmation)
router.put('/:txId/status', async (req, res) => {
  try {
    const { txId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const { data: tip, error } = await supabase
      .from('linkinbio_tips')
      .update({ status })
      .eq('tx_id', txId)
      .select()
      .single();

    if (error || !tip) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    res.json({ message: 'Tip status updated', tip });
  } catch (error) {
    console.error('Update tip status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tip statistics for authenticated user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('username')
      .eq('id', req.userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: tips } = await supabase
      .from('linkinbio_tips')
      .select('*')
      .eq('creator_username', user.username)
      .eq('status', 'confirmed');

    const totalEarnings = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const tipCount = tips.length;

    // Group by day for chart data
    const dailyEarnings = {};
    (tips || []).forEach(tip => {
      const date = new Date(tip.created_at).toISOString().split('T')[0];
      dailyEarnings[date] = (dailyEarnings[date] || 0) + parseFloat(tip.amount);
    });

    res.json({
      totalEarnings,
      tipCount,
      averageTip: tipCount > 0 ? totalEarnings / tipCount : 0,
      dailyEarnings,
    });
  } catch (error) {
    console.error('Get tip stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
