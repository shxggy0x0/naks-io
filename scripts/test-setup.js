#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Naks.io setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  '.env.local',
  'app/layout.tsx',
  'app/page.tsx',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/verification/parcel-verification.ts',
  'lib/ipfs/ipfs-client.ts',
  'contracts/ParcelNFT.sol',
  'contracts/LandRegistry.sol',
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_rls_policies.sql'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if .env.local has required variables
console.log('\n🔧 Checking environment variables...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`⚠️  ${varName} - needs to be configured`);
    }
  });
} else {
  console.log('❌ .env.local file not found');
  allFilesExist = false;
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script} script`);
    } else {
      console.log(`❌ ${script} script - MISSING`);
      allFilesExist = false;
    }
  });
}

console.log('\n📊 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 Ready to run: npm run dev');
  console.log('🌐 Visit: http://localhost:3000');
  console.log('\nDefault credentials:');
  console.log('Admin: admin@naks.io / admin123');
  console.log('User: user@example.com / user123');
} else {
  console.log('❌ Some files are missing or need configuration');
  console.log('Please run the setup script again or check the missing files');
}

console.log('\n🔗 Useful commands:');
console.log('npm run dev          - Start development server');
console.log('npm run build        - Build for production');
console.log('npm run lint         - Run linter');
console.log('supabase start       - Start Supabase locally');
console.log('supabase db reset    - Reset database');
console.log('npm run db:generate  - Generate TypeScript types');
