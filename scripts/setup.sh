#!/bin/bash

# Naks.io Setup Script
echo "🚀 Setting up Naks.io Land Registry Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Start Supabase
echo "🗄️  Starting Supabase..."
supabase start

# Apply migrations
echo "🔄 Applying database migrations..."
supabase db reset

# Generate types
echo "🔧 Generating TypeScript types..."
npm run db:generate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual values"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "Default credentials:"
echo "Admin: admin@naks.io / admin123"
echo "User: user@example.com / user123"
