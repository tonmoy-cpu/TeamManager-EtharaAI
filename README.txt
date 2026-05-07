================================================================================
                                TEAM TASK MANAGER
================================================================================

A full-stack, real-time web application built to streamline collaboration, 
project management, and team communication. Team Task Manager empowers teams 
to organize tasks, manage permissions, and communicate instantly in a unified, 
highly responsive interface.

LIVE DEMO: https://teammanager-etharaai-production.up.railway.app

--------------------------------------------------------------------------------
ABOUT THE PROJECT
--------------------------------------------------------------------------------
Team Task Manager was built to solve the fragmentation of team collaboration tools. 
Instead of using one app for tasks, another for team chat, and a third for 
project organization, this application combines them all. 

It is designed with a "Monorepo Architecture" for simplified deployment, meaning 
both the React frontend and Express backend live in the same repository and are 
deployed as a single, unified service.

--------------------------------------------------------------------------------
KEY FEATURES
--------------------------------------------------------------------------------
* Real-Time Synchronization: Powered by Socket.io, all task updates, project 
  creations, and team chats are synchronized instantly across all connected 
  clients without page refreshes.

* Role-Based Access Control (RBAC): Granular permission system ensuring that 
  only designated Admins and Task Creators can edit or delete sensitive data, 
  while Team Members can view and collaborate.

* Integrated Team Chat: Every team comes with a built-in real-time chat room, 
  keeping discussions contextual and centralized.

* Live Notifications: Receive instant toast notifications when assigned to a 
  new project or added to a team.

* Modern UI/UX: Built with React, Tailwind CSS, and Framer Motion for a 
  smooth, fully responsive, and visually stunning user experience.

* Global State Management: Utilizes Zustand for lightweight, predictable global 
  state management (including authentication and socket connections).

--------------------------------------------------------------------------------
TECHNOLOGY STACK
--------------------------------------------------------------------------------
[ FRONTEND ]
- React.js (Vite): Lightning-fast development and optimized production builds.
- Tailwind CSS: Utility-first styling for beautiful, responsive design.
- Framer Motion: Smooth animations for modal reveals and page transitions.
- Zustand: Simplified, boilerplate-free global state management.
- Axios: For intercepting and handling API requests securely with JWT tokens.

[ BACKEND ]
- Node.js & Express.js: Robust server-side framework.
- MongoDB & Mongoose: NoSQL database with strict schema validation.
- Socket.io: Bidirectional WebSockets for real-time data streaming.
- JWT & Bcrypt: Secure, stateless user authentication and password hashing.

--------------------------------------------------------------------------------
HOW IT WORKS (ARCHITECTURE & WORKFLOW)
--------------------------------------------------------------------------------
This project operates on a seamless, real-time feedback loop:

1. Authentication Flow: Users log in, and the server generates a JWT. This token 
   is stored securely in the frontend's Zustand state. Axios intercepts every 
   outgoing request to automatically attach this token.

2. Socket Initialization: As soon as a user authenticates, a global Socket.io 
   connection is established. The user automatically "joins" specific socket 
   rooms associated with their User ID, their Teams, and their Projects.

3. Real-Time Workflow: When a user creates a new task:
   - The frontend sends an HTTP POST request to the Express API.
   - The backend saves the task to MongoDB.
   - The backend immediately emits a 'task_created' Socket event to the specific 
     Project room.
   - All other connected users in that project receive the event and their React 
     state is updated instantly.

4. Production Routing: In production, the Express backend serves double duty. 
   It acts as the API, but if a request doesn't match an API route, Express 
   falls back to serving the static files compiled by React/Vite.

--------------------------------------------------------------------------------
DEPLOYMENT GUIDE (RAILWAY)
--------------------------------------------------------------------------------
This application is specifically configured for a seamless Monorepo Deployment 
on Railway.

Step 1: Push the entire repository (containing both the 'frontend' and 'backend' 
        folders, and the root package.json) to GitHub.
Step 2: Go to Railway.app and select 'Deploy from GitHub repo'.
Step 3: In the Railway Variables tab, add:
        - NODE_ENV=production
        - MONGO_URI=your_mongodb_atlas_connection_string
        - JWT_SECRET=your_super_secret_jwt_key
        (Do not add a PORT variable; Railway injects this automatically).
Step 4: Once saved, Railway automatically runs 'npm install' for both folders, 
        builds the React frontend, and starts the Express backend.

--------------------------------------------------------------------------------
LOCAL DEVELOPMENT
--------------------------------------------------------------------------------
1. Clone the repository
2. Create a .env file in the /backend directory:
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
3. Run this single command from the root directory to install all packages and 
   start both servers concurrently:
   npm install && npm run dev
4. Open your browser and navigate to http://localhost:5173

================================================================================
LICENSE
This project is licensed under the MIT License.
================================================================================
