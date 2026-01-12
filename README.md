# Gym Pulse ⚡️

**Elite Fitness Tracking & Social Platform**

Gym Pulse is a full-stack MERN application designed for serious athletes to track their progress, manage their training schedules, and connect with a community of elite performers. It combines powerful tracking tools with a premium, engaging "dark mode" aesthetic.

## 🌟 Features

### 🏋️‍♂️ Training & Tracking
- **Interactive Weekly Schedule**: Manage your training split with detailed exercises, sets, and reps.
- **Attendance & Streaks**: Auto-calculated streaks and consistency scores to keep you motivated.
- **PR Vault**: Track and visualize your Personal Records with a beautiful card interface.
- **Data Visualization**: Interactive charts for workout intensity and progress.

### 🤝 Social Hub (New!)
- **Network**: Friends, Followers, and Following lists.
- **Discovery**: Search for other athletes by name or email.
- **Profile Peeking**: View detailed profiles of your friends, including their stats, PRs, and schedules.
- **Copy Routine**: One-click feature to adopt a friend's entire weekly schedule to your own.
- **Real-time Stats**: View perfectly synchronized streak and consistency scores for any user.

## 🏗 Architecture

The project is structured as a monorepo with separate backend and frontend directories:

- **`/backend`**: Node.js/Express API with MongoDB.
- **`/frontend`**: React/Vite SPA with custom styling.

## 🚀 Quick Start Guide

### 1. Tools Required
- Node.js
- MongoDB (Running locally or cloud)

### 2. Setup Backend
```bash
cd backend
npm install
npm run dev
```
*Ensure you have a `.env` file with `MONGODB_URI`, `JWT_SECRET`, and `PORT`.*

### 3. Setup Frontend
OPEN A NEW TERMINAL:
```bash
cd frontend
npm install
npm run dev
```

The application will be live at `http://localhost:5173` (by default).

