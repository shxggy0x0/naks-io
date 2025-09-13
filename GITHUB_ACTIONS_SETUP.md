# 🚀 GitHub Actions Setup for Automated Deployment

This guide explains how to set up automated deployment to Polygon Amoy testnet using GitHub Actions.

## 📋 Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repository
2. **Polygon Amoy RPC URL** - Get from Alchemy or use public RPC
3. **Private Key** - Testnet account private key (starts with `0x`)
4. **Testnet MATIC** - Get from faucet for deployment

## 🔧 Setup Steps

### 1. **Get Required Credentials**

#### **Polygon Amoy RPC URL**
- **Alchemy**: https://www.alchemy.com/ → Create app → Polygon → Amoy
- **Public RPC**: `https://rpc-amoy.polygon.technology`
- **Format**: `https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY`

#### **Private Key**
- Export from MetaMask or any wallet
- **⚠️ Use testnet account only!**
- Format: `0x1234567890abcdef...`

#### **Testnet MATIC**
- **Faucet**: https://faucet.polygon.technology/
- **Alchemy Faucet**: https://www.alchemy.com/faucets/polygon-amoy
- **Amount needed**: ~0.1-0.5 MATIC

### 2. **Configure GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `POLYGON_AMOY_RPC` | `https://polygon-amoy.g.alchemy.com/v2/your_key` | RPC URL for Amoy testnet |
| `PRIVATE_KEY` | `0xyour_private_key_here` | Private key for deployment account |

### 3. **Workflow Triggers**

The workflow will run:
- **Manual trigger**: Go to Actions tab → "Compile & Deploy to Polygon Amoy" → "Run workflow"
- **On push to main**: Automatically when you push to main branch

### 4. **Deployment Process**

1. **Checkout code** from repository
2. **Install dependencies** using `npm ci`
3. **Compile contracts** using `npx hardhat compile`
4. **Deploy contracts** to Amoy testnet
5. **Save addresses** to `deployed-addresses.json`
6. **Upload artifacts** for download

## 📁 Files Created

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `scripts/deploy-with-output.js` - Enhanced deployment script
- `deployed-addresses.json` - Contract addresses (generated)

## 🔍 Monitoring Deployment

### **View Logs**
1. Go to GitHub repository
2. Click "Actions" tab
3. Click on the latest workflow run
4. Click on "build-and-deploy" job
5. View step-by-step logs

### **Download Artifacts**
1. Go to workflow run page
2. Scroll to "Artifacts" section
3. Download "deployed-addresses" artifact
4. Extract `deployed-addresses.json`

## 🔧 Using Deployed Addresses

After successful deployment, update your `.env.local`:

```bash
# Copy from deployed-addresses.json
PARCEL_NFT_CONTRACT_ADDRESS=0x1234...
LAND_REGISTRY_CONTRACT_ADDRESS=0x5678...
```

## 🚨 Troubleshooting

### **Common Issues**

1. **"Insufficient funds"**
   - Get more testnet MATIC from faucet
   - Check if account has enough balance

2. **"Invalid private key"**
   - Ensure private key starts with `0x`
   - Check for extra spaces or characters

3. **"Network not found"**
   - Verify `hardhat.config.js` has amoy network
   - Check RPC URL is correct

4. **"Contract deployment failed"**
   - Check gas limit settings
   - Verify contract code compiles

### **Debug Steps**

1. **Check workflow logs** for detailed error messages
2. **Verify secrets** are set correctly
3. **Test locally** with same environment variables
4. **Check network status** on Polygon

## 🔗 Useful Links

- **Amoy Faucet**: https://faucet.polygon.technology/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Amoy Explorer**: https://amoy.polygonscan.com/
- **GitHub Actions**: https://github.com/features/actions

## ⚠️ Security Notes

1. **Never commit private keys** to repository
2. **Use testnet accounts** for development
3. **Rotate secrets** regularly
4. **Monitor workflow runs** for unauthorized access
5. **Use environment-specific accounts**

---

**Ready to deploy?** Push to main branch or manually trigger the workflow!
