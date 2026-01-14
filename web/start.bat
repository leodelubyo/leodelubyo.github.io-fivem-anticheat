@echo off
echo Starting FiveM Anti-Cheat Web Interface...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Using Python server instead...
    echo.
    echo Starting Python server on port 8080...
    python -m http.server 8080
) else (
    REM Check if dependencies are installed
    if not exist node_modules (
        echo Installing dependencies...
        call npm install
        echo.
    )
    
    echo Starting Node.js server on port 8080...
    call npm start
)
