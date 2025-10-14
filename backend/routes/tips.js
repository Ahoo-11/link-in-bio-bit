const express = require('express');
const router = express.Router();
const Tip = require('../models/Tip');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Record a new tip
router.post('/record', async (req, res) => {
  try {
    const { creatorUsername, amount, txId, message, anonymous } = req.body;

    if (!creatorUsername || !amount || !txId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if tip already recorded
    const existingTip = await Tip.findOne({ txId });
    if (existingTip) {
      return res.status(400).json({ message: 'Tip already recorded' });
    }

    // Create tip record
    const tip = new Tip({
      creatorUsername: creatorUsername.toLowerCase(),
      senderAddress: req.body.senderAddress || 'anonymous',
      amount,
      txId,
      message,
      anonymous: anonymous || false,
      status: 'pending',
    });

    await tip.save();

    // Update user stats
    await User.findOneAndUpdate(
      { username: creatorUsername.toLowerCase() },
      { $inc: { 'stats.totalTips': 1 } }
    );

    res.status(201).json({ message: 'Tip recorded successfully', tip });
  } catch (error) {
    console.error('Record tip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent tips for authenticated user
router.get('/recent', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tips = await Tip.find({ creatorUsername: user.username })
      .sort({ createdAt: -1 })
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
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !user.settings.showEarnings) {
      return res.json([]);
    }

    const tips = await Tip.find({ 
      creatorUsername: username.toLowerCase(),
      status: 'confirmed'
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-senderAddress');

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

    const tip = await Tip.findOneAndUpdate(
      { txId },
      { status },
      { new: true }
    );

    if (!tip) {
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
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tips = await Tip.find({ 
      creatorUsername: user.username,
      status: 'confirmed'
    });

    const totalEarnings = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const tipCount = tips.length;

    // Group by day for chart data
    const dailyEarnings = {};
    tips.forEach(tip => {
      const date = new Date(tip.createdAt).toISOString().split('T')[0];
      dailyEarnings[date] = (dailyEarnings[date] || 0) + tip.amount;
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
