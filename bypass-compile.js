// Bypass compilation workaround for Node.js v22 + Hardhat v2.17.3
const fs = require('fs');
const path = require('path');

// Create artifacts directory structure
const artifactsDir = path.join(__dirname, 'artifacts', 'contracts');
const parcelNFTDir = path.join(artifactsDir, 'ParcelNFT.sol');

// Create directories
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}
if (!fs.existsSync(parcelNFTDir)) {
    fs.mkdirSync(parcelNFTDir, { recursive: true });
}

// Minimal ABI for deployment (you'll need the full bytecode for actual deployment)
const minimalArtifact = {
    "_format": "hh-sol-artifact-1",
    "contractName": "ParcelNFT",
    "sourceName": "contracts/ParcelNFT.sol",
    "abi": [
        "function mintParcel(address to,string canonicalKey,string state,string district,string surveyNo,string fmbId,uint256 verificationScore,bool transferRestricted,bool kycRequired,string ipfsCid,string metadataHash) external returns (uint256)",
        "function setApprovedAddress(address account, bool approved) external",
        "function totalSupply() external view returns (uint256)",
        "function canonicalKeyExists(string canonicalKey) external view returns (bool)",
        "constructor()"
    ],
    "bytecode": "0x608060405234801561001057600080fd5b50600080fd5b", // Placeholder - need actual bytecode
    "deployedBytecode": "0x608060405234801561001057600080fd5b50600080fd5b",
    "linkReferences": {},
    "deployedLinkReferences": {}
};

fs.writeFileSync(
    path.join(parcelNFTDir, 'ParcelNFT.json'),
    JSON.stringify(minimalArtifact, null, 2)
);

console.log("✅ Bypass artifacts created!");
console.log("⚠️  This is a temporary workaround. You need to:");
console.log("1. Downgrade to Node.js v20.x for full functionality");
console.log("2. Or use a different machine/environment with compatible Node.js");

