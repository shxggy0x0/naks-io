// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ParcelNFT.sol";

/**
 * @title LandRegistry
 * @dev Central registry for land parcel management and verification
 * @notice This contract manages the overall land registry system
 */
contract LandRegistry is Ownable, Pausable {
    using ECDSA for bytes32;

    // Struct for parcel registration
    struct ParcelRegistration {
        string canonicalKey;
        address owner;
        string state;
        string district;
        string surveyNo;
        string fmbId;
        uint256 verificationScore;
        bool isVerified;
        uint256 registeredAt;
        string ipfsCid;
    }

    // Struct for verification checkpoint
    struct VerificationCheckpoint {
        string merkleRoot;
        uint256 blockNumber;
        uint256 timestamp;
        address verifier;
    }

    // State variables
    ParcelNFT public parcelNFT;
    
    // Mapping from canonical key to parcel registration
    mapping(string => ParcelRegistration) public parcels;
    
    // Mapping from canonical key to verification checkpoints
    mapping(string => VerificationCheckpoint[]) public verificationCheckpoints;
    
    // Mapping for authorized verifiers
    mapping(address => bool) public authorizedVerifiers;
    
    // Mapping for KYC providers
    mapping(address => bool) public kycProviders;
    
    // Mapping for transfer approvals
    mapping(string => mapping(address => bool)) public transferApprovals;
    
    // Events
    event ParcelRegistered(
        string indexed canonicalKey,
        address indexed owner,
        string state,
        string district,
        string surveyNo,
        string fmbId,
        uint256 verificationScore
    );
    
    event ParcelVerified(
        string indexed canonicalKey,
        address indexed verifier,
        uint256 verificationScore,
        string ipfsCid
    );
    
    event VerificationCheckpointCreated(
        string indexed canonicalKey,
        string merkleRoot,
        uint256 blockNumber,
        address indexed verifier
    );
    
    event TransferApproved(
        string indexed canonicalKey,
        address indexed from,
        address indexed to,
        bool approved
    );
    
    event VerifierAuthorized(address indexed verifier, bool authorized);
    event KYCProviderAuthorized(address indexed provider, bool authorized);

    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[_msgSender()] || owner() == _msgSender(),
            "LandRegistry: caller is not authorized verifier"
        );
        _;
    }

    modifier onlyKYCProvider() {
        require(
            kycProviders[_msgSender()] || owner() == _msgSender(),
            "LandRegistry: caller is not authorized KYC provider"
        );
        _;
    }

    constructor(address _parcelNFT) {
        parcelNFT = ParcelNFT(_parcelNFT);
    }

    /**
     * @dev Register a new parcel
     */
    function registerParcel(
        string memory canonicalKey,
        string memory state,
        string memory district,
        string memory surveyNo,
        string memory fmbId,
        uint256 verificationScore,
        string memory ipfsCid
    ) external whenNotPaused {
        require(
            parcels[canonicalKey].registeredAt == 0,
            "LandRegistry: parcel already registered"
        );
        require(
            verificationScore >= 70,
            "LandRegistry: verification score too low"
        );

        parcels[canonicalKey] = ParcelRegistration({
            canonicalKey: canonicalKey,
            owner: _msgSender(),
            state: state,
            district: district,
            surveyNo: surveyNo,
            fmbId: fmbId,
            verificationScore: verificationScore,
            isVerified: false,
            registeredAt: block.timestamp,
            ipfsCid: ipfsCid
        });

        emit ParcelRegistered(
            canonicalKey,
            _msgSender(),
            state,
            district,
            surveyNo,
            fmbId,
            verificationScore
        );
    }

    /**
     * @dev Verify a parcel and mint NFT
     */
    function verifyParcel(
        string memory canonicalKey,
        string memory ipfsCid,
        string memory metadataHash,
        uint256 tokenId
    ) external onlyAuthorizedVerifier whenNotPaused {
        ParcelRegistration storage parcel = parcels[canonicalKey];
        require(
            parcel.registeredAt > 0,
            "LandRegistry: parcel not registered"
        );
        require(
            !parcel.isVerified,
            "LandRegistry: parcel already verified"
        );

        parcel.isVerified = true;

        // Create verification checkpoint
        VerificationCheckpoint memory checkpoint = VerificationCheckpoint({
            merkleRoot: metadataHash,
            blockNumber: block.number,
            timestamp: block.timestamp,
            verifier: _msgSender()
        });
        verificationCheckpoints[canonicalKey].push(checkpoint);

        emit ParcelVerified(canonicalKey, _msgSender(), parcel.verificationScore, ipfsCid);
        emit VerificationCheckpointCreated(
            canonicalKey,
            metadataHash,
            block.number,
            _msgSender()
        );
    }

    /**
     * @dev Approve transfer for a parcel
     */
    function approveTransfer(
        string memory canonicalKey,
        address from,
        address to,
        bool approved
    ) external onlyKYCProvider whenNotPaused {
        require(
            parcels[canonicalKey].registeredAt > 0,
            "LandRegistry: parcel not registered"
        );

        transferApprovals[canonicalKey][to] = approved;

        emit TransferApproved(canonicalKey, from, to, approved);
    }

    /**
     * @dev Check if transfer is approved
     */
    function isTransferApproved(
        string memory canonicalKey,
        address to
    ) external view returns (bool) {
        return transferApprovals[canonicalKey][to];
    }

    /**
     * @dev Get parcel information
     */
    function getParcelInfo(string memory canonicalKey) 
        external view returns (ParcelRegistration memory) {
        return parcels[canonicalKey];
    }

    /**
     * @dev Get verification checkpoints for a parcel
     */
    function getVerificationCheckpoints(string memory canonicalKey) 
        external view returns (VerificationCheckpoint[] memory) {
        return verificationCheckpoints[canonicalKey];
    }

    /**
     * @dev Get latest verification checkpoint for a parcel
     */
    function getLatestVerificationCheckpoint(string memory canonicalKey) 
        external view returns (VerificationCheckpoint memory) {
        require(
            verificationCheckpoints[canonicalKey].length > 0,
            "LandRegistry: no verification checkpoints found"
        );
        
        uint256 latestIndex = verificationCheckpoints[canonicalKey].length - 1;
        return verificationCheckpoints[canonicalKey][latestIndex];
    }

    /**
     * @dev Authorize a verifier
     */
    function setAuthorizedVerifier(address verifier, bool authorized) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
        emit VerifierAuthorized(verifier, authorized);
    }

    /**
     * @dev Authorize a KYC provider
     */
    function setKYCProvider(address provider, bool authorized) external onlyOwner {
        kycProviders[provider] = authorized;
        emit KYCProviderAuthorized(provider, authorized);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Check if a parcel is registered
     */
    function isParcelRegistered(string memory canonicalKey) external view returns (bool) {
        return parcels[canonicalKey].registeredAt > 0;
    }

    /**
     * @dev Check if a parcel is verified
     */
    function isParcelVerified(string memory canonicalKey) external view returns (bool) {
        return parcels[canonicalKey].isVerified;
    }

    /**
     * @dev Get total number of registered parcels
     */
    function getTotalParcels() external view returns (uint256) {
        // This would require tracking registered parcels in an array
        // For now, return 0 as this is a simplified implementation
        return 0;
    }
}
