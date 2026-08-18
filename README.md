📦 BorrowBox — Own Less. Experience More.

BorrowBox is a MERN-based peer-to-peer lending platform where users can lend and borrow everyday items such as cameras, tools, gaming gear, books, and camping equipment.

The platform focuses on trust, availability, condition tracking, deposits, reviews, and dispute management.

✨ Features
🔐 JWT authentication with user/admin roles
📦 Create, edit, pause, and delete item listings
🔎 Search, filtering, sorting, and pagination
📍 Nearby item discovery using MongoDB 2dsphere
📅 Availability calendar with server-side conflict validation
🤝 Borrow request and approval workflow
💰 Daily pricing and refundable deposits
🛡️ Trust Score with levels and badges
📸 Condition tracking at handover and return
⚖️ Dispute workflow with admin resolution
⭐ Multi-dimensional reviews and ratings
🔔 Real-time notifications using Socket.IO
📊 User dashboard with activity statistics
🖥️ Admin dashboard
📱 Responsive UI with Framer Motion
🧰 Tech Stack
Frontend

React, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form, Zod, Framer Motion, Recharts

Backend

Node.js, Express, Mongoose, JWT, bcryptjs, Zod, Socket.IO, Multer

Database

MongoDB with text, compound, and 2dsphere indexes

Storage

Local file storage with Multer

🏗️ Architecture
borrowbox/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── store/
│
└── server/
    └── src/
        ├── models/
        ├── controllers/
        ├── services/
        ├── routes/
        ├── middleware/
        └── validators/


Controllers handle requests, services contain business logic, and TanStack Query manages server state.

🔄 Borrowing Flow
Discover
   ↓
Check Availability
   ↓
Send Request
   ↓
Approve
   ↓
Handover
   ↓
Active
   ↓
Return
   ↓
Complete
   ↓
Review

⚖️ Dispute Flow
Dispute
   ↓
Evidence
   ↓
Admin Resolution
   ↓
Trust Score Update

⚙️ Environment Variables

Create a .env file inside the server directory.

MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000


⚠️ Never commit your .env file to version control.

🚀 Getting Started
Prerequisites
Node.js 18+
MongoDB
npm
Backend
cd server
npm install
cp .env.example .env
npm run seed
npm run dev

Frontend

Open a new terminal:

cd client
npm install
npm run dev

🔮 Future Improvements
💳 Razorpay deposit escrow
💬 In-app chat
🗺️ Live maps
📧 Email/OTP verification
🔔 Push notifications
⏰ Automated return reminders
📱 PWA support
📦 BorrowBox

Own less. Experience more.