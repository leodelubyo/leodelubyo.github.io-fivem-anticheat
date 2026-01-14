@echo off
echo ====================================
echo FiveM Anti-Cheat Web Deploy
echo ====================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js...
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

echo Dependencies installed!
echo.

echo Creating production build...
if not exist dist mkdir dist

echo Copying files...
xcopy index.html dist\ /E /I /Y
xcopy style.css dist\ /E /I /Y
xcopy script.js dist\ /E /I /Y
if exist package.json copy package.json dist\ /Y

echo.
echo ====================================
echo Deployment Complete!
echo ====================================
echo.
echo Your website is ready in the 'dist' folder.
echo.
echo To start the server:
echo   cd dist
echo   npm start
echo.
echo Server will run on: http://localhost:8080
echo.
echo For production deployment:
echo   - Upload the 'dist' folder to your web host
echo   - Or deploy to Vercel, Netlify, or similar services
echo.
pause
