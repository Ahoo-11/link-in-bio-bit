/**
 * Seed script for development data (Supabase version)
 * Run with: node backend/seed-supabase.js
 */

const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const supabase = require('./db');

// Sample data
const sampleUsers = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123!',
    display_name: 'John Doe',
    bio: 'Content creator and artist. Creating amazing content daily!',
    avatar: 'https://i.pravatar.cc/150?img=1',
    wallet_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
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
    display_name: 'Jane Smith',
    bio: 'Digital artist | NFT creator | Coffee enthusiast',
    avatar: 'https://i.pravatar.cc/150?img=5',
    wallet_address: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
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
    creator_username: 'johndoe',
    sender_address: 'ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ',
    amount: 5,
    message: 'Love your content! Keep it up!',
    anonymous: false,
    tx_id: '0x1234567890abcdef',
    status: 'confirmed',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    creator_username: 'johndoe',
    sender_address: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
    amount: 25,
    message: 'Thank you for inspiring me!',
    anonymous: false,
    tx_id: '0xabcdef1234567890',
    status: 'confirmed',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    creator_username: 'johndoe',
    sender_address: 'anonymous',
    amount: 10,
    anonymous: true,
    tx_id: '0x9876543210fedcba',
    status: 'confirmed',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    creator_username: 'janeart',
    sender_address: 'ST3J8EVYHVKH6XXPD61EE8XEHW4Y2K83861225AB1',
    amount: 10,
    message: 'Amazing artwork!',
    anonymous: false,
    tx_id: '0xfedcba0987654321',
    status: 'confirmed',
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  },
];

const sampleAnalytics = [
  // Visits for johndoe (last 50 hours)
  ...Array.from({ length: 50 }, (_, i) => ({
    username: 'johndoe',
    event_type: 'visit',
    timestamp: new Date(Date.now() - i * 3600000).toISOString(), // Every hour
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })),
  // Clicks for johndoe
  ...Array.from({ length: 30 }, (_, i) => ({
    username: 'johndoe',
    event_type: 'click',
    button_id: Math.random() > 0.5 ? '1' : '2',
    timestamp: new Date(Date.now() - i * 7200000).toISOString(), // Every 2 hours
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  })),
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    console.log('✅ Connected to Supabase');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await supabase.from('linkinbio_analytics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('linkinbio_tips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('linkinbio_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const { password, ...userDataWithoutPassword } = userData;
      
      const { data, error } = await supabase
        .from('linkinbio_users')
        .insert({
          ...userDataWithoutPassword,
          password: hashedPassword,
          stats: { totalVisits: 0, totalClicks: 0, totalTips: 0 }
        })
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Error creating user ${userData.username}:`, error);
      } else {
        console.log(`   ✅ Created user: ${userData.username}`);
      }
    }

    // Create tips
    console.log('💰 Creating tips...');
    for (const tipData of sampleTips) {
      const { error } = await supabase
        .from('linkinbio_tips')
        .insert(tipData);

      if (error) {
        console.error(`   ❌ Error creating tip:`, error);
      }
      
      // Update user stats
      const { data: user } = await supabase
        .from('linkinbio_users')
        .select('stats')
        .eq('username', tipData.creator_username)
        .single();

      if (user) {
        await supabase
          .from('linkinbio_users')
          .update({ 
            stats: { 
              ...user.stats, 
              totalTips: (user.stats.totalTips || 0) + 1 
            } 
          })
          .eq('username', tipData.creator_username);
      }
    }
    console.log(`   ✅ Created ${sampleTips.length} tips`);

    // Create analytics
    console.log('📊 Creating analytics...');
    const { error: analyticsError } = await supabase
      .from('linkinbio_analytics')
      .insert(sampleAnalytics);

    if (analyticsError) {
      console.error('   ❌ Error creating analytics:', analyticsError);
    } else {
      // Update user visit stats
      const { data: johnUser } = await supabase
        .from('linkinbio_users')
        .select('stats')
        .eq('username', 'johndoe')
        .single();

      if (johnUser) {
        await supabase
          .from('linkinbio_users')
          .update({ 
            stats: { 
              ...johnUser.stats,
              totalVisits: 50, 
              totalClicks: 30 
            } 
          })
          .eq('username', 'johndoe');
      }
      console.log(`   ✅ Created ${sampleAnalytics.length} analytics events`);
    }

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
