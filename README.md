# Reps - Habit Tracker

Reps is a minimal, responsive habit tracking application focused on consistency and streaks.

## Features
- **Authentication**: Secure email/password login via Supabase Auth.
- **Habit Tracking**: Create proof-based (requires image) or time-based habits.
- **Streaks**: Visual streak counter to keep you motivated.
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- React Router
- Lucide Icons

## Architecture & Logic

### Responsive Layout Approach
The app uses a mobile-first approach with Tailwind CSS. 
- **Mobile (< 640px)**: The sidebar converts into a top navbar with a collapsible hamburger menu. Habit cards stack vertically. Buttons have a minimum height of 44px for touch targets.
- **Desktop (> 1024px)**: Features a fixed left sidebar for easy navigation.

### Habit Type Logic
Habits can be either `proof` or `non-proof`.
- **Non-Proof**: Requires only the time spent to log.
- **Proof**: Requires both an image upload (stored in Supabase Storage) and time spent.

### Logging Logic
When a habit is logged, a record is created in the `logs` table with the current date. The UI immediately updates to show the habit as completed for the day (grayed out with a checkmark).

### Streak Calculation
Streaks are tracked in the `user_stats` table. When a habit is logged:
1. If the last log was yesterday, the streak increments by 1.
2. If the last log was today, the streak remains the same.
3. If the last log was older than yesterday, the streak resets to 1.

### Authentication Flow
1. **Sign Up**: Users create an account using email/password. Supabase handles the email verification process.
2. **Login**: Users authenticate to access protected routes.
3. **Session Management**: Supabase automatically persists the session in local storage. The `AuthContext` provides the session state to the entire app.
4. **Protected Routes**: The `ProtectedRoute` component wraps the main application layout, redirecting unauthenticated users to the login page.

## Setup
See `SETUP.md` for instructions on configuring the Supabase backend.
