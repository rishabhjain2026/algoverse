import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import UserStats from './models/UserStats.js';
import CarbonActivity from './models/CarbonActivity.js';

// Load environment variables
dotenv.config({ path: './config.env' });

async function setupDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@ecotracker.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@ecotracker.com',
      password: 'demo123'
    });

    console.log('✅ Demo user created:', demoUser.email);

    // Create demo user stats
    await UserStats.create({
      user: demoUser._id,
      totalEmitted: 0,
      totalSaved: 0,
      netFootprint: 0,
      points: 0,
      rank: 6,
      tier: 'Bronze'
    });

    console.log('✅ Demo user stats created');

    // Add some sample activities for the demo user
    const sampleActivities = [
      {
        user: demoUser._id,
        category: 'transportation',
        type: 'bike',
        amount: 10,
        unit: 'km',
        carbonAmount: 0, // Bike is carbon-free
        notes: 'Daily commute to work',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: demoUser._id,
        category: 'transportation',
        type: 'bike',
        amount: 8,
        unit: 'km',
        carbonAmount: 0,
        notes: 'Trip to grocery store',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user: demoUser._id,
        category: 'food',
        type: 'vegetables',
        amount: 2,
        unit: 'kg',
        carbonAmount: 0.4, // Low carbon footprint
        notes: 'Local organic vegetables',
        date: new Date()
      },
      {
        user: demoUser._id,
        category: 'energy',
        type: 'electricity',
        amount: 5,
        unit: 'kWh',
        carbonAmount: 2.5,
        notes: 'Home electricity usage',
        date: new Date()
      },
      {
        user: demoUser._id,
        category: 'waste',
        type: 'recyclable',
        amount: 1,
        unit: 'kg',
        carbonAmount: -0.1, // Negative because recycling saves carbon
        notes: 'Recycled paper and plastic',
        date: new Date()
      }
    ];

    await CarbonActivity.insertMany(sampleActivities);
    console.log('✅ Sample activities created');

    // Update user stats with the new activities
    const stats = await CarbonActivity.aggregate([
      { $match: { user: demoUser._id } },
      {
        $group: {
          _id: null,
          totalEmitted: {
            $sum: {
              $cond: [
                { $gt: ['$carbonAmount', 0] },
                '$carbonAmount',
                0
              ]
            }
          },
          totalSaved: {
            $sum: {
              $cond: [
                { $lt: ['$carbonAmount', 0] },
                { $abs: '$carbonAmount' },
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || { totalEmitted: 0, totalSaved: 0 };
    const netFootprint = result.totalEmitted - result.totalSaved;
    const points = Math.floor(result.totalSaved * 10);

    // Calculate rank
    let rank = 6;
    if (points >= 1000) rank = 1;
    else if (points >= 500) rank = 2;
    else if (points >= 250) rank = 3;
    else if (points >= 100) rank = 4;
    else if (points >= 50) rank = 5;

    // Update user stats
    await UserStats.findOneAndUpdate(
      { user: demoUser._id },
      {
        totalEmitted: result.totalEmitted,
        totalSaved: result.totalSaved,
        netFootprint,
        points,
        rank,
        tier: points >= 100 ? 'Silver' : 'Bronze',
        lastUpdated: new Date()
      }
    );

    console.log('✅ Demo user stats updated with activities');
    console.log(`📊 Demo user stats: ${points} points, Rank ${rank}`);

    console.log('🎉 Demo setup completed successfully!');
    console.log('You can now login with:');
    console.log('Email: demo@ecotracker.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupDemo(); 