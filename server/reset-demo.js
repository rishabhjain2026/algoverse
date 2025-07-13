import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import UserStats from './models/UserStats.js';
import CarbonActivity from './models/CarbonActivity.js';

// Load environment variables
dotenv.config({ path: './config.env' });

async function resetDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing demo user and all related data
    const demoUser = await User.findOne({ email: 'demo@ecotracker.com' });
    
    if (demoUser) {
      // Delete all activities for demo user
      await CarbonActivity.deleteMany({ user: demoUser._id });
      console.log('✅ Deleted existing demo activities');
      
      // Delete user stats
      await UserStats.deleteOne({ user: demoUser._id });
      console.log('✅ Deleted existing demo user stats');
      
      // Delete demo user
      await User.deleteOne({ _id: demoUser._id });
      console.log('✅ Deleted existing demo user');
    }

    // Create new demo user
    const newDemoUser = await User.create({
      name: 'Demo User',
      email: 'demo@ecotracker.com',
      password: 'demo123'
    });

    console.log('✅ New demo user created:', newDemoUser.email);

    // Create demo user stats
    await UserStats.create({
      user: newDemoUser._id,
      totalEmitted: 0,
      totalSaved: 0,
      netFootprint: 0,
      points: 0,
      rank: 6,
      tier: 'Bronze'
    });

    console.log('✅ Demo user stats created');

    // Add sample activities with proper savings calculations
    const sampleActivities = [
      {
        user: newDemoUser._id,
        category: 'transportation',
        type: 'bike',
        amount: 10,
        unit: 'km',
        carbonAmount: -2.0, // Savings: 10km * 0.2 (car factor) = -2.0 kg CO2 saved
        notes: 'Daily commute to work',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: newDemoUser._id,
        category: 'transportation',
        type: 'bus',
        amount: 15,
        unit: 'km',
        carbonAmount: -2.25, // Savings: (15km * 0.2) - (15km * 0.05) = 3.0 - 0.75 = 2.25 kg CO2 saved
        notes: 'Trip to grocery store',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user: newDemoUser._id,
        category: 'transportation',
        type: 'walk',
        amount: 3,
        unit: 'km',
        carbonAmount: -0.6, // Savings: 3km * 0.2 (car factor) = -0.6 kg CO2 saved
        notes: 'Short walk to nearby store',
        date: new Date()
      },
      {
        user: newDemoUser._id,
        category: 'food',
        type: 'vegetables',
        amount: 2,
        unit: 'kg',
        carbonAmount: 0.4, // Low carbon footprint
        notes: 'Local organic vegetables',
        date: new Date()
      },
      {
        user: newDemoUser._id,
        category: 'energy',
        type: 'electricity',
        amount: 5,
        unit: 'kWh',
        carbonAmount: 2.5,
        notes: 'Home electricity usage',
        date: new Date()
      },
      {
        user: newDemoUser._id,
        category: 'waste',
        type: 'recyclable',
        amount: 2,
        unit: 'kg',
        carbonAmount: -0.8, // Savings: (2kg * 0.5) - (2kg * 0.1) = 1.0 - 0.2 = 0.8 kg CO2 saved
        notes: 'Recycled paper and plastic',
        date: new Date()
      }
    ];

    await CarbonActivity.insertMany(sampleActivities);
    console.log('✅ Sample activities created with proper savings calculations');

    // Calculate and update user stats
    const stats = await CarbonActivity.aggregate([
      { $match: { user: newDemoUser._id } },
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
      { user: newDemoUser._id },
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
    console.log(`💰 Total Emitted: ${result.totalEmitted.toFixed(1)} kg CO2`);
    console.log(`🌱 Total Saved: ${result.totalSaved.toFixed(1)} kg CO2`);
    console.log(`📈 Net Footprint: ${netFootprint.toFixed(1)} kg CO2`);

    console.log('🎉 Demo reset completed successfully!');
    console.log('You can now login with:');
    console.log('Email: demo@ecotracker.com');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Reset error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetDemo(); 