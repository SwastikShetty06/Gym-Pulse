# Gym Pulse - Frontend

The modern, high-performance UI for Gym Pulse. Built with React, Vite, and a custom "Glassmorphism" design system.

## 🎨 Design Philosophy
- **Aesthetic**: Dark mode, radial glows, glassmorphism (`backdrop-filter: blur`), and Bento Grid layouts.
- **Responsiveness**: Fully touch-optimized for mobile with responsive grids and touch-friendly controls.
- **State Management**: Zustand for global auth/user state.

## 🛠 Tech Stack
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (CSS Variables, Grid/Flexbox)
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to the local URL (usually `http://localhost:5173`).

## 📂 Project Structure
- `src/components`: Reusable UI components (Navbar, etc.)
- `src/pages`: Main view routes (Dashboard, Social, Schedule, etc.)
- `src/store`: Zustand stores (authStore.js)
- `src/styles`: Global CSS and design tokens (index.css)

## ✨ Key Features
- **Dashboard**: "At a glance" view of daily tasks, streak, and recent activity.
- **Social Hub**: Find friends, view elite profiles, follow/unfollow, and copy workout routines.
- **Interactive Schedule**: Weekly training split with expandable details and edit capabilities.
- **PR Vault**: Visual gallery of personal bests.
