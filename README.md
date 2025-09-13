# Naks.io - Land Registry & Tokenization Platform

A production-grade prototype that verifies land parcels using Bhoomi/FMB data, stores authoritative proofs, and mints ERC-721 tokens for verified parcels on Polygon blockchain.

## Features

- **Land Parcel Verification**: Upload and verify Bhoomi JSON and FMB GeoJSON data
- **IPFS Integration**: Store metadata and documents on IPFS for decentralized access
- **Blockchain Tokenization**: Mint ERC-721 tokens for verified land parcels
- **Admin Dashboard**: Review and approve parcel submissions
- **Row Level Security**: Secure data access with Supabase RLS
- **Public Viewer**: View verified parcels and their metadata

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Authentication**: Supabase Auth with cookie-based sessions
- **Blockchain**: Polygon PoS, Web3.js
- **IPFS**: Web3.Storage for metadata pinning
- **Database**: PostgreSQL with PostGIS extension

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd naks-io
npm install
```

### 2. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase locally
supabase start

# Apply migrations
supabase db reset

# Generate types
npm run db:generate
```

### 3. Environment Variables

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `WEB3_STORAGE_TOKEN` - Web3.Storage API token
- `POLYGON_RPC_URL` - Polygon RPC endpoint
- `PRIVATE_KEY` - Wallet private key for contract interactions

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 5. Test with HTTPS (for production demo)

```bash
# Install ngrok
npm install -g ngrok

# In another terminal, expose your local server
ngrok http 3000
```

Use the HTTPS URL provided by ngrok for testing.

## Default Credentials

The seed data includes test accounts:

- **Admin**: `admin@naks.io` / `admin123`
- **User**: `user@example.com` / `user123`

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Home page
├── components/            # React components
├── contracts/             # Smart contracts
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── verification/     # Parcel verification logic
│   └── ipfs/             # IPFS integration
├── supabase/              # Database migrations and config
└── public/                # Static assets
```

## Key Components

### Parcel Verification

The verification system validates land parcel data by:

1. **Data Validation**: Ensures Bhoomi and FMB data meet required format
2. **Field Matching**: Compares state, district, survey number between sources
3. **Area Verification**: Validates area measurements with configurable tolerance
4. **Geometry Validation**: Ensures GeoJSON polygon is valid and closed
5. **Integrity Scoring**: Generates 0-100 score based on verification results

### Smart Contracts

- **ParcelNFT.sol**: ERC-721 token for land parcels with transfer restrictions
- **LandRegistry.sol**: Central registry for parcel management and verification

### Database Schema

- **profiles**: User accounts and roles
- **parcels**: Land parcel data and verification status
- **parcel_metadata**: IPFS CIDs and document URLs
- **tokens**: NFT token information
- **owners**: Token ownership records
- **transfers**: Transfer history
- **audit_logs**: System audit trail

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout

### Parcel Management
- `GET /api/parcels` - List user's parcels
- `POST /api/parcels` - Upload new parcel
- `GET /api/parcels/[id]` - Get parcel details
- `PUT /api/parcels/[id]` - Update parcel status (admin)

### Admin
- `GET /api/admin/parcels` - List all parcels
- `PUT /api/admin/parcels/[id]/verify` - Verify parcel
- `PUT /api/admin/parcels/[id]/reject` - Reject parcel

## Deployment

### Supabase Production

1. Create a new Supabase project
2. Run migrations: `supabase db push`
3. Update environment variables with production URLs
4. Set up RLS policies in production

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contract Deployment

1. Deploy contracts to Polygon testnet/mainnet
2. Update contract addresses in environment variables
3. Verify contracts on PolygonScan

## Security Considerations

- **RLS Policies**: All database access is protected by Row Level Security
- **Input Validation**: All user inputs are validated and sanitized
- **File Upload Security**: Document uploads are restricted to specific file types
- **Authentication**: Secure cookie-based sessions with CSRF protection
- **Private Keys**: Never commit private keys to version control

## Monitoring and Logging

- **Audit Logs**: All admin actions are logged with user and timestamp
- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Database query optimization and indexing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
# Trigger workflow
