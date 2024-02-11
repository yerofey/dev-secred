// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecretNotes {
    address payable public owner;
    uint256 public noteAdditionFee;

    struct Note {
        string encryptedNote;
        address owner;
        mapping(string => ShareInfo) shares;
        string[] shareIDs;
        uint256 accessFee;
        uint256 createdTimestamp;
    }

    struct ShareInfo {
        string encryptedContentForShare;
        uint256 expirityTime;
    }

    mapping(string => Note) private notes;
    mapping(address => string[]) private ownerNoteIds;
    mapping(string => address) private noteOwners;
    mapping(string => uint256) private noteEarnings;
    mapping(string => string) private noteIDByShareID;

    event NoteAdded(string indexed noteId, address indexed owner, uint256 fee, uint256 timestamp);
    event NoteAdditionFeeUpdated(uint256 newFee);
    event NoteAccessed(string indexed noteId, address indexed requester);
    event NoteAccessFeeUpdated(string indexed noteId, uint256 newFee);
    event ShareIDAdded(string indexed noteId, string shareId, uint256 expirityTime);
    event ShareIDExtended(string indexed noteId, string shareId, uint256 newExpirityTime);
    event ShareIDRemoved(string noteId, string shareId, address indexed owner);
    event EarningsWithdrawn(string indexed noteId, address indexed owner, uint256 amount);

    constructor(uint256 _noteAdditionFee) {
        owner = payable(msg.sender);
        noteAdditionFee = _noteAdditionFee;

        emit NoteAdditionFeeUpdated(_noteAdditionFee);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier onlyNoteOwner(string memory noteId) {
        require(msg.sender == notes[noteId].owner, "Only the note owner can perform this action.");
        _;
    }

    receive() external payable {}

    function addNote(string memory noteId, string memory encryptedNote) public payable {
        require(msg.value >= noteAdditionFee, "Insufficient fee for adding a note");
        require(bytes(notes[noteId].encryptedNote).length == 0, "Note already exists");

        Note storage newNote = notes[noteId];
        newNote.encryptedNote = encryptedNote;
        newNote.owner = msg.sender;
        newNote.createdTimestamp = block.timestamp;

        ownerNoteIds[msg.sender].push(noteId);

        emit NoteAdded(noteId, msg.sender, msg.value, block.timestamp);
    }

    function addShareID(string memory noteId, string memory shareId, string memory encryptedContentForShare, uint256 expiryDuration) public payable onlyNoteOwner(noteId) {
        // require(msg.value >= noteAccessFee, "Insufficient fee for adding a share ID");
        ShareInfo storage share = notes[noteId].shares[shareId]; // Directly access the storage reference
        require(share.expirityTime == 0, "Share ID already exists");

        // Instead of trying to create a new struct and assign it,
        // directly modify the storage reference obtained above.
        share.encryptedContentForShare = encryptedContentForShare;
        notes[noteId].shares[shareId].expirityTime = block.timestamp + expiryDuration; // Use duration to add to current time

        notes[noteId].shareIDs.push(shareId); // Track the shareID in an array for enumeration

        emit ShareIDAdded(noteId, shareId, block.timestamp + expiryDuration);
    }

    function extendShareIDExpiry(string memory noteId, string memory shareId, uint256 additionalTime) public onlyNoteOwner(noteId) {
        require(notes[noteId].shares[shareId].expirityTime > block.timestamp, "Share ID does not exist or is expired");

        notes[noteId].shares[shareId].expirityTime += additionalTime;

        emit ShareIDExtended(noteId, shareId, notes[noteId].shares[shareId].expirityTime);
    }

    function getNoteById(string memory noteId) public view returns (string memory, uint256) {
        Note storage note = notes[noteId];
        return (note.encryptedNote, note.createdTimestamp);
    }

    function getNoteByShareId(string memory shareId) public payable {
        string memory noteId = noteIDByShareID[shareId];
        require(bytes(noteId).length > 0, "Invalid shareId");

        ShareInfo storage share = notes[noteId].shares[shareId];
        require(share.expirityTime >= block.timestamp, "ShareId expired");
        require(msg.value >= notes[noteId].accessFee, "Insufficient fee for accessing note");

        // Assuming implementation of earnings tracking per note as discussed
        noteEarnings[noteId] += msg.value;

        // Logic to allow access to the note's encrypted content for the caller

        emit NoteAccessed(noteId, msg.sender);
    }

    function getNoteAdditionFee() public view returns (uint256) {
        return noteAdditionFee;
    }

    function getNoteEarnings(string memory noteId) public view returns (uint256) {
        require(msg.sender == notes[noteId].owner, "Only the note owner can view earnings");
        return noteEarnings[noteId];
    }

    function getShareIDs(string memory noteId) public view onlyNoteOwner(noteId) returns (string[] memory) {
        return notes[noteId].shareIDs;
    }

    function getOwnNotesIds() public view returns (string[] memory) {
        return ownerNoteIds[msg.sender];
    }

    function setNoteAccessFee(string memory noteId, uint256 _accessFee) public {
        require(msg.sender == notes[noteId].owner, "Only the note owner can set the access fee");
        notes[noteId].accessFee = _accessFee;
        emit NoteAccessFeeUpdated(noteId, _accessFee);
    }

    function updateNoteAdditionFee(uint256 _newFee) public onlyOwner {
        noteAdditionFee = _newFee;
        emit NoteAdditionFeeUpdated(_newFee);
    }

    function withdrawNoteEarnings(string memory noteId) public {
        require(noteOwners[noteId] == msg.sender, "Only the note owner can withdraw earnings");

        uint256 earnings = noteEarnings[noteId];
        require(earnings > 0, "No earnings to withdraw");

        uint256 withdrawalAmount = (earnings * 90) / 100; // Calculate 90%
        noteEarnings[noteId] -= earnings; // Update earnings to reflect the withdrawal

        // Transfer the withdrawal amount to the note owner
        (bool success, ) = msg.sender.call{value: withdrawalAmount}("");
        require(success, "Transfer failed");

        emit EarningsWithdrawn(noteId, msg.sender, withdrawalAmount);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract balance is zero");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
