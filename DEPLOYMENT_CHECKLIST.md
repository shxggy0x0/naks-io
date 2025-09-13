# 🚀 Naks.io Deployment Checklist

## Quick Setup Guide

### 1. **Environment Variables Setup**

Update your `.env.local` file with the following **REQUIRED** variables:

```bash
# Blockchain Configuration (REQUIRED for deployment)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
# OR use Alchemy: https://polygon-amoy.g.alchemy.com/v2/your_alchemy_key
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=0xyour_private_key_here

# Contract Verification (Optional but recommended)
ETHERSCAN_API_KEY=your_polygonscan_api_key

# Smart Contract Addresses (After deployment)
PARCEL_NFT_CONTRACT_ADDRESS=0x...
LAND_REGISTRY_CONTRACT_ADDRESS=0x...

# Supabase Configuration (Required for app)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# IPFS Configuration (Required for file storage)
WEB3_STORAGE_TOKEN=your_web3_storage_token
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Other configurations...
DATABASE_URL=your_supabase_database_url
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 2. **Get Required API Keys**

#### **Alchemy API Key** (Required)
1. Go to [alchemy.com](https://www.alchemy.com/)
2. Create a new app
3. Select "Polygon" → "Amoy" testnet
4. Copy the API key
5. Use format: `https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY`

#### **Private Key** (Required)
1. Use MetaMask or any wallet
2. Export private key (starts with `0x`)
3. **⚠️ NEVER commit this to version control!**

#### **PolygonScan API Key** (Optional)
1. Go to [polygonscan.com/apis](https://polygonscan.com/apis)
2. Create account and get API key
3. Used for contract verification

### 3. **Get Testnet MATIC**

#### **Amoy Testnet MATIC**
- **Primary Faucet**: https://faucet.polygon.technology/
- **Alchemy Faucet**: https://www.alchemy.com/faucets/polygon-amoy
- **Amount needed**: ~0.1-0.5 MATIC (for deployment)

### 4. **Deploy Smart Contracts**

#### **Deploy to Amoy Testnet**
```bash
# Deploy ParcelNFT contract
npx hardhat run scripts/deploy-parcel.js --network amoy

# Deploy LandRegistry contract (if you have one)
npx hardhat run scripts/deploy.js --network amoy
```

#### **Deploy to Local Network** (for testing)
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy-parcel.js --network localhost
```

### 5. **Update Environment Variables**

After deployment, update your `.env.local` with the deployed contract addresses:

```bash
PARCEL_NFT_CONTRACT_ADDRESS=0x1234... # From deployment output
LAND_REGISTRY_CONTRACT_ADDRESS=0x5678... # From deployment output
```

### 6. **Verify Deployment**

#### **Check on PolygonScan**
- Amoy: https://amoy.polygonscan.com/address/YOUR_CONTRACT_ADDRESS
- Mainnet: https://polygonscan.com/address/YOUR_CONTRACT_ADDRESS

#### **Test Contract Functions**
```bash
# Test minting (if you have a mint script)
npx hardhat run scripts/mint.js --network amoy
```

## 🔧 Troubleshooting

### **Common Issues**

1. **"Insufficient funds" error**
   - Get more testnet MATIC from faucet
   - Check if you're using the right network

2. **"Invalid private key" error**
   - Ensure private key starts with `0x`
   - Check for extra spaces or characters

3. **"Network not found" error**
   - Verify your `hardhat.config.js` has the mumbai network
   - Check your RPC URL is correct

4. **"Contract deployment failed"**
   - Check gas limit settings
   - Verify contract code compiles without errors

### **Network Configurations**

Your `hardhat.config.js` should include:

```javascript
networks: {
  amoy: {
    url: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 80002,
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 137,
  },
}
```

## 📋 Pre-Deployment Checklist

- [ ] Alchemy API key obtained
- [ ] Private key ready (testnet account)
- [ ] Testnet MATIC obtained (0.1+ MATIC)
- [ ] `.env.local` file updated with real values
- [ ] Hardhat dependencies installed (`npm install`)
- [ ] Contracts compile successfully (`npx hardhat compile`)
- [ ] Network configuration correct in `hardhat.config.js`

## 🚀 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Contract address copied to `.env.local`
- [ ] Contract verified on PolygonScan (optional)
- [ ] Test contract functions work
- [ ] Frontend can connect to deployed contract
- [ ] All environment variables set correctly

## 🔗 Useful Links

- **Amoy Faucet**: https://faucet.polygon.technology/
- **Alchemy Amoy Faucet**: https://www.alchemy.com/faucets/polygon-amoy
- **Amoy PolygonScan**: https://amoy.polygonscan.com/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Polygon Documentation**: https://docs.polygon.technology/

## ⚠️ Security Notes

1. **Never commit private keys** to version control
2. **Use testnet accounts** for development
3. **Keep API keys secure** and rotate regularly
4. **Test thoroughly** before mainnet deployment
5. **Use environment variables** for all sensitive data

---

**Ready to deploy?** Run: `npx hardhat run scripts/deploy-parcel.js --network amoy`
