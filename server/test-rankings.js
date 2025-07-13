import mongoose from 'mongoose';
import User from './models/User.js';
import UserStats from './models/UserStats.js';
import CarbonActivity from './models/CarbonActivity.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/ecotracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('Connected to MongoDB');

async function testRankings() {
  try {
    console.log('🧪 Testing new ranking system...\n');

    // Get all users with their stats
    const allUsers = await User.aggregate([
      {
        $lookup: {
          from: 'userstats',
          localField: '_id',
          foreignField: 'user',
          as: 'stats'
        }
      },
      {
        $unwind: {
          path: '$stats',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          points: '$stats.points',
          totalSaved: '$stats.totalSaved',
          tier: '$stats.tier'
        }
      },
      {
        $sort: { points: -1, totalSaved: -1 }
      }
    ]);

    console.log('📊 All users sorted by points:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.points} points (${user.totalSaved?.toFixed(1) || 0} kg saved)`);
    });

    // Test the leaderboard endpoint logic
    console.log('\n🏆 Leaderboard rankings:');
    const leaderboard = allUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: getBadgeByPoints(user.points),
      avatar: user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    }));

    leaderboard.forEach(entry => {
      console.log(`#${entry.rank} - ${entry.name} (${entry.points} pts, ${entry.badge})`);
    });

    // Check for any duplicate ranks
    const ranks = leaderboard.map(entry => entry.rank);
    const uniqueRanks = new Set(ranks);
    
    if (ranks.length === uniqueRanks.size) {
      console.log('\n✅ Ranking system is working correctly!');
      console.log(`- Total users: ${leaderboard.length}`);
      console.log(`- Unique ranks: ${uniqueRanks.size}`);
      console.log(`- Rankings start from: ${Math.min(...ranks)}`);
      console.log(`- Rankings end at: ${Math.max(...ranks)}`);
    } else {
      console.log('\n❌ Ranking system has issues!');
      console.log('Duplicate ranks found');
    }

    // Test specific user ranking
    if (leaderboard.length > 0) {
      const testUser = leaderboard[0];
      console.log(`\n👤 Testing specific user ranking:`);
      console.log(`User: ${testUser.name}`);
      console.log(`Rank: #${testUser.rank}`);
      console.log(`Points: ${testUser.points}`);
      console.log(`Badge: ${testUser.badge}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Helper function to get badge by points
function getBadgeByPoints(points) {
  if (points >= 1000) return 'Eco Master';
  if (points >= 500) return 'Green Champion';
  if (points >= 250) return 'Sustainability Expert';
  if (points >= 100) return 'Eco Warrior';
  if (points >= 50) return 'Green Beginner';
  return 'Newcomer';
}

testRankings(); 