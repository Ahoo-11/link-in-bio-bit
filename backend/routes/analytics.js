const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Track a visit
router.post('/visit', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username required' });
    }

    const analytics = new Analytics({
      username: username.toLowerCase(),
      eventType: 'visit',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await analytics.save();

    // Update user stats
    await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $inc: { 'stats.totalVisits': 1 } }
    );

    res.status(201).json({ message: 'Visit tracked' });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track a button click
router.post('/click', async (req, res) => {
  try {
    const { username, buttonId } = req.body;

    if (!username || !buttonId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const analytics = new Analytics({
      username: username.toLowerCase(),
      eventType: 'click',
      buttonId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await analytics.save();

    // Update user stats
    await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $inc: { 'stats.totalClicks': 1 } }
    );

    res.status(201).json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics for authenticated user
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { startDate, endDate } = req.query;
    const query = { username: user.username };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get event counts
    const visits = await Analytics.countDocuments({ ...query, eventType: 'visit' });
    const clicks = await Analytics.countDocuments({ ...query, eventType: 'click' });

    // Get daily breakdown
    const dailyStats = await Analytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            eventType: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Button click breakdown
    const buttonStats = await Analytics.aggregate([
      { $match: { ...query, eventType: 'click' } },
      {
        $group: {
          _id: '$buttonId',
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
    ]);

    res.json({
      visits,
      clicks,
      conversionRate: visits > 0 ? ((clicks / visits) * 100).toFixed(2) : 0,
      dailyStats,
      buttonStats,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
