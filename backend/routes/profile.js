const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .select('id, username, display_name, bio, avatar, cover_image, wallet_address, buttons, style, stats, created_at')
      .eq('username', username.toLowerCase())
      .single();
    
    if (error || !user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile customization (buttons, style)
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { profile, buttons, style } = req.body;

    const { data: currentUser } = await supabase
      .from('linkinbio_users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};

    // Update profile info
    if (profile) {
      if (profile.displayName) updates.display_name = profile.displayName;
      if (profile.bio !== undefined) updates.bio = profile.bio;
      if (profile.avatar !== undefined) updates.avatar = profile.avatar;
      if (profile.coverImage !== undefined) updates.cover_image = profile.coverImage;
      if (profile.walletAddress !== undefined) updates.wallet_address = profile.walletAddress;
    }

    // Update buttons
    if (buttons) {
      updates.buttons = buttons.map((btn, index) => ({
        ...btn,
        order: index,
      }));
    }

    // Update style
    if (style) {
      updates.style = { ...currentUser.style, ...style };
    }

    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check username availability
router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { data: user } = await supabase
      .from('linkinbio_users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
    
    res.json({ available: !user });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
