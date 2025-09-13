@echo off
echo 🚀 Setting up Naks.io Land Registry Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Copy environment file
if not exist .env.local (
    echo 📝 Creating environment file...
    copy env.example .env.local
    echo ⚠️  Please update .env.local with your actual values
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env.local with your actual values
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3000
echo.
echo Default credentials:
echo Admin: admin@naks.io / admin123
echo User: user@example.com / user123
echo.
pause
