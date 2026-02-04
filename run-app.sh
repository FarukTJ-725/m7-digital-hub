#!/bin/bash

# Kill any existing processes on ports 3000 and 5001
echo "🛑 Stopping any existing servers..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# Start the mock server (in-memory, no MongoDB needed)
echo "🚀 Starting Mock Server on port 5001..."
cd server && node mock-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start the client
echo "🎨 Starting Client on port 5173..."
cd client && npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ M7 Digital Hub is running!"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
wait
