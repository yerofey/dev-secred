// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecretChats {
    address payable public owner;
    uint256 public chatCreationFee;

    struct Message {
        string encryptedMessage;
        uint256 timestamp;
    }

    struct ChatRoom {
        string idHash;
        Message[] messages;
    }

    mapping(string => ChatRoom) private chatRooms;

    event ChatRoomCreated(string indexed idHash);
    event MessageSent(string indexed chatRoomId);
    event ChatCreationFeeUpdated(uint256 newFee);

    constructor(uint256 _chatCreationFee) {
        owner = payable(msg.sender);
        chatCreationFee = _chatCreationFee;

        emit ChatCreationFeeUpdated(_chatCreationFee);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function createChatRoom(string memory idHash) public payable {
        require(msg.value >= chatCreationFee, "Insufficient fee for creating a chat room");
        require(bytes(chatRooms[idHash].idHash).length == 0, "Chat room already exists");

        chatRooms[idHash].idHash = idHash;

        emit ChatRoomCreated(idHash);
    }

    function sendMessage(string memory chatRoomId, string memory encryptedMessage) public {
        require(bytes(chatRooms[chatRoomId].idHash).length != 0, "Chat room does not exist");

        chatRooms[chatRoomId].messages.push(Message({
            encryptedMessage: encryptedMessage,
            timestamp: block.timestamp
        }));

        emit MessageSent(chatRoomId);
    }

    function getMessages(string memory chatRoomId) public view returns (Message[] memory) {
        require(bytes(chatRooms[chatRoomId].idHash).length != 0, "Chat room does not exist");

        return chatRooms[chatRoomId].messages;
    }

    function updateChatCreationFee(uint256 newFee) public onlyOwner {
        chatCreationFee = newFee;
        emit ChatCreationFeeUpdated(newFee);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract balance is zero");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
