# Naks.io Deployment Guide

This guide covers deploying the Naks.io Land Registry Platform to production.

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for frontend deployment)
- Polygon wallet with MATIC tokens
- Web3.Storage account
- Domain name (optional)

## 1. Supabase Production Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users
3. Set a strong database password
4. Wait for the project to be provisioned

### Configure Database

1. Go to the SQL Editor in your Supabase dashboard
2. Run the migration files in order:
   ```sql
   -- Run supabase/migrations/001_initial_schema.sql
   -- Run supabase/migrations/002_rls_policies.sql
   ```

### Set up Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `parcel-documents`
3. Set it to private (not public)
4. Configure the RLS policies for the bucket

### Get API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

## 2. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=your_supabase_database_url

# IPFS Configuration
WEB3_STORAGE_TOKEN=your_web3_storage_token
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_wallet_private_key

# Smart Contract Addresses (after deployment)
PARCEL_NFT_CONTRACT_ADDRESS=0x...
LAND_REGISTRY_CONTRACT_ADDRESS=0x...

# KYC Provider
PERSONA_API_KEY=your_persona_api_key
PERSONA_TEMPLATE_ID=your_persona_template_id

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@naks.io

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

## 3. Smart Contract Deployment

### Deploy to Polygon Testnet (Mumbai)

1. Install Hardhat:
   ```bash
   npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
   ```

2. Create `hardhat.config.js`:
   ```javascript
   require("@nomiclabs/hardhat-ethers");
   
   module.exports = {
     solidity: "0.8.19",
     networks: {
       mumbai: {
         url: "https://rpc-mumbai.maticvigil.com",
         accounts: [process.env.PRIVATE_KEY]
       },
       polygon: {
         url: "https://polygon-rpc.com",
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

3. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy.js --network mumbai
   ```

4. Update environment variables with deployed contract addresses

### Deploy to Polygon Mainnet

1. Get MATIC tokens for gas fees
2. Deploy with:
   ```bash
   npx hardhat run scripts/deploy.js --network polygon
   ```

3. Verify contracts on PolygonScan

## 4. Frontend Deployment (Vercel)

### Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure the following:
   - Framework Preset: Next.js
   - Root Directory: `.` (or leave empty)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Set Environment Variables

In Vercel dashboard, go to Settings > Environment Variables and add all your environment variables.

### Custom Domain (Optional)

1. Go to Settings > Domains in Vercel
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your domain

## 5. IPFS Configuration

### Web3.Storage Setup

1. Go to [web3.storage](https://web3.storage)
2. Create an account and get your API token
3. Add the token to your environment variables

### Pinata Setup (Alternative)

1. Go to [pinata.cloud](https://pinata.cloud)
2. Create an account and get API keys
3. Add the keys to your environment variables

## 6. Security Configuration

### SSL/TLS

- Vercel automatically provides SSL certificates
- Ensure all API endpoints use HTTPS

### CORS Configuration

Update your Supabase project settings:
1. Go to Settings > API
2. Add your production domain to allowed origins
3. Configure CORS policies

### Rate Limiting

Consider implementing rate limiting for:
- Authentication endpoints
- File upload endpoints
- API endpoints

## 7. Monitoring and Logging

### Error Tracking

1. Set up Sentry account
2. Add Sentry to your project:
   ```bash
   npm install @sentry/nextjs
   ```

3. Configure Sentry in `sentry.client.config.js` and `sentry.server.config.js`

### Analytics

1. Add Google Analytics or similar
2. Monitor user behavior and performance

### Database Monitoring

1. Use Supabase's built-in monitoring
2. Set up alerts for:
   - High error rates
   - Slow queries
   - Storage usage

## 8. Backup and Recovery

### Database Backups

1. Supabase automatically backs up your database
2. Consider additional backups for critical data
3. Test restore procedures

### File Storage Backups

1. Supabase Storage has built-in redundancy
2. Consider additional IPFS pinning services
3. Regular backup of critical documents

## 9. Testing Production

### Smoke Tests

1. Test user registration and login
2. Test parcel upload and verification
3. Test admin approval workflow
4. Test public parcel viewing

### Load Testing

1. Use tools like Artillery or k6
2. Test with realistic user loads
3. Monitor performance metrics

### Security Testing

1. Run security scans
2. Test authentication and authorization
3. Verify RLS policies are working

## 10. Go-Live Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Smart contracts deployed and verified
- [ ] Frontend deployed and accessible
- [ ] SSL certificates working
- [ ] Domain configured (if using custom domain)
- [ ] Monitoring and logging set up
- [ ] Backup procedures in place
- [ ] Security testing completed
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on production procedures

## 11. Post-Deployment

### Monitor Performance

1. Check application performance
2. Monitor error rates
3. Review user feedback

### Regular Maintenance

1. Update dependencies regularly
2. Monitor security advisories
3. Review and update documentation
4. Regular backup verification

### Scaling Considerations

1. Monitor database performance
2. Consider CDN for static assets
3. Implement caching strategies
4. Plan for horizontal scaling

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check RLS policies and environment variables
2. **File uploads failing**: Verify storage bucket configuration
3. **Smart contract calls failing**: Check RPC endpoints and gas settings
4. **IPFS uploads failing**: Verify API tokens and network connectivity

### Support

- Check Supabase documentation
- Review Vercel deployment logs
- Monitor browser console for errors
- Check network requests in browser dev tools

## Security Best Practices

1. Never commit private keys to version control
2. Use environment variables for all secrets
3. Regularly rotate API keys and passwords
4. Implement proper input validation
5. Use HTTPS everywhere
6. Keep dependencies updated
7. Monitor for security vulnerabilities
8. Implement proper logging and monitoring
