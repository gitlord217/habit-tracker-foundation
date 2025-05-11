# HabitVault

A full-stack habit tracking application designed to help users build and maintain positive habits through intuitive tracking, visualization, and engagement features.

## Features

- **User Authentication**: Secure login and registration system
- **Habit Management**: Create, update, and delete personal habits
- **Daily Check-ins**: Mark habits as complete and track progress
- **Streak Tracking**: Monitor continuous habit completion
- **Visual History**: View habit completion patterns
- **Analytics Dashboard**: Get insights into habit performance
- **Motivational Quotes**: Daily quotes to keep you inspired

## Tech Stack

- **Frontend**: React with TypeScript, Shadcn UI components
- **Backend**: Express.js with PostgreSQL database
- **State Management**: React Query
- **Authentication**: Custom authentication with session management
- **Styling**: Tailwind CSS with responsive design

## Installation and Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/habitvault.git
   cd habitvault
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     DATABASE_URL=your_postgresql_connection_string
     SESSION_SECRET=your_session_secret
     ```

4. Start the development server
   ```
   npm run dev
   ```

## Database Setup

This project uses PostgreSQL with Drizzle ORM. To set up the database:

1. Ensure PostgreSQL is installed and running
2. Create a database for the project
3. Run the database migrations:
   ```
   npm run db:push
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and utilities
- `/components.json` - Shadcn UI configuration

## Usage Guide

1. Register a new account or login
2. Add habits you want to track from the Habits page
3. Mark habits as complete on your Dashboard
4. View your progress in the Analytics section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.