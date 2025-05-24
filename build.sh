#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Build backend
echo "Building backend..."
cd ../backend
npm install
npm run build

# Copy frontend build to backend
echo "Copying frontend build to backend..."
cp -r ../frontend/build ./dist/

echo "Build complete!" 