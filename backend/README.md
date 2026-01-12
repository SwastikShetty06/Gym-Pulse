# Gym Pulse - Backend

The RESTful API service for the Gym Pulse "Elite Fitness" platform. Built with Node.js, Express, and MongoDB.

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JsonWebToken (JWT) & Bcrypt
- **Security**: Cors, Dotenv

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of `backend/` with the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Seed the database (Optional but recommended for demo):
   ```bash
   node seed_data.js
   ```

### Running the Server
- **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```
The server will start on `http://localhost:5000`.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth` - Get current authenticated user

### Social Hub
- `GET /api/social` - Search users
- `GET /api/social/network` - Get friends/followers/following
- `GET /api/social/profile/:id` - Get a friend's full profile (stats, schedule, PRs)
- `POST /api/social/request/:id` - Send friend request
- `PUT /api/social/request/:id` - Accept/Reject request
- `PUT /api/social/follow/:id` - Follow/Unfollow user

### Schedule & Training
- `GET /api/schedule` - Get weekly schedule
- `POST /api/schedule` - Update single day schedule
- `POST /api/schedule/bulk` - Bulk update/copy schedule (e.g., copying from friend)

### Tracking
- `GET /api/attendance` - Get attendance history
- `POST /api/attendance` - Mark attendance
- `GET /api/prs` - Get Personal Records
- `POST /api/prs` - Add new PR
