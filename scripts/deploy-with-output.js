const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  console.log(`🚀 Deploying contracts to ${network} network...`);
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  const balanceFormatted = hre.ethers.utils.formatEther(balance);
  console.log("💰 Account balance:", balanceFormatted, network === 'localhost' ? 'ETH' : 'MATIC');

  const deployedAddresses = {};

  try {
    // Deploy ParcelNFT contract
    console.log("📄 Deploying ParcelNFT...");
    const ParcelNFT = await hre.ethers.getContractFactory("ParcelNFT");
    const parcelNFT = await ParcelNFT.deploy();
    await parcelNFT.deployed();
    
    console.log("✅ ParcelNFT deployed successfully!");
    console.log("📍 Contract address:", parcelNFT.address);
    
    deployedAddresses.ParcelNFT = parcelNFT.address;
    
    // Set the deployer as an approved address (for minting)
    console.log("🔐 Setting deployer as approved address...");
    const approveTx = await parcelNFT.setApprovedAddress(deployer.address, true);
    await approveTx.wait();
    console.log("✅ Deployer approved for minting");

    // Deploy LandRegistry contract if it exists
    try {
      console.log("📄 Deploying LandRegistry...");
      const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
      const landRegistry = await LandRegistry.deploy();
      await landRegistry.deployed();
      
      console.log("✅ LandRegistry deployed successfully!");
      console.log("📍 Contract address:", landRegistry.address);
      
      deployedAddresses.LandRegistry = landRegistry.address;
    } catch (error) {
      console.log("⚠️  LandRegistry deployment skipped:", error.message);
    }

    // Save deployed addresses to file
    const output = {
      network: network,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedAddresses
    };

    fs.writeFileSync('deployed-addresses.json', JSON.stringify(output, null, 2));
    console.log("📄 Deployed addresses saved to deployed-addresses.json");

    console.log("\n📋 Deployment Summary:");
    console.log("======================");
    console.log("Network:", network);
    console.log("Deployer:", deployer.address);
    console.log("Contracts:");
    Object.entries(deployedAddresses).forEach(([name, address]) => {
      console.log(`  ${name}: ${address}`);
    });

    return deployedAddresses;

  } catch (error) {
    console.error("💥 Deployment failed:", error);
    throw error;
  }
}

main()
  .then((addresses) => {
    console.log(`\n🎉 Deployment complete!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  });
