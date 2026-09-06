# NOVA - Full Stack Project Management Platform

NOVA is a robust, modern Full-Stack Project Management and Team Collaboration platform built as an intern assignment submission. It allows users to securely register, create isolated project workspaces, manage tasks on an interactive Kanban board, and collaborate with invited team members in real-time.

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS / CSS Modules (Custom High-End UI)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: [Prisma v7](https://www.prisma.io/) (utilizing modern `@prisma/adapter-pg` driver adapters)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider with bcrypt password hashing)
- **Testing**: [Playwright](https://playwright.dev/) (End-to-End browser testing)

## ✨ Core Features

### 1. Secure Authentication & Authorization
- **Custom Credentials Login**: Users can register and log in securely. Passwords are cryptographically hashed using `bcryptjs`.
- **Session Management**: Persistent, secure server-side session handling via NextAuth.
- **Forgot/Reset Password Flow**: Users can request a password reset which securely generates a time-sensitive, unique token stored in the database.
- **Protected Routes**: Middleware and server-side checks ensure unauthenticated users cannot access the dashboard or API routes.

### 2. Project Management (CRUD)
- **Dashboard Overview**: A personalized dashboard that fetches and aggregates the user's active projects and pending tasks.
- **Create & Delete Projects**: Users can instantly spin up new projects through a responsive modal. Project owners have the exclusive right to permanently delete their projects.

### 3. Interactive Task Board (Kanban)
- **Task Creation**: Add tasks directly into a project's workspace.
- **Dynamic Status Updates**: An interactive board featuring **To Do**, **In Progress**, and **Done** columns. Moving tasks immediately updates the database.
- **Task Deletion**: Easily remove tasks from the board.

### 4. Team Collaboration
- **Member Invites**: Project owners can invite other registered users to their workspace via email address.
- **Access Control**: Only the Project Owner and invited Members can view the project details or interact with the task board.

## 🛠️ Local Development Setup

To run this project locally, follow these steps:

### Prerequisites
- Node.js (v18 or higher)
- A PostgreSQL database URL (e.g., from Supabase or Neon)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Generate a random secret for NextAuth (e.g., run `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
Push the Prisma schema to your database to create the necessary tables:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🧪 Testing

The platform includes a robust End-to-End testing suite built with Playwright.

To run the automated test suite:
```bash
# Install required browser binaries
npx playwright install chromium --with-deps

# Run the tests headlessly
npx playwright test

# Or run with the UI to watch the tests execute
npx playwright test --ui
```

## 🏗️ Build for Production
To verify the application compiles perfectly for deployment:
```bash
npm run build
```
