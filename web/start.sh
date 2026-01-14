#!/bin/bash

echo "Starting FiveM Anti-Cheat Web Interface..."
echo

# Check if Node.js is available
if command -v node &> /dev/null; then
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        echo
    fi
    
    echo "Starting Node.js server on port 8080..."
    npm start
else
    echo "Node.js not found. Using Python server instead..."
    echo
    echo "Starting Python server on port 8080..."
    python3 -m http.server 8080 2>/dev/null || python -m http.server 8080
fi
