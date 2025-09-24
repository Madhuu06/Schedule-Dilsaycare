# Local Testing Instructions

## Test the Application Locally

### 1. Start Backend
```bash
cd backend
npm run dev
```
Backend should start on http://localhost:5000

### 2. Test Backend Health
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"OK","timestamp":"..."}`

### 3. Start Frontend
```bash
cd frontend
npm start
```
Frontend should start on http://localhost:3000

### 4. Test Core Features

#### Create a Slot
1. Open http://localhost:3000
2. Click "+ Add" on any day
3. Enter start time (e.g., 09:00) and end time (e.g., 11:00)
4. Add title "Morning Meeting"
5. Click "Create"

#### Verify Recurring Behavior
1. Scroll down to see next weeks
2. The same slot should appear on the same day of week

#### Test Exception Handling
1. Click "Edit" on a specific slot instance
2. Change the time to 10:00-12:00
3. Click "Update"
4. Verify only that specific date is modified
5. Other weeks should still show original time

#### Test Deletion
1. Click "Delete" on a specific slot
2. Verify it's removed from that date only
3. Other recurring instances should remain

#### Test Validation
1. Try creating a slot with end time before start time
2. Should show validation error
3. Try creating a 3rd slot on the same day
4. Should show "Maximum 2 slots allowed per day" error

### 5. Database Verification
Connect to your PostgreSQL database and verify:
```sql
SELECT * FROM slots ORDER BY created_at;
```

You should see:
- Original recurring slots with `is_exception = false`
- Exception slots with `is_exception = true` and specific `exception_date`
- Deleted exceptions with `is_deleted = true`

## Common Issues & Solutions

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in .env
- Run `npm run migrate` to create tables

### Frontend API calls fail
- Verify backend is running on port 5000
- Check CORS settings
- Verify REACT_APP_API_URL in frontend/.env

### Database connection issues
- Verify PostgreSQL service is running
- Check database exists: `CREATE DATABASE scheduler_db;`
- Verify user permissions

## Next Steps: Deploy to Production

1. **Backend to Render**:
   - Push code to GitHub
   - Connect repository to Render
   - Set environment variables
   - Deploy

2. **Frontend to Vercel**:
   - Connect repository to Vercel
   - Set production API URL
   - Deploy

3. **Test Production**:
   - Verify all features work in production
   - Test CORS configuration
   - Verify database connectivity