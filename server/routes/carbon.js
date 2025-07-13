import express from 'express';
import { body, validationResult } from 'express-validator';
import CarbonActivity from '../models/CarbonActivity.js';
import UserStats from '../models/UserStats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Emission factors (kg CO2e)
const emissionFactors = {
  transportation: {
    car: 0.2,
    bus: 0.05,
    train: 0.04,
    plane: 0.25,
    bike: 0,
    walk: 0
  },
  food: {
    beef: 13.3,
    chicken: 2.9,
    fish: 3.0,
    vegetables: 0.2,
    fruits: 0.3,
    dairy: 1.4,
    grains: 0.5
  },
  energy: {
    electricity: 0.5,
    naturalGas: 2.0,
    heating: 2.5
  },
  shopping: {
    clothing: 23.0,
    electronics: 400.0,
    furniture: 100.0,
    books: 2.5
  },
  waste: {
    general: 0.5,
    recyclable: 0.1,
    compost: 0.05
  }
};

// Calculate carbon amount
const calculateCarbonAmount = (category, type, amount) => {
  const categoryFactors = emissionFactors[category];
  if (!categoryFactors) return 0;
  
  const factor = categoryFactors[type] || 0;
  
  // For sustainable transportation choices, calculate savings compared to car
  if (category === 'transportation') {
    const carFactor = categoryFactors.car || 0.2; // Default car emission factor
    
    if (type === 'bike' || type === 'walk') {
      // These are carbon-free, so savings = what a car would have emitted
      return -(carFactor * amount);
    } else if (type === 'bus' || type === 'train') {
      // Calculate savings compared to car
      const carEmission = carFactor * amount;
      const publicEmission = factor * amount;
      return carEmission - publicEmission; // Positive if car is worse, negative if public transport is better
    }
  }
  
  // For waste recycling, calculate savings
  if (category === 'waste' && type === 'recyclable') {
    const generalWasteFactor = categoryFactors.general || 0.5;
    const recyclableFactor = factor;
    const savings = generalWasteFactor - recyclableFactor;
    return -(savings * amount); // Negative because it's a saving
  }
  
  if (category === 'waste' && type === 'compost') {
    const generalWasteFactor = categoryFactors.general || 0.5;
    const compostFactor = factor;
    const savings = generalWasteFactor - compostFactor;
    return -(savings * amount); // Negative because it's a saving
  }
  
  return factor * amount;
};

// Update user stats
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
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
};

// @desc    Add carbon activity
// @route   POST /api/carbon/activities
// @access  Private
router.post('/activities', protect, [
  body('category')
    .isIn(['transportation', 'food', 'energy', 'shopping', 'waste'])
    .withMessage('Invalid category'),
  body('type')
    .notEmpty()
    .withMessage('Activity type is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { category, type, amount, unit, notes, tags } = req.body;

    // Calculate carbon amount
    const carbonAmount = calculateCarbonAmount(category, type, amount);

    // Create activity
    const activity = await CarbonActivity.create({
      user: req.user._id,
      category,
      type,
      amount,
      unit,
      carbonAmount,
      notes,
      tags: tags || []
    });

    // Update user stats
    await updateUserStats(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: {
        activity
      }
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding activity'
    });
  }
});

// @desc    Get user activities
// @route   GET /api/carbon/activities
// @access  Private
router.get('/activities', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      startDate, 
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    
    if (category) {
      query.category = category;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const activities = await CarbonActivity.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    // Get total count
    const total = await CarbonActivity.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
});

// @desc    Get user stats
// @route   GET /api/carbon/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    // Get user stats
    let userStats = await UserStats.findOne({ user: req.user._id });
    
    if (!userStats) {
      userStats = await UserStats.create({
        user: req.user._id,
        totalEmitted: 0,
        totalSaved: 0,
        netFootprint: 0,
        points: 0,
        rank: 6,
        tier: 'Bronze'
      });
    }

    // Get period-specific data
    let periodQuery = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      periodQuery.date = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      periodQuery.date = { $gte: monthAgo };
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      periodQuery.date = { $gte: yearAgo };
    }

    // Get category breakdown for emissions (positive values)
    const emissionsBreakdown = await CarbonActivity.aggregate([
      { $match: { user: req.user._id, carbonAmount: { $gt: 0 }, ...periodQuery } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$carbonAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get category breakdown for savings (negative values)
    const savingsBreakdown = await CarbonActivity.aggregate([
      { $match: { user: req.user._id, carbonAmount: { $lt: 0 }, ...periodQuery } },
      {
        $group: {
          _id: '$category',
          total: { $sum: { $abs: '$carbonAmount' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Keep the original category breakdown for backward compatibility
    const categoryBreakdown = await CarbonActivity.aggregate([
      { $match: { user: req.user._id, ...periodQuery } },
      {
        $group: {
          _id: '$category',
          total: { $sum: { $abs: '$carbonAmount' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get recent activities
    const recentActivities = await CarbonActivity.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: userStats,
        categoryBreakdown,
        emissionsBreakdown,
        savingsBreakdown,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
});

// @desc    Delete activity
// @route   DELETE /api/carbon/activities/:id
// @access  Private
router.delete('/activities/:id', protect, async (req, res) => {
  try {
    const activity = await CarbonActivity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.deleteOne();

    // Update user stats
    await updateUserStats(req.user._id);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting activity'
    });
  }
});

// @desc    Get emission factors
// @route   GET /api/carbon/emission-factors
// @access  Public
router.get('/emission-factors', (req, res) => {
  res.json({
    success: true,
    data: {
      emissionFactors
    }
  });
});

export default router; 