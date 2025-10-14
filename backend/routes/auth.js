const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, displayName, walletAddress } = req.body;

    // Validate input
    if (!username || !email || !displayName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      walletAddress: walletAddress || '',
      buttons: [
        {
          id: '1',
          type: 'tip',
          title: 'Support me - $5',
          amount: 5,
          style: { bgColor: '#8b5cf6', textColor: '#ffffff' },
          visible: true,
          order: 0,
        }
      ],
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use wallet login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wallet Login
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, username, displayName } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address required' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });

    if (!user && username && displayName) {
      // Create new user
      user = new User({
        username: username.toLowerCase(),
        email: `${username}@wallet.linkchain.app`,
        displayName,
        walletAddress,
      });
      await user.save();
    } else if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
