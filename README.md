# Weekly Scheduler

A professional weekly scheduling application with recurring slot management and exception handling capabilities.

## Overview

Weekly Scheduler is a full-stack web application designed for efficient weekly schedule management. The application supports recurring slots with intelligent exception handling, allowing users to modify specific dates without affecting the overall recurring pattern.

## Key Features

**Weekly Calendar Interface**
- Clean grid-based weekly view
- Infinite scroll navigation through weeks
- Responsive design for desktop and mobile

**Advanced Slot Management**
- Recurring slot creation with weekly patterns
- Date-specific exceptions for modified or deleted slots
- Intelligent constraint system (maximum 2 slots per day)
- Real-time slot editing and deletion

**Modern Architecture**
- TypeScript-first development
- RESTful API design
- Optimized database queries with proper indexing
- Exception-based recurring slot system

## Technology Stack

**Frontend**
- React 18 with TypeScript
- Tailwind CSS for styling
- TanStack React Query for data management
- date-fns for date manipulation

**Backend**
- Node.js with Express framework
- TypeScript implementation
- PostgreSQL database with Knex.js ORM
- Comprehensive error handling and validation

**Deployment**
- Frontend: Netlify
- Backend: Render
- Database: Render PostgreSQL

## Project Structure

```
scheduler-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript definitions
│   │   └── hooks/         # Custom React hooks
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── database/      # Database configuration
│   │   └── types/         # TypeScript definitions
└── README.md
```

## Live Application

- **Frontend**: https://dilsaycare-schedule.netlify.app
- **Backend API**: https://schedule-dilsaycare-2.onrender.com/api

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm package manager

### Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Update .env with your database credentials

# Initialize database
npm run migrate

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm start
```

### Local Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Database Schema

### Slots Table
```sql
slots (
  id UUID PRIMARY KEY,
  day_of_week INTEGER NOT NULL,        -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  original_slot_id UUID,               -- Reference to original recurring slot
  is_exception BOOLEAN DEFAULT false,  -- True for modified instances
  exception_date DATE,                 -- Specific date for exceptions
  is_deleted BOOLEAN DEFAULT false,    -- Soft delete for exceptions
  title TEXT,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## API Endpoints

### Slots Management
- `POST /api/slots` - Create a new recurring slot
- `GET /api/slots/week?weekStart=YYYY-MM-DD` - Get slots for a specific week
- `PUT /api/slots/:id` - Update a slot (creates exception)
- `DELETE /api/slots/:id` - Delete a slot or create delete exception

## Recurring Logic

### How It Works
1. **Create Slot**: When you create a slot on a specific day, it automatically repeats every week on that same day
2. **Edit Exception**: Editing a specific instance creates an exception for that date only
3. **Delete Exception**: Deleting a specific instance creates a "deleted" exception for that date
4. **Original Preserved**: The original recurring pattern remains unchanged

### Exception Handling
- Each modification creates a new record with `is_exception = true`
- Original recurring slots are never modified
- Exceptions override recurring slots for specific dates
- Soft deletes allow reverting changes

## Deployment Architecture

The application follows a modern three-tier architecture:

1. **Presentation Layer**: React frontend deployed on Netlify
2. **Application Layer**: Node.js API server deployed on Render
3. **Data Layer**: PostgreSQL database hosted on Render

### Environment Configuration

**Backend Environment Variables**
```bash
NODE_ENV=production
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
FRONTEND_URL=https://your-frontend-domain
ALLOWED_ORIGINS=https://your-frontend-domain
```

**Frontend Environment Variables**
```bash
REACT_APP_API_URL=https://your-backend-api-url
```

## Technical Highlights

- **Exception-Based Architecture**: Maintains data integrity while allowing flexible modifications
- **Optimized Queries**: Database indexes for efficient slot retrieval
- **Infinite Scroll**: Performance-optimized week loading
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive validation and error management

---

*Built with modern web technologies for efficient weekly schedule management.*