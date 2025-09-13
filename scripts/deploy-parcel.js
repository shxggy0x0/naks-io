const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`🚀 Deploying ParcelNFT contract to ${network} network...`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  const balanceFormatted = hre.ethers.utils.formatEther(balance);
  console.log("💰 Account balance:", balanceFormatted, network === 'localhost' ? 'ETH' : 'MATIC');

  // Check if balance is sufficient
  if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
    console.log("⚠️  WARNING: Low balance! You may need more MATIC for deployment.");
    if (network === 'amoy') {
      console.log("💡 Get testnet MATIC from: https://faucet.polygon.technology/");
      console.log("💡 Alternative faucet: https://www.alchemy.com/faucets/polygon-amoy");
    }
  }

  // Deploy ParcelNFT contract
  console.log("📄 Deploying ParcelNFT...");
  const ParcelNFT = await hre.ethers.getContractFactory("ParcelNFT");
  const parcelNFT = await ParcelNFT.deploy();
  
  await parcelNFT.deployed();
  
  console.log("✅ ParcelNFT deployed successfully!");
  console.log("📍 Contract address:", parcelNFT.address);
  console.log("🔗 Transaction hash:", parcelNFT.deployTransaction.hash);
  
  // Set the deployer as an approved address (for minting)
  console.log("🔐 Setting deployer as approved address...");
  const approveTx = await parcelNFT.setApprovedAddress(deployer.address, true);
  await approveTx.wait();
  console.log("✅ Deployer approved for minting");
  
  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log("Contract Name: ParcelNFT");
  console.log("Network:", network);
  console.log("Contract Address:", parcelNFT.address);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used:", parcelNFT.deployTransaction.gasLimit.toString());
  
  console.log("\n🔧 Next Steps:");
  console.log("===============");
  console.log("1. Copy the contract address above");
  console.log("2. Set PARCEL_NFT_CONTRACT_ADDRESS in your .env.local:");
  console.log(`   PARCEL_NFT_CONTRACT_ADDRESS=${parcelNFT.address}`);
  
  if (network === 'amoy') {
    console.log("3. View on Amoy PolygonScan:");
    console.log(`   https://amoy.polygonscan.com/address/${parcelNFT.address}`);
    console.log("4. Run the mint script:");
    console.log("   npx hardhat run --network amoy scripts/mint.js");
  } else if (network === 'localhost') {
    console.log("3. Run the mint script:");
    console.log("   npx hardhat run --network localhost scripts/mint.js");
  }
  
  return parcelNFT.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment complete! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });

