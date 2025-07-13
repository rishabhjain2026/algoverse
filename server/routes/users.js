import express from 'express';
import User from '../models/User.js';
import UserStats from '../models/UserStats.js';
import CarbonActivity from '../models/CarbonActivity.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      period = 'all-time',
      category = 'overall'
    } = req.query;

    let matchQuery = {};
    
    // Add period filter
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchQuery['stats.lastUpdated'] = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchQuery['stats.lastUpdated'] = { $gte: monthAgo };
    }

    // Build aggregation pipeline
    const pipeline = [
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
        $match: matchQuery
      },
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          points: '$stats.points',
          totalSaved: '$stats.totalSaved',
          rank: '$stats.rank',
          tier: '$stats.tier',
          rankTitle: '$stats.rankTitle'
        }
      },
      {
        $sort: { points: -1, totalSaved: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: parseInt(limit)
      }
    ];

    // If category-specific ranking is requested
    if (category !== 'overall') {
      pipeline.unshift({
        $lookup: {
          from: 'carbonactivities',
          localField: '_id',
          foreignField: 'user',
          as: 'activities'
        }
      });
      
      pipeline.splice(1, 0, {
        $match: {
          'activities.category': category
        }
      });
    }

    const leaderboard = await User.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [
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
        $match: matchQuery
      },
      {
        $count: 'total'
      }
    ];

    if (category !== 'overall') {
      totalPipeline.unshift({
        $lookup: {
          from: 'carbonactivities',
          localField: '_id',
          foreignField: 'user',
          as: 'activities'
        }
      });
      
      totalPipeline.splice(1, 0, {
        $match: {
          'activities.category': category
        }
      });
    }

    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// @desc    Get user ranking
// @route   GET /api/users/ranking/:userId
// @access  Private
router.get('/ranking/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'all-time' } = req.query;

    // Get user stats
    const userStats = await UserStats.findOne({ user: userId })
      .populate('user', 'name email avatar');

    if (!userStats) {
      return res.status(404).json({
        success: false,
        message: 'User stats not found'
      });
    }

    // Get user's position in leaderboard
    const position = await UserStats.countDocuments({
      points: { $gt: userStats.points }
    });

    // Get nearby users (5 above and 5 below)
    const nearbyUsers = await UserStats.find({
      points: {
        $gte: userStats.points - 50,
        $lte: userStats.points + 50
      }
    })
    .sort({ points: -1 })
    .limit(11)
    .populate('user', 'name email avatar');

    res.json({
      success: true,
      data: {
        userStats,
        position: position + 1,
        nearbyUsers
      }
    });
  } catch (error) {
    console.error('Get user ranking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user ranking'
    });
  }
});

// @desc    Get community stats
// @route   GET /api/users/community-stats
// @access  Public
router.get('/community-stats', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Get total carbon saved
    const totalCarbonSaved = await UserStats.aggregate([
      {
        $group: {
          _id: null,
          totalSaved: { $sum: '$totalSaved' },
          totalEmitted: { $sum: '$totalEmitted' },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // Get tier distribution
    const tierDistribution = await UserStats.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent achievements
    const recentAchievements = await UserStats.aggregate([
      {
        $unwind: '$achievements'
      },
      {
        $sort: { 'achievements.earnedAt': -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          achievement: '$achievements',
          user: {
            name: '$user.name',
            email: '$user.email'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCarbonSaved: totalCarbonSaved[0]?.totalSaved || 0,
        totalCarbonEmitted: totalCarbonSaved[0]?.totalEmitted || 0,
        totalPoints: totalCarbonSaved[0]?.totalPoints || 0,
        tierDistribution,
        recentAchievements
      }
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community stats'
    });
  }
});

// @desc    Get user achievements
// @route   GET /api/users/achievements/:userId
// @access  Private
router.get('/achievements/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;

    const userStats = await UserStats.findOne({ user: userId })
      .populate('user', 'name email avatar');

    if (!userStats) {
      return res.status(404).json({
        success: false,
        message: 'User stats not found'
      });
    }

    // Define available achievements
    const availableAchievements = [
      {
        name: 'First Steps',
        description: 'Started your eco journey',
        icon: '🌱',
        condition: () => true
      },
      {
        name: 'Green Beginner',
        description: 'Earned 50+ points',
        icon: '⭐',
        condition: (stats) => stats.points >= 50
      },
      {
        name: 'Eco Warrior',
        description: 'Earned 100+ points',
        icon: '🛡️',
        condition: (stats) => stats.points >= 100
      },
      {
        name: 'Sustainability Expert',
        description: 'Earned 250+ points',
        icon: '🎓',
        condition: (stats) => stats.points >= 250
      },
      {
        name: 'Green Champion',
        description: 'Earned 500+ points',
        icon: '🏆',
        condition: (stats) => stats.points >= 500
      },
      {
        name: 'Eco Master',
        description: 'Earned 1000+ points',
        icon: '👑',
        condition: (stats) => stats.points >= 1000
      }
    ];

    // Check which achievements are earned
    const earnedAchievements = userStats.achievements || [];
    const availableToEarn = availableAchievements.filter(achievement => {
      const isEarned = earnedAchievements.some(earned => earned.name === achievement.name);
      return !isEarned && achievement.condition(userStats);
    });

    res.json({
      success: true,
      data: {
        userStats,
        earnedAchievements,
        availableToEarn
      }
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user achievements'
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

export default router; 