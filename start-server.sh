#!/bin/bash

# Start Backend Server Script
echo "🚀 Starting Bandhnam Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating a sample .env file..."
    cat > .env << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bandhnam

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EOF
    echo "✅ Sample .env file created. Please update it with your actual values."
fi

# Start the server
echo "🎯 Starting server on port 3000..."
echo "📡 Backend will be available at: http://localhost:3000"
echo "🔍 Health check: http://localhost:3000/health"
echo "🧪 Test matches endpoint: http://localhost:3000/api/matches/test"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
