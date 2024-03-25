//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "../base/CustomChanIbcApp.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/**
 * @title nft-mint
 * @dev Implements minting process,
 * and ability to send cross-chain instruction to mint NFT on counterparty
 */
contract OptContract is ERC721, CustomChanIbcApp, ERC721Burnable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    // Base URI
    string private _baseURIextended;
    uint256 public tokenID;

    enum IbcPacketStatus {
        UNSENT,
        SENT,
        ACKED,
        TIMEOUT
    }

    address public chairperson;

    event AckNFTMint(
        bytes32 channelId,
        uint sequence,
        address indexed voter,
        uint voteNFTid
    );

    /**
     * @dev Create a new ballot to choose one of 'proposalNames' and make it IBC enabled to send proof of Vote to counterparty
     * @param _dispatcher vIBC dispatcher contract
     * @param proposalNames names of proposals
     */
    constructor(
        IbcDispatcher _dispatcher,
        bytes32[] memory proposalNames
    ) CustomChanIbcApp(_dispatcher) ERC721("JokeNFT", "JNFT") {
        chairperson = msg.sender;
    }

    // IBC methods

    /**
     * @dev Sends a packet with a greeting message over a specified channel.
     * @param channelId The ID of the channel to send the packet to.
     * @param timeoutSeconds The timeout in seconds (relative).
     * @param voterAddress the address of the voter
     * @param str recipient the address on the destination (Base) that will have NFT minted
     */
    function sendPacket(
        bytes32 channelId,
        uint64 timeoutSeconds,
        address voterAddress,
        string memory str
    ) external {
        string memory jokeFromId = str;
        address owner = voterAddress;
        bytes memory payload = abi.encode(owner, jokeFromId);

        uint64 timeoutTimestamp = uint64(
            (block.timestamp + timeoutSeconds) * 1000000000
        );

        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
    }

    function onRecvPacket(
        IbcPacket memory
    )
        external
        view
        override
        onlyIbcDispatcher
        returns (AckPacket memory ackPacket)
    {
        require(false, "This function should not be called");

        return
            AckPacket(
                true,
                abi.encode("Error: This function should not be called")
            );
    }

    function onAcknowledgementPacket(
        IbcPacket calldata packet,
        AckPacket calldata ack
    ) external override onlyIbcDispatcher {
        ackPackets.push(ack);

        // decode the ack data, find the address of the voter the packet belongs to and set ibcNFTMinted true
        (address voterAddress, uint256 voteNFTid) = abi.decode(
            ack.data,
            (address, uint256)
        );

        emit AckNFTMint(
            packet.src.channelId,
            packet.sequence,
            voterAddress,
            voteNFTid
        );
    }

    function onTimeoutPacket(
        IbcPacket calldata packet
    ) external override onlyIbcDispatcher {
        timeoutPackets.push(packet);
        // do logic
    }
}