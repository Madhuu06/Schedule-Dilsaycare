# 📅 Weekly Scheduler App

A modern, full-stack weekly scheduling application built with React, Node.js, and PostgreSQL. Features recurring slot management, date-specific exceptions, and infinite scroll for seamless week navigation.

## 🌟 Features

### Core Functionality
- **📅 Weekly Calendar View** - Clean, intuitive weekly calendar interface
- **🔄 Recurring Slots** - Create slots that repeat weekly on specific days
- **📝 Date-Specific Exceptions** - Modify or delete individual slot instances without affecting the recurring pattern
- **⚡ Infinite Scroll** - Seamlessly load more weeks as you scroll
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices

### Smart Slot Management
- **🎯 Slot Limits** - Maximum 2 slots per day to prevent overcrowding
- **✏️ Easy Editing** - Click to edit slot times, titles, and descriptions
- **🗑️ Flexible Deletion** - Delete specific dates or entire recurring patterns
- **🔄 Exception Handling** - Smart system that preserves recurring patterns while allowing date-specific changes

### User Experience
- **⚡ Fast Loading** - Optimized database queries and caching
- **🎨 Clean UI** - Modern Tailwind CSS design
- **📊 Visual Feedback** - Loading states and smooth transitions
- **🔍 No Clutter** - Clean interface without debug information
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Real-time Updates**: Optimistic UI updates for better UX

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- TanStack React Query for state management
- Axios for API calls
- date-fns for date handling

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Knex.js for migrations and queries
- Comprehensive error handling and validation

## 📁 Project Structure

```
scheduler-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── hooks/         # Custom React hooks
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data access layer
│   │   ├── database/      # Migrations and config
│   │   └── types/         # TypeScript types
└── README.md
```

## � Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Clone & Setup
```bash
git clone <repository-url>
cd scheduler-app
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=scheduler_db
# DB_USER=postgres
# DB_PASSWORD=your_password

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📊 Database Schema

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

## � API Endpoints

### Slots
- `POST /api/slots` - Create a new recurring slot
- `GET /api/slots/week?weekStart=YYYY-MM-DD` - Get slots for a specific week
- `PUT /api/slots/:id` - Update a slot (creates exception)
- `DELETE /api/slots/:id` - Delete a slot or create delete exception

### Health Check
- `GET /health` - Server health status

## 💡 How It Works

### Recurring Logic
1. **Create Slot**: When you create a slot on a specific day, it automatically repeats every week on that same day
2. **Edit Exception**: Editing a specific instance creates an exception for that date only
3. **Delete Exception**: Deleting a specific instance creates a "deleted" exception for that date
4. **Original Preserved**: The original recurring pattern remains unchanged

### Exception Handling
- Each modification creates a new record with `is_exception = true`
- Original recurring slots are never modified
- Exceptions override recurring slots for specific dates
- Soft deletes allow reverting changes

## 🌐 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://[render-postgres-url]
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-domain.onrender.com/api
   ```
3. Deploy from the `frontend` folder

### Database (Render PostgreSQL)
1. Create a PostgreSQL database on Render
2. Copy the connection string to your backend environment variables
3. Migrations run automatically on deployment

## 📝 Assignment Requirements Met

✅ **Recurring weekly slots system**  
✅ **Exception handling for modified slots**  
✅ **React + TypeScript + TailwindCSS frontend**  
✅ **Node.js + TypeScript + PostgreSQL backend**  
✅ **REST API endpoints**  
✅ **Weekly calendar with infinite scroll**  
✅ **Live deployment ready**  
✅ **Maximum 2 slots per day enforcement**  
✅ **Comprehensive error handling and validation**  

## 🔗 Live Demo

- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Render URL]

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📞 Support

For questions about this assignment: admin@dilsaycare.in

---

**Built with ❤️ for DilSayCare Take-Home Assignment**