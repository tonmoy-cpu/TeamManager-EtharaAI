# 🚀 Team Task Manager

A full-stack, real-time web application built to streamline collaboration, project management, and team communication. Team Task Manager empowers teams to organize tasks, manage permissions, and communicate instantly in a unified, highly responsive interface.

![Modern Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)

**🔗 Live Demo:** [https://teammanager-etharaai-production.up.railway.app]

---

## 📖 About the Project

Team Task Manager was built to solve the fragmentation of team collaboration tools. Instead of using one app for tasks, another for team chat, and a third for project organization, this application combines them all. 

It is designed with a **Monorepo Architecture** for simplified deployment, meaning both the React frontend and Express backend live in the same repository and are deployed as a single, unified service.

---

## ✨ Features

- **⚡ Real-Time Synchronization:** Powered by **Socket.io**, all task updates, project creations, and team chats are synchronized instantly across all connected clients without page refreshes.
- **🔐 Role-Based Access Control (RBAC):** Granular permission system ensuring that only designated Admins and Task Creators can edit or delete sensitive data, while Team Members can view and collaborate.
- **💬 Integrated Team Chat:** Every team comes with a built-in real-time chat room, keeping discussions contextual and centralized.
- **🔔 Live Notifications:** Receive instant toast notifications when assigned to a new project or added to a team.
- **🎨 Modern UI/UX:** Built with React, Tailwind CSS, and Framer Motion for a buttery-smooth, fully responsive, and visually stunning user experience.
- **📦 Global State Management:** Utilizes **Zustand** for lightweight, predictable global state management (including authentication and socket connections).

---

## 🛠️ Technology Stack

### Frontend
- **React.js (Vite):** Lightning-fast development environment and optimized production builds.
- **Tailwind CSS:** Utility-first styling for beautiful, responsive design.
- **Framer Motion:** Smooth, physics-based animations for modal reveals and page transitions.
- **Zustand:** Simplified, boilerplate-free global state management.
- **Axios:** For intercepting and handling API requests securely with JWT tokens.

### Backend
- **Node.js & Express.js:** Robust server-side framework.
- **MongoDB & Mongoose:** NoSQL database with strict schema validation.
- **Socket.io:** Bidirectional WebSockets for real-time data streaming.
- **JWT & Bcrypt:** Secure, stateless user authentication and password hashing.

---

## ⚙️ How It Works (Architecture & Workflow)

This project operates on a seamless, real-time feedback loop between the client and the server:

1. **Authentication Flow:** Users log in, and the server generates a JWT. This token is stored securely in the frontend's Zustand state. Axios intercepts every outgoing request to automatically attach this token to the `Authorization` header.
2. **Socket Initialization:** As soon as a user authenticates, a global Socket.io connection is established. The user automatically "joins" specific socket rooms associated with their User ID, their Teams, and their Projects.
3. **Real-Time Workflow:** When a user creates a new task:
   - The frontend sends an HTTP `POST` request to the Express API.
   - The backend saves the task to MongoDB.
   - The backend immediately emits a `task_created` Socket event to the specific Project room.
   - All other connected users in that project receive the event and their React state is updated instantly, showing the new task without needing to refresh the page.
4. **Production Routing:** In production, the Express backend serves double duty. It acts as the API (`/api/*`), but if a request doesn't match an API route, Express falls back to serving the static `index.html` compiled by React/Vite.

---

## 🚀 Deployment Guide (Railway)

This application is specifically configured for a seamless **Monorepo Deployment** on Railway.

### Step 1: Prepare the Repository
Ensure you push the entire repository (containing both the `frontend` and `backend` folders, and the root `package.json`) to GitHub.

### Step 2: Deploy to Railway
1. Go to Railway.app and create a **New Project**.
2. Select **Deploy from GitHub repo** and choose your repository.

### Step 3: Configure Environment Variables
In the Railway dashboard for your service, navigate to the **Variables** tab and add the following:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
*(Note: Do not add a `PORT` variable; Railway injects this automatically).*

### Step 4: The Build Process
Once the variables are saved, Railway will read the root `package.json` and automatically:
1. Run `npm install` for both the frontend and backend.
2. Run `vite build` to compile the React frontend.
3. Run `node server.js` to start the backend, which will securely serve the compiled frontend.

### Step 5: Generate Domain
Go to your Railway service **Settings**, scroll down to **Networking**, and click **Generate Domain**. Share this live link with your team!

---

## 💻 Local Development

If you wish to run the app locally for testing or development:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/team-task-manager.git
   cd team-task-manager
   ```

2. **Setup Environment Variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

3. **Install Dependencies & Run:**
   Run this single command from the root directory to install all packages and start both servers concurrently:
   ```bash
   npm install
   npm run dev
   ```

Open your browser and navigate to `http://localhost:5173`.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
