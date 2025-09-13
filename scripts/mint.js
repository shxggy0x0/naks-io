require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  // Validate environment variables
  const contractAddress = process.env.PARCEL_NFT_CONTRACT_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.POLYGON_RPC_URL;

  if (!contractAddress) { 
    throw new Error("Set PARCEL_NFT_CONTRACT_ADDRESS in .env.local"); 
  }
  if (!privateKey) { 
    throw new Error("Set PRIVATE_KEY in .env.local"); 
  }
  if (!rpcUrl) { 
    throw new Error("Set POLYGON_RPC_URL in .env.local"); 
  }

  console.log("🚀 Starting parcel minting process...");
  console.log("📍 Network RPC:", rpcUrl);
  console.log("📄 Contract Address:", contractAddress);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Check wallet balance
  const balance = await wallet.getBalance();
  console.log("💰 Wallet Balance:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.warn("⚠️  Low balance - ensure you have enough gas for the transaction");
  }

  // Contract ABI for the optimized mintParcel function
  const abi = [
    "function mintParcel(address to,string canonicalKey,string state,string district,string surveyNo,string fmbId,uint256 verificationScore,bool transferRestricted,bool kycRequired,string ipfsCid,string metadataHash) external returns (uint256)",
    "function canonicalKeyExists(string canonicalKey) external view returns (bool)",
    "function totalSupply() external view returns (uint256)",
    "event ParcelMinted(uint256 indexed tokenId, bytes32 indexed canonicalKeyHash, address indexed owner, string ipfsCid, uint256 verificationScore)"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Sample parcel data - customize as needed
  const to = await wallet.getAddress();
  const canonicalKey = "KA|BHOOMI|BANGALORE|URBAN|123/4|FMB001"; // deterministic key
  const state = "Karnataka";
  const district = "Bangalore Urban";
  const surveyNo = "123/4";
  const fmbId = "FMB001";
  const verificationScore = 85;
  const transferRestricted = true;
  const kycRequired = true;
  const ipfsCid = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"; // example IPFS CID
  const metadataHash = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"; // example hash

  console.log("\n📋 Parcel Details:");
  console.log("   Recipient:", to);
  console.log("   Canonical Key:", canonicalKey);
  console.log("   Location:", `${district}, ${state}`);
  console.log("   Survey No:", surveyNo);
  console.log("   FMB ID:", fmbId);
  console.log("   Verification Score:", verificationScore);
  console.log("   Transfer Restricted:", transferRestricted);
  console.log("   KYC Required:", kycRequired);

  try {
    // Check if parcel already exists
    const exists = await contract.canonicalKeyExists(canonicalKey);
    if (exists) {
      throw new Error(`Parcel with canonical key "${canonicalKey}" already exists!`);
    }

    // Get current total supply for reference
    const currentSupply = await contract.totalSupply();
    console.log("\n📊 Current Total Supply:", currentSupply.toString());

    console.log("\n⛽ Estimating gas...");
    const gasEstimate = await contract.estimateGas.mintParcel(
      to, canonicalKey, state, district, surveyNo, fmbId, 
      verificationScore, transferRestricted, kycRequired, ipfsCid, metadataHash
    );
    console.log("   Estimated Gas:", gasEstimate.toString());

    console.log("\n🔨 Minting parcel...");
    const tx = await contract.mintParcel(
      to, canonicalKey, state, district, surveyNo, fmbId, 
      verificationScore, transferRestricted, kycRequired, ipfsCid, metadataHash,
      { 
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
        // gasPrice: ethers.utils.parseUnits('30', 'gwei') // uncomment to set custom gas price
      }
    );
    
    console.log("✅ Transaction submitted!");
    console.log("   Tx Hash:", tx.hash);
    console.log("   Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("\n🎉 Transaction confirmed!");
    console.log("   Block Number:", receipt.blockNumber);
    console.log("   Gas Used:", receipt.gasUsed.toString());
    console.log("   Transaction Hash:", receipt.transactionHash);
    
    // Extract tokenId from events
    const mintEvent = receipt.events?.find(e => e.event === 'ParcelMinted');
    if (mintEvent) {
      const tokenId = mintEvent.args.tokenId;
      const canonicalKeyHash = mintEvent.args.canonicalKeyHash;
      console.log("   🏷️  Token ID:", tokenId.toString());
      console.log("   🔑 Canonical Key Hash:", canonicalKeyHash);
      console.log("   🔗 View on explorer:", `https://amoy.polygonscan.com/tx/${receipt.transactionHash}`);
    }

  } catch (error) {
    console.error("\n❌ Error during minting:");
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.error("   Transaction would fail - check contract state and parameters");
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error("   Insufficient funds for gas");
    } else {
      console.error("   ", error.message);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("\n💥 Script failed:", error.message);
  process.exit(1);
});
