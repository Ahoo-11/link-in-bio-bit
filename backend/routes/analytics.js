const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Track a visit
router.post('/visit', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username required' });
    }

    await supabase
      .from('linkinbio_analytics')
      .insert({
        username: username.toLowerCase(),
        event_type: 'visit',
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });

    // Update user stats
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('stats')
      .eq('username', username.toLowerCase())
      .single();

    if (user) {
      await supabase
        .from('linkinbio_users')
        .update({ stats: { ...user.stats, totalVisits: (user.stats.totalVisits || 0) + 1 } })
        .eq('username', username.toLowerCase());
    }

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

    await supabase
      .from('linkinbio_analytics')
      .insert({
        username: username.toLowerCase(),
        event_type: 'click',
        button_id: buttonId,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });

    // Update user stats
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('stats')
      .eq('username', username.toLowerCase())
      .single();

    if (user) {
      await supabase
        .from('linkinbio_users')
        .update({ stats: { ...user.stats, totalClicks: (user.stats.totalClicks || 0) + 1 } })
        .eq('username', username.toLowerCase());
    }

    res.status(201).json({ message: 'Click tracked' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics for authenticated user
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('username')
      .eq('id', req.userId)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { startDate, endDate } = req.query;
    let analyticsQuery = supabase
      .from('linkinbio_analytics')
      .select('*')
      .eq('username', user.username);

    if (startDate) {
      analyticsQuery = analyticsQuery.gte('timestamp', startDate);
    }
    if (endDate) {
      analyticsQuery = analyticsQuery.lte('timestamp', endDate);
    }

    const { data: allEvents } = await analyticsQuery;

    // Get event counts
    const visits = (allEvents || []).filter(e => e.event_type === 'visit').length;
    const clicks = (allEvents || []).filter(e => e.event_type === 'click').length;

    // Get daily breakdown
    const dailyStatsMap = {};
    (allEvents || []).forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      const key = `${date}-${event.event_type}`;
      dailyStatsMap[key] = (dailyStatsMap[key] || 0) + 1;
    });

    const dailyStats = Object.entries(dailyStatsMap).map(([key, count]) => {
      const [date, eventType] = key.split('-');
      return { _id: { date, eventType }, count };
    }).sort((a, b) => a._id.date.localeCompare(b._id.date));

    // Button click breakdown
    const buttonStatsMap = {};
    (allEvents || []).filter(e => e.event_type === 'click').forEach(event => {
      buttonStatsMap[event.button_id] = (buttonStatsMap[event.button_id] || 0) + 1;
    });

    const buttonStats = Object.entries(buttonStatsMap).map(([buttonId, clicks]) => ({
      _id: buttonId,
      clicks
    })).sort((a, b) => b.clicks - a.clicks);

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
