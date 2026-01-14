#!/bin/bash

echo "FiveM Anti-Cheat Web Interface Setup"
echo "===================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    echo
    exit 1
fi

echo "Node.js found."
echo

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies."
    exit 1
fi

echo "Dependencies installed successfully."
echo

# Create environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Environment file created from example."
else
    echo "Environment file already exists."
fi

echo
echo "Setup complete!"
echo
echo "To start the web interface:"
echo "  npm start"
echo
echo "Or for development:"
echo "  npm run dev"
echo
echo "The dashboard will be available at: http://localhost:8080"
echo
