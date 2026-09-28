# ⏱ TimeBank — Trade Skills. Share Time. Build Community.

> A hyper-local skill bartering platform where people exchange time and skills instead of money.
> **1 hour of service = 1 Time Credit**

![TimeBank](https://img.shields.io/badge/TimeBank-Skill%20Bartering-FF6B2B?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

---

## ✨ Features

- 🔐 **Authentication** — Register / Login with JWT
- 💰 **Time Credit Wallet** — 1 hour = 1 credit, full transaction history
- 🗺️ **Explore Nearby** — Leaflet map with geospatial user discovery
- 🧭 **Discover Skills** — Tinder-style swipe cards
- ⚡ **Smart Matches** — AI-powered direct + circular trade matching
- 🤝 **Trade System** — Full lifecycle (Requested → Vouched)
- 💬 **Real-time Chat** — Socket.io messaging per trade
- ⭐ **Trust & Vouch** — Reputation system based on completed trades
- 🔔 **Notifications** — Real-time + persistent
- 🎭 **Cartoon UI** — Bright colorful theme with Doraemon, Ninja Hattori, etc.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D Graphics | Three.js / React Three Fiber |
| Animations | Framer Motion |
| Maps | Leaflet / React-Leaflet |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (running locally)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/timebank.git
cd timebank
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed       # Load demo data (optional)
npm start          # Starts on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev        # Starts on http://localhost:5173
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Demo Accounts

| Email | Password | Skills |
|-------|----------|--------|
| alex@demo.com | demo1234 | Web Dev, Python |
| sofia@demo.com | demo1234 | Spanish, Photography |
| marcus@demo.com | demo1234 | Fitness, Guitar |
| priya@demo.com | demo1234 | Data Science, Yoga |
| liam@demo.com | demo1234 | Cooking, French |
| emma@demo.com | demo1234 | Design, Writing |

---

## 📁 Project Structure

```
timebank/
├── backend/
│   └── src/
│       ├── config/        # Database connection
│       ├── controllers/   # Route handlers
│       ├── middleware/     # Auth, error handling
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── socket/         # Socket.io manager
│       └── server.js       # Entry point
│
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI components
│       │   ├── 3d/        # Three.js scenes
│       │   ├── layout/    # Navbar, BottomNav
│       │   └── ui/        # CartoonFloat, LoadingScreen
│       ├── context/       # Auth + Socket contexts
│       ├── pages/         # All app pages
│       └── services/      # API service layer
│
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/skills | Get all skills |
| GET | /api/users/nearby | Geospatial user search |
| GET | /api/trades | Get user trades |
| POST | /api/trades | Create trade |
| GET | /api/matches | Get smart matches |
| GET | /api/wallet | Get wallet balance |
| GET | /api/messages/conversations | Get chats |
| GET | /api/notifications | Get notifications |

---

## 🌐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timebank
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 👩‍💻 Made with ❤️ by Pujitha

> *"People are the network. Skills are the assets. Time is the currency."*
