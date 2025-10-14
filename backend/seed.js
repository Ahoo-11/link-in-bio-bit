/**
 * Seed script for development data
 * Run with: node backend/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Tip = require('./models/Tip');
const Analytics = require('./models/Analytics');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linkchain';

// Sample data
const sampleUsers = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123!',
    displayName: 'John Doe',
    bio: 'Content creator and artist. Creating amazing content daily!',
    avatar: 'https://i.pravatar.cc/150?img=1',
    walletAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    buttons: [
      {
        id: '1',
        type: 'tip',
        title: 'Buy me a coffee ☕',
        amount: 5,
        style: { bgColor: '#8b5cf6', textColor: '#ffffff' },
        visible: true,
        order: 0,
      },
      {
        id: '2',
        type: 'tip',
        title: 'Support my work 💜',
        amount: 25,
        style: { bgColor: '#ec4899', textColor: '#ffffff' },
        visible: true,
        order: 1,
      },
      {
        id: '3',
        type: 'social',
        title: 'Instagram',
        url: 'https://instagram.com/johndoe',
        icon: 'instagram',
        style: { bgColor: '#f3f4f6', textColor: '#000000' },
        visible: true,
        order: 2,
      },
      {
        id: '4',
        type: 'social',
        title: 'Twitter',
        url: 'https://twitter.com/johndoe',
        icon: 'twitter',
        style: { bgColor: '#f3f4f6', textColor: '#000000' },
        visible: true,
        order: 3,
      },
      {
        id: '5',
        type: 'link',
        title: 'My Website',
        url: 'https://johndoe.com',
        style: { bgColor: '#f3f4f6', textColor: '#000000' },
        visible: true,
        order: 4,
      },
    ],
    style: {
      template: 'centered',
      colorScheme: 'purple',
      theme: 'light',
      font: 'inter',
      background: '#ffffff',
    },
  },
  {
    username: 'janeart',
    email: 'jane@example.com',
    password: 'Password123!',
    displayName: 'Jane Smith',
    bio: 'Digital artist | NFT creator | Coffee enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=5',
    walletAddress: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    buttons: [
      {
        id: '1',
        type: 'tip',
        title: 'Tip me $10',
        amount: 10,
        style: { bgColor: '#3b82f6', textColor: '#ffffff' },
        visible: true,
        order: 0,
      },
      {
        id: '2',
        type: 'link',
        title: 'My Portfolio',
        url: 'https://janesmith.art',
        style: { bgColor: '#10b981', textColor: '#ffffff' },
        visible: true,
        order: 1,
      },
    ],
    style: {
      template: 'centered',
      colorScheme: 'blue',
      theme: 'dark',
      font: 'inter',
      background: '#1f2937',
    },
  },
];

const sampleTips = [
  {
    creatorUsername: 'johndoe',
    senderAddress: 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
    amount: 5,
    message: 'Love your content! Keep it up!',
    anonymous: false,
    txId: '0x1234567890abcdef',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    creatorUsername: 'johndoe',
    senderAddress: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    amount: 25,
    message: 'Thank you for inspiring me!',
    anonymous: false,
    txId: '0xabcdef1234567890',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    creatorUsername: 'johndoe',
    senderAddress: 'anonymous',
    amount: 10,
    anonymous: true,
    txId: '0x9876543210fedcba',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    creatorUsername: 'janeart',
    senderAddress: 'ST3J8EVYHVKH6XXPD61EE8XEHW4Y2K83861225AB1',
    amount: 10,
    message: 'Amazing artwork!',
    anonymous: false,
    txId: '0xfedcba0987654321',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
  },
];

const sampleAnalytics = [
  // Visits for johndoe (last 7 days)
  ...Array.from({ length: 50 }, (_, i) => ({
    username: 'johndoe',
    eventType: 'visit',
    timestamp: new Date(Date.now() - i * 3600000), // Every hour
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })),
  // Clicks for johndoe
  ...Array.from({ length: 30 }, (_, i) => ({
    username: 'johndoe',
    eventType: 'click',
    buttonId: Math.random() > 0.5 ? '1' : '2',
    timestamp: new Date(Date.now() - i * 7200000), // Every 2 hours
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  })),
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Tip.deleteMany({});
    await Analytics.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      console.log(`   ✅ Created user: ${userData.username}`);
    }

    // Create tips
    console.log('💰 Creating tips...');
    for (const tipData of sampleTips) {
      const tip = new Tip(tipData);
      await tip.save();
      
      // Update user stats
      await User.findOneAndUpdate(
        { username: tipData.creatorUsername },
        { $inc: { 'stats.totalTips': 1 } }
      );
    }
    console.log(`   ✅ Created ${sampleTips.length} tips`);

    // Create analytics
    console.log('📊 Creating analytics...');
    await Analytics.insertMany(sampleAnalytics);
    
    // Update user visit stats
    await User.findOneAndUpdate(
      { username: 'johndoe' },
      { $set: { 'stats.totalVisits': 50, 'stats.totalClicks': 30 } }
    );
    console.log(`   ✅ Created ${sampleAnalytics.length} analytics events`);

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📝 Sample accounts created:');
    console.log('   Email: john@example.com');
    console.log('   Password: Password123!');
    console.log('   Profile: http://localhost:3000/johndoe\n');
    console.log('   Email: jane@example.com');
    console.log('   Password: Password123!');
    console.log('   Profile: http://localhost:3000/janeart\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
