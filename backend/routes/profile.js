const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -email -settings');
    
    if (!user) {
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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile info
    if (profile) {
      if (profile.displayName) user.displayName = profile.displayName;
      if (profile.bio !== undefined) user.bio = profile.bio;
      if (profile.avatar !== undefined) user.avatar = profile.avatar;
      if (profile.coverImage !== undefined) user.coverImage = profile.coverImage;
    }

    // Update buttons
    if (buttons) {
      user.buttons = buttons.map((btn, index) => ({
        ...btn,
        order: index,
      }));
    }

    // Update style
    if (style) {
      user.style = { ...user.style, ...style };
    }

    await user.save();

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
    const user = await User.findOne({ username: username.toLowerCase() });
    
    res.json({ available: !user });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
