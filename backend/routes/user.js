const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .select('id, username, email, display_name, bio, avatar, cover_image, wallet_address, buttons, style, settings, stats, created_at, updated_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, bio, avatar, coverImage, walletAddress } = req.body;

    const updates = {};
    if (displayName) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (coverImage !== undefined) updates.cover_image = coverImage;
    if (walletAddress !== undefined) updates.wallet_address = walletAddress;

    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { emailNotifications, showEarnings, requireMessage } = req.body;

    // Get current user to merge settings
    const { data: currentUser } = await supabase
      .from('linkinbio_users')
      .select('settings')
      .eq('id', req.userId)
      .single();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedSettings = { ...currentUser.settings };
    if (emailNotifications !== undefined) updatedSettings.emailNotifications = emailNotifications;
    if (showEarnings !== undefined) updatedSettings.showEarnings = showEarnings;
    if (requireMessage !== undefined) updatedSettings.requireMessage = requireMessage;

    const { error } = await supabase
      .from('linkinbio_users')
      .update({ settings: updatedSettings })
      .eq('id', req.userId);

    if (error) throw error;

    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
