const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, displayName, walletAddress } = req.body;

    // Validate input - email optional if wallet provided
    if (!username || !displayName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (!email && !walletAddress) {
      return res.status(400).json({ message: 'Either email or wallet address is required' });
    }

    // Check if user exists
    let query = `username.eq.${username.toLowerCase()}`;
    if (email) {
      query += `,email.eq.${email.toLowerCase()}`;
    }
    
    const { data: existingUser } = await supabase
      .from('linkinbio_users')
      .select('*')
      .or(query)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .insert({
        username: username.toLowerCase(),
        email: email ? email.toLowerCase() : null,
        password: hashedPassword,
        display_name: displayName,
        wallet_address: walletAddress || '',
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
      })
      .select()
      .single();

    if (error) throw error;

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
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
    const { data: user, error } = await supabase
      .from('linkinbio_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
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
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
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
    let { data: user } = await supabase
      .from('linkinbio_users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (!user && username && displayName) {
      // Create new user (wallet-only, no email required)
      const { data: newUser, error } = await supabase
        .from('linkinbio_users')
        .insert({
          username: username.toLowerCase(),
          display_name: displayName,
          wallet_address: walletAddress,
          email: null, // Wallet users don't need email
        })
        .select()
        .single();

      if (error) throw error;
      user = newUser;
    } else if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        walletAddress: user.wallet_address,
      },
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
