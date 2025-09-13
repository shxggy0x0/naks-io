// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ParcelNFT
 * @dev ERC-721 token representing verified land parcels
 */
contract ParcelNFT is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct ParcelInfo {
        string canonicalKey;        // full canonical key (for display)
        string state;
        string district;
        string surveyNo;
        string fmbId;
        uint256 verificationScore;
        bool transferRestricted;
        bool kycRequired;
        uint256 createdAt;
    }

    mapping(uint256 => ParcelInfo) public parcels;
    // map hash(canonicalKey) -> tokenId. 0 means not exists.
    mapping(bytes32 => uint256) public canonicalKeyHashToTokenId;
    mapping(uint256 => string) public tokenMetadataHash;
    mapping(address => bool) public approvedAddresses;

    event ParcelMinted(
        uint256 indexed tokenId,
        bytes32 indexed canonicalKeyHash,
        address indexed owner,
        string ipfsCid,
        uint256 verificationScore
    );

    event TransferRestrictionUpdated(uint256 indexed tokenId, bool restricted);
    event KYCRequirementUpdated(uint256 indexed tokenId, bool required);
    event MetadataUpdated(uint256 indexed tokenId, string newIpfsCid);
    event ApprovedAddressUpdated(address indexed account, bool approved);

    modifier onlyOwnerOrApproved() {
        require(owner() == _msgSender() || approvedAddresses[_msgSender()], "Not owner/approved");
        _;
    }

    modifier transferAllowed(uint256 tokenId) {
        require(!parcels[tokenId].transferRestricted || approvedAddresses[_msgSender()], "Transfers restricted");
        _;
    }

    constructor() ERC721("Naks Land Parcel", "NAKSP") {
        // start counter at 0; we increment before mint to ensure tokenId >= 1
    }

    /**
     * @notice Mint a new parcel NFT. Call from backend/admin/owner/approved.
     * @param to recipient
     * @param canonicalKey full canonical key string (we hash it internally)
     * @param state, district, surveyNo, fmbId, verificationScore, transferRestricted, kycRequired
     * @param ipfsCid metadata URI (ipfs://...)
     * @param metadataHash hash of metadata (optional verification)
     */
    function mintParcel(
        address to,
        string calldata canonicalKey,
        string calldata state,
        string calldata district,
        string calldata surveyNo,
        string calldata fmbId,
        uint256 verificationScore,
        bool transferRestricted,
        bool kycRequired,
        string calldata ipfsCid,
        string calldata metadataHash
    ) external onlyOwnerOrApproved whenNotPaused returns (uint256) {
        require(verificationScore >= 70, "verification score too low");

        bytes32 keyHash = keccak256(bytes(canonicalKey));
        require(canonicalKeyHashToTokenId[keyHash] == 0, "parcel already tokenized");

        // increment first so first tokenId = 1 (0 reserved for "not exists")
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsCid);

        parcels[tokenId] = ParcelInfo({
            canonicalKey: canonicalKey,
            state: state,
            district: district,
            surveyNo: surveyNo,
            fmbId: fmbId,
            verificationScore: verificationScore,
            transferRestricted: transferRestricted,
            kycRequired: kycRequired,
            createdAt: block.timestamp
        });

        canonicalKeyHashToTokenId[keyHash] = tokenId;
        tokenMetadataHash[tokenId] = metadataHash;

        emit ParcelMinted(tokenId, keyHash, to, ipfsCid, verificationScore);
        return tokenId;
    }

    function setTransferRestriction(uint256 tokenId, bool restricted) external onlyOwnerOrApproved {
        parcels[tokenId].transferRestricted = restricted;
        emit TransferRestrictionUpdated(tokenId, restricted);
    }

    function setKYCRequirement(uint256 tokenId, bool required) external onlyOwnerOrApproved {
        parcels[tokenId].kycRequired = required;
        emit KYCRequirementUpdated(tokenId, required);
    }

    function updateMetadata(uint256 tokenId, string calldata newIpfsCid, string calldata newMetadataHash) external onlyOwnerOrApproved {
        _setTokenURI(tokenId, newIpfsCid);
        tokenMetadataHash[tokenId] = newMetadataHash;
        emit MetadataUpdated(tokenId, newIpfsCid);
    }

    function setApprovedAddress(address account, bool approved) external onlyOwner {
        approvedAddresses[account] = approved;
        emit ApprovedAddressUpdated(account, approved);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function getParcelInfo(uint256 tokenId) external view returns (ParcelInfo memory) {
        require(_exists(tokenId), "token not exist");
        return parcels[tokenId];
    }

    function getTokenIdByCanonicalKey(string calldata canonicalKey) external view returns (uint256) {
        return canonicalKeyHashToTokenId[keccak256(bytes(canonicalKey))];
    }

    function canonicalKeyExists(string calldata canonicalKey) external view returns (bool) {
        return canonicalKeyHashToTokenId[keccak256(bytes(canonicalKey))] != 0;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (from != address(0)) {
            require(!parcels[tokenId].transferRestricted || approvedAddresses[_msgSender()], "Transfers restricted");
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal override transferAllowed(tokenId) {
        super._transfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
