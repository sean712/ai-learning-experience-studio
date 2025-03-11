#!/bin/bash

# This script helps set up the project correctly on Replit

# Find the actual project directory
if [ -d "CascadeProjects/ai-roleplay-creator-demo" ]; then
  echo "Found project in CascadeProjects/ai-roleplay-creator-demo"
  PROJECT_DIR="CascadeProjects/ai-roleplay-creator-demo"
elif [ -f "package.json" ]; then
  echo "Found project in root directory"
  PROJECT_DIR="."
else
  echo "Searching for package.json..."
  PROJECT_DIR=$(find . -name "package.json" -not -path "*/node_modules/*" | head -n 1 | xargs dirname)
  echo "Found project in $PROJECT_DIR"
fi

# If project directory is found, set it up
if [ -n "$PROJECT_DIR" ]; then
  echo "Setting up project from $PROJECT_DIR"
  
  # If project is in a subdirectory, move everything to root
  if [ "$PROJECT_DIR" != "." ]; then
    echo "Moving files from $PROJECT_DIR to root directory..."
    cp -r "$PROJECT_DIR"/* .
    cp -r "$PROJECT_DIR"/.[!.]* . 2>/dev/null || true
    echo "Files moved successfully"
  fi
  
  # Install dependencies
  echo "Installing dependencies..."
  npm install
  
  # Start the development server
  echo "Starting development server..."
  npm run dev
else
  echo "Error: Could not find package.json in any directory"
  exit 1
fi
