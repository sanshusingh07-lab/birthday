#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "--- Installing frontend dependencies and building UI ---"
cd frontend
npm install
npm run build
cd ..

echo "--- Installing Python backend dependencies ---"
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "--- Render build complete! ---"

