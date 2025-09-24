@echo off
echo Setting up PostgreSQL database for Scheduler App...

echo.
echo Step 1: Creating database...
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres scheduler_db

if %errorlevel% neq 0 (
    echo.
    echo Database creation failed. This might mean:
    echo 1. PostgreSQL service is not running
    echo 2. Wrong password
    echo 3. Database already exists
    echo.
    echo Try connecting manually:
    echo "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
    echo Then run: CREATE DATABASE scheduler_db;
    pause
    exit /b 1
)

echo.
echo Database created successfully!
echo.
echo Step 2: Testing connection...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d scheduler_db -c "SELECT version();"

if %errorlevel% neq 0 (
    echo Connection test failed!
    pause
    exit /b 1
)

echo.
echo Setup complete! Now update your .env file with the correct password.
echo Then run: npm run migrate
pause