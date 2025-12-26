# PHYSQ - Fitness & Workout Tracking App

A comprehensive cross-platform fitness tracking application built with React Native and Expo, featuring workout management, progress tracking, and personalized fitness analytics.

## 🎯 Overview

PHYSQ is a modern fitness tracking application that helps users monitor their workouts, track progress, manage workout templates, and maintain a complete fitness journey record. The app provides an intuitive interface for both mobile and web platforms, making fitness tracking accessible anywhere.

## ✨ Features

### 🏋️ Workout Management
- **Workout Sessions**: Track and record individual workout sessions with detailed exercise logs
- **Custom Templates**: Create and manage personalized workout templates for consistent training
- **Active Workout Tracking**: Real-time workout tracking with exercise sets, reps, and weights
- **Workout History**: View and manage complete workout records with edit and delete capabilities

### 📊 Progress Tracking
- **Body Statistics**: Monitor height, weight, and other body metrics over time
- **Visual Analytics**: Interactive charts and graphs using React Native Chart Kit
- **Weekly Summaries**: Track workout frequency and performance trends
- **Progress Dashboard**: Comprehensive overview of fitness achievements

### 👤 User Profile & Settings
- **Profile Management**: Update personal information, body stats, and fitness goals
- **Schedule Upload**: Upload and manage training schedules
- **Secure Authentication**: JWT-based authentication with secure token storage
- **Theme Support**: Light and dark mode support for comfortable viewing

### 📱 Cross-Platform Support
- **Mobile**: Native iOS and Android applications
- **Web**: Full-featured web application
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Collapsible Side Navigation**: Enhanced navigation experience on larger screens

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native 0.81.5
- **React**: 19.1.0
- **Navigation**: Expo Router 6.0.17
- **Language**: TypeScript 5.9.2
- **State Management**: React Context API (AuthContext, ThemeContext)
- **HTTP Client**: Axios 1.13.2
- **Charts**: React Native Chart Kit 6.12.0
- **Icons**: Expo Vector Icons 15.0.3
- **Storage**: Expo SecureStore, AsyncStorage
- **Image Handling**: Expo Image Picker
- **Animations**: React Native Reanimated 4.2.1

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: MongoDB with Mongoose 9.0.1
- **Authentication**: JSON Web Tokens (JWT) 9.0.3
- **Password Hashing**: bcryptjs 3.0.3
- **Environment Variables**: dotenv 17.2.3
- **CORS**: cors 2.8.5
- **Development**: Nodemon 3.1.11

### Development Tools
- **Package Manager**: npm
- **Mobile Development**: Expo SDK 54
- **Build Tool**: Babel (babel-preset-expo)
- **Type Checking**: TypeScript

## 📁 Project Structure

```
PHYSQ/
├── backend/                    # Backend API server
│   ├── models/                 # Mongoose models
│   │   ├── User.js            # User model with profile data
│   │   ├── WorkoutSession.js  # Workout session records
│   │   ├── Template.js        # Workout template definitions
│   │   └── Schedule.js        # Training schedule model
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication routes
│   │   ├── user.js           # User management
│   │   ├── workouts.js       # Workout CRUD operations
│   │   ├── templates.js      # Template management
│   │   ├── progress.js       # Progress tracking
│   │   └── schedule.js       # Schedule management
│   ├── middleware/           # Custom middleware
│   ├── index.js             # Server entry point
│   └── package.json         # Backend dependencies
│
├── mobile-app/               # React Native mobile application
│   ├── app/                 # App screens (Expo Router)
│   │   ├── (tabs)/         # Tab-based navigation
│   │   │   ├── home.tsx   # Dashboard/home screen
│   │   │   ├── workout.tsx # Workout management
│   │   │   ├── progress.tsx # Progress tracking
│   │   │   └── profile.tsx  # User profile
│   │   ├── workout/        # Workout-related screens
│   │   │   ├── active.tsx  # Active workout tracking
│   │   │   └── records.tsx # Workout history
│   │   ├── template/       # Template screens
│   │   │   └── create.tsx  # Template creation
│   │   ├── auth/          # Authentication screens
│   │   └── _layout.tsx    # Root layout
│   ├── components/         # Reusable components
│   │   ├── Input.tsx      # Custom input component
│   │   └── SideNav.tsx    # Side navigation
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── ThemeContext.tsx  # Theme management
│   ├── services/          # API service layer
│   │   └── workouts.ts    # Workout API calls
│   ├── constants/         # App constants
│   │   └── Colors.ts      # Color schemes
│   ├── utils/             # Utility functions
│   ├── assets/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── .gitignore
└── mongodb_guide.md        # MongoDB setup guide
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **MongoDB**: Local or cloud instance (MongoDB Atlas)
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Mobile Development**: 
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio
  - Or use Expo Go app for quick testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PHYSQ.git
   cd PHYSQ
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Mobile App Setup**
   ```bash
   cd ../mobile-app
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start Mobile App**
   
   For development with Expo:
   ```bash
   cd mobile-app
   npm start
   ```

   For specific platforms:
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`
   - **Web**: `npm run web`

3. **Access the Application**
   - Mobile: Scan the QR code with Expo Go app
   - Web: Open `http://localhost:8081` in your browser

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

### Workouts
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create new workout
- `GET /api/workouts/:id` - Get specific workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `GET /api/workouts/weekly-count` - Get weekly workout count

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `DELETE /api/templates/:id` - Delete template

### Progress
- `GET /api/progress` - Get progress data
- `POST /api/progress` - Add progress entry

### Schedule
- `POST /api/schedule/upload` - Upload training schedule
- `GET /api/schedule` - Get user schedule

## 🎨 Features in Detail

### Dashboard (Home Screen)
- Weekly workout count summary
- Body statistics overview
- Quick access to recent workouts
- Progress charts and visualizations

### Workout Tracking
- Start new workout sessions
- Track exercises with sets, reps, and weights
- Save completed workouts
- View workout history with detailed records
- Edit or delete past workouts

### Template Management
- Create custom workout templates
- Save frequently used workout routines
- Quick start workouts from templates
- Manage and organize templates

### Progress Analytics
- Track body measurements over time
- Visualize progress with interactive charts
- Monitor workout frequency
- Set and track fitness goals

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing with bcryptjs
- Token storage using Expo SecureStore
- Protected API routes with middleware
- CORS configuration for secure API access

## 🎨 Design Features

- Modern, intuitive UI/UX
- Dark mode support
- Responsive layouts for all screen sizes
- Smooth animations and transitions
- Glassmorphism and modern design patterns
- Custom color schemes and theming

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Update documentation for new features
- Test thoroughly on multiple platforms
- Ensure backward compatibility

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React Native and Expo teams for excellent frameworks
- MongoDB for reliable database solution
- The open-source community for invaluable tools and libraries

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🗺️ Roadmap

- [ ] Social features and workout sharing
- [ ] Nutrition tracking integration
- [ ] AI-powered workout recommendations
- [ ] Community challenges and leaderboards
- [ ] Wearable device integration
- [ ] Offline mode support
- [ ] Export workout data and reports
- [ ] Video exercise demonstrations

---

**Built with ❤️ for fitness enthusiasts**
