import mongoose from 'mongoose';
import User from './models/User.js';
import UserStats from './models/UserStats.js';
import CarbonActivity from './models/CarbonActivity.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Update user stats function (same as in routes/carbon.js)
const updateUserStats = async (userId) => {
  try {
    // Aggregate carbon activities
    const stats = await CarbonActivity.aggregate([
      { $match: { user: userId } },
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

    // Calculate tier
    let tier = 'Bronze';
    if (points >= 1000) tier = 'Diamond';
    else if (points >= 500) tier = 'Platinum';
    else if (points >= 250) tier = 'Gold';
    else if (points >= 100) tier = 'Silver';

    // Update or create user stats
    await UserStats.findOneAndUpdate(
      { user: userId },
      {
        totalEmitted: result.totalEmitted,
        totalSaved: result.totalSaved,
        netFootprint,
        points,
        rank,
        tier,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return { points, rank, tier, totalSaved: result.totalSaved };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
};

async function fixAllUserStats() {
  try {
    console.log('🔧 Fixing all user stats...\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to update\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`🔄 Updating stats for ${user.name} (${user.email})...`);
        
        const result = await updateUserStats(user._id);
        
        if (result) {
          console.log(`✅ ${user.name}: ${result.points} points, Rank ${result.rank} (${result.tier}), ${result.totalSaved.toFixed(1)} kg saved`);
          updatedCount++;
        } else {
          console.log(`❌ Failed to update ${user.name}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`🎯 Total users processed: ${users.length}`);

    // Show final stats
    console.log('\n🏆 Final user rankings:');
    const allUserStats = await UserStats.find({})
      .populate('user', 'name email')
      .sort({ points: -1, totalSaved: -1 });

    allUserStats.forEach((stats, index) => {
      console.log(`${index + 1}. ${stats.user.name} - ${stats.points} points, Rank ${stats.rank} (${stats.tier})`);
    });

    console.log('\n🎉 User stats fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
fixAllUserStats(); 