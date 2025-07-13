# 🌱 EcoTracker - Personal Carbon Footprint Tracker

A comprehensive web application that helps individuals track, understand, and reduce their carbon footprint through daily activities. Earn rewards, compete with friends, and make a real difference for our planet.

## ✨ Features

### 🔐 Authentication System
- **Sign Up/Sign In**: Secure user authentication with email and password
- **JWT Token Authentication**: Secure session management
- **User Profiles**: Personalized experience with user data
- **Password Hashing**: Secure password storage with bcrypt

### 📊 Carbon Footprint Calculator
- **Multiple Categories**: Transportation, Food, Energy, Shopping, Waste
- **Real-time Calculations**: Instant carbon impact assessment
- **Emission Factors**: Scientifically-based calculations for accurate results
- **Activity Tracking**: Log daily activities and see their environmental impact

### 📈 Dashboard & Analytics
- **Visual Charts**: Line charts and pie charts for data visualization
- **Real-time Stats**: Total emitted, saved, and net carbon footprint
- **Progress Tracking**: Weekly, monthly, and yearly progress views
- **Recent Activities**: Quick overview of latest entries

### 🏆 Ranking System
- **Leaderboards**: Compete with other eco-conscious individuals
- **Achievement Badges**: Earn badges based on your sustainability level
- **Progress Milestones**: Track your journey to higher ranks
- **Community Impact**: See collective environmental impact

### 🎁 Rewards & Cashback System
- **Points System**: Earn points for sustainable choices
- **Cashback Tiers**: Bronze, Silver, Gold, Platinum, Diamond levels
- **Redeemable Rewards**: Coffee vouchers, store credits, tree planting
- **Tier Benefits**: Higher cashback rates for dedicated users

### 💡 Motivational Features
- **Carbon Facts**: Educational facts that change daily
- **Quick Tips**: Personalized suggestions for reducing footprint
- **Progress Celebrations**: Milestone achievements and celebrations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carbon-footprint-tracker
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database named `carbon-tracker`

5. **Configure environment variables**
   ```bash
   cd server
   # Edit config.env file with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/carbon-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

6. **Set up demo user**
   ```bash
   cd server
   node setup-demo.js
   ```

7. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

8. **Start the frontend development server**
   ```bash
   # In a new terminal
   npm run dev
   ```

9. **Open your browser**
   Navigate to: **http://localhost:3000** (or 3001 if 3000 is in use)

### Demo Account
- **Email**: demo@ecotracker.com
- **Password**: demo123

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** with custom design system
- **Zustand** with persistence for state management
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Router DOM** for routing

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📱 Features Overview

### Landing Page
- **Motivational Carbon Facts**: Rotating facts about environmental impact
- **Feature Showcase**: Highlighting key app capabilities
- **Call-to-Action**: Easy sign-up process

### Dashboard
- **Carbon Overview**: Total emissions, savings, and net footprint
- **Interactive Charts**: Weekly progress and category breakdown
- **Recent Activities**: Latest logged activities
- **Quick Actions**: Add new activities directly

### Calculator
- **Category Selection**: Transportation, Food, Energy, Shopping, Waste
- **Activity Types**: Specific options for each category
- **Real-time Calculation**: Instant carbon impact assessment
- **Tips & Guidance**: Educational content for each category

### Rankings
- **Leaderboard**: Top eco warriors and their achievements
- **User Ranking**: Your position and progress
- **Achievement System**: Badges and milestones
- **Community Stats**: Collective impact metrics

### Rewards
- **Points System**: Earn points for sustainable choices
- **Cashback Tiers**: Multiple reward levels
- **Redeemable Items**: Various reward options
- **Progress Tracking**: Journey to next tier

## 🎨 Design System

### Color Palette
- **Primary**: Green shades (#22c55e, #16a34a)
- **Eco**: Teal shades (#10b981, #059669)
- **Carbon**: Gray shades (#64748b, #475569)
- **Accent**: Various colors for different categories

### Components
- **Cards**: Consistent card design with shadows
- **Buttons**: Primary and secondary button styles
- **Forms**: Styled input fields with validation
- **Charts**: Responsive chart components

## 📊 Carbon Calculation Methodology

### Emission Factors (kg CO2e)
- **Transportation**: Car (0.2/km), Bus (0.05/km), Train (0.04/km)
- **Food**: Beef (13.3/kg), Chicken (2.9/kg), Vegetables (0.2/kg)
- **Energy**: Electricity (0.5/kWh), Natural Gas (2.0/m³)
- **Shopping**: Clothing (23.0/item), Electronics (400.0/item)
- **Waste**: General (0.5/kg), Recyclable (0.1/kg)

### Points System
- **10 points per kg CO2 saved**
- **Tier-based cashback rates** (0.5% - 3.0%)
- **Achievement milestones** at 50, 100, 250, 500, 1000 points

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Carbon Activities
- `POST /api/carbon/activities` - Add new activity
- `GET /api/carbon/activities` - Get user activities
- `GET /api/carbon/stats` - Get user statistics
- `DELETE /api/carbon/activities/:id` - Delete activity

### Users & Rankings
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/ranking/:userId` - Get user ranking
- `GET /api/users/community-stats` - Get community statistics

## 🔧 Customization

### Adding New Categories
1. Update `emissionFactors` in `server/routes/carbon.js`
2. Add category options in `src/components/Calculator.jsx`
3. Update category icons and colors

### Modifying Rewards
1. Edit `availableRewards` array in `src/components/Rewards.jsx`
2. Update cashback tiers as needed
3. Customize reward values and requirements

### Styling Changes
1. Modify Tailwind config in `tailwind.config.js`
2. Update component styles in respective files
3. Customize color palette and design tokens

## 🌟 Future Enhancements

- **Social Features**: Friend connections and challenges
- **API Integration**: Real-time data from external sources
- **Mobile App**: Native mobile application
- **Gamification**: More advanced game mechanics
- **Carbon Offsetting**: Direct offset purchase integration
- **Analytics**: Advanced reporting and insights
- **Push Notifications**: Real-time activity reminders
- **Data Export**: Export carbon footprint reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Carbon emission factors based on scientific research
- Icons provided by Lucide React
- Design inspiration from modern sustainability apps
- Community feedback and suggestions

---

**Make a difference today! Start tracking your carbon footprint and join thousands of eco-conscious individuals making the world a better place.** 🌍 
**Make a difference today! Start tracking your carbon footprint and join thousands of eco-conscious individuals making the world a better place.** 🌍 