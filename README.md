# GoalArc — AI-Powered Task Management App

GoalArc is a full-stack productivity application that combines intelligent task management with focus tools, habit tracking, and social accountability. It uses the **Google Gemini AI** to auto-generate task descriptions and provides features like a Pomodoro timer, daily streaks, a calendar view, and a competitive leaderboard.

---

## ✨ Features

### 🤖 AI-Powered
- **AI Task Descriptions** — Automatically generate concise, markdown-formatted task descriptions from a title using Gemini 2.0 Flash.

### ✅ Task Management
- Create, update, and delete tasks with titles, descriptions, and due dates.
- Mark tasks as complete and track completion history.
- Link Pomodoro sessions to specific tasks.

### ⏱️ Pomodoro Timer
- Configurable work / break durations.
- Auto-start breaks and sessions.
- Per-task and global session statistics.
- Sound and notification support.

### 📅 Calendar
- Visualize tasks and due dates on a full calendar (day, week, month views).
- Interactive event creation and management.

### 🔥 Streaks & Gamification
- Daily completion streaks that reset if a day is missed.
- Highest streak tracking.
- Weekly milestone celebrations.
- Timezone-aware streak logic.

### 🏆 Leaderboard
- Competitive global rankings based on streaks and focus time.
- Automatically updated daily via cron jobs.
- Profile pictures and user scores.

### 👤 Authentication & Profile
- User registration with **OTP email verification** (MailerSend / Nodemailer).
- JWT-based authentication.
- Profile management (name, email, avatar).
- Profile picture upload to **AWS S3** with presigned URL generation.

### 🎨 UI & UX
- Dark / light theme support.
- Responsive sidebar navigation.
- Toast notifications.
- Animated UI with Framer Motion.
- Markdown editor for task descriptions.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI |
| **Animations** | Framer Motion |
| **Calendar** | FullCalendar |
| **Markdown** | @uiw/react-md-editor, Mermaid |
| **AI** | Google Generative AI (Gemini 2.0 Flash) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT, bcrypt |
| **Email** | MailerSend, Nodemailer |
| **Storage** | AWS S3 (multer-s3), Presigned URLs |
| **Scheduler** | node-cron |
| **Validation** | Zod |

---

## 📁 Project Structure

```
ToDo_AI-App/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Page and UI components
│   │   │   ├── TodoInterface.jsx
│   │   │   ├── PomodoroPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── StreaksPage.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Auth.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── contexts/       # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── backend/                # Express.js API server
    ├── auth.js             # Entry point, auth routes, cron jobs
    ├── routes/
    │   ├── todo.js         # CRUD + AI description generation
    │   ├── pomodoro.js     # Sessions & statistics
    │   ├── leaderBoardRanking.js
    │   └── profilePictureRoutes.js
    ├── models/             # Mongoose schemas
    │   ├── Todo.js
    │   ├── Streak.js
    │   ├── PomodoroSession.js
    │   ├── PomodoroSettings.js
    │   └── leaderBoard.js
    ├── services/
    │   ├── emailService.js
    │   └── leaderboardService.js
    ├── Middlewares/
    │   ├── AuthMiddleware.js
    │   └── StreakCheck.js
    └── config/
        └── s3Config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- AWS S3 bucket
- Google Gemini API key
- MailerSend API key (for email verification)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ToDo_AI-App.git
cd ToDo_AI-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
VITE_AI_API_KEY=your_google_gemini_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
MAILERSEND_API_KEY=your_mailersend_api_key
```

Start the backend server:

```bash
node auth.js
```

The API will be available at `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/resend-otp` | Resend verification OTP |
| POST | `/signin` | Sign in |
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile |
| GET | `/quotes/random` | Get a random motivational quote |

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Get all user todos |
| POST | `/todos` | Create a new todo |
| PUT | `/todos/:id` | Update a todo |
| DELETE | `/todos/:id` | Delete a todo |
| GET | `/todos/streak` | Get current streak |
| POST | `/todos/generate-description` | AI-generate a task description |

### Pomodoro
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pomodoro/settings` | Get timer settings |
| PUT | `/pomodoro/settings` | Update timer settings |
| POST | `/pomodoro/sessions` | Start a session |
| PUT | `/pomodoro/sessions/:id/complete` | Complete a session |
| GET | `/pomodoro/stats` | Get today's stats |
| GET | `/pomodoro/sessions/count` | Get session count |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get ranked users |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
