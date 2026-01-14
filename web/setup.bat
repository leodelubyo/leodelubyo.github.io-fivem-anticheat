@echo off
echo FiveM Anti-Cheat Web Interface Setup
echo =====================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found.
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo Dependencies installed successfully.
echo.

echo Creating environment file...
if not exist .env (
    copy .env.example .env
    echo Environment file created from example.
) else (
    echo Environment file already exists.
)

echo.
echo Setup complete!
echo.
echo To start the web interface:
echo   npm start
echo.
echo Or for development:
echo   npm run dev
echo.
echo The dashboard will be available at: http://localhost:8080
echo.
pause
