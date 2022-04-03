//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Voiting {

    struct Candidate {
        address destination;
        string name;   
        uint voteCount;
    }

    struct Voting {
        string title;
        mapping(address => uint) candidates;
        mapping(address => address) participants;
        uint totalAmount;
        bool started;
        bool ended;
        uint endsAt;
        bool stopped;
        address winner;
        address[] allCandidates;
        address[] allParticipants;
        uint lasr;
    }

    address public owner;
    uint constant duration = 3 days;
    uint constant fee = 10;
    uint constant reqSum = 0.01 ether;
    uint public balance;
    uint public voitingEnd;

    Voting[] public votings;

    event VoitingCreate(uint index, string[] winnerAddress);
    event VoitingEnded(uint index, uint price, string winnerAddress);

    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    function Candidates (uint index) external view returns (address[] memory, uint[] memory) {
        Voting storage cVoting = votings[index];
        uint count = cVoting.allCandidates.length;
        uint[] memory votes = new uint[](count);
        address[] memory candidatesList = new address[](count);
        for(uint i = 0; i < count; i++) {
            candidatesList[i] = cVoting.allCandidates[i];
            votes[i] = cVoting.candidates[candidatesList[i]];
        }
        return(candidatesList, votes);
    }

    function createVoting(string memory _title) external onlyOwner {
        Voting storage newVoting = votings.push();
        newVoting.title = _title;
    }

    function addCandidate(uint index) external {
        Voting storage cVoting = votings[index];
        require(!cVoting.started, 'started!');
        cVoting.allCandidates.push(msg.sender);
    }

    function startVoting (uint index) external onlyOwner{
        Voting storage cVoting = votings[index];
        require(!cVoting.started, 'started!');
        cVoting.started = true;
        cVoting.endsAt = block.timestamp + duration;
    }

    function addrExists(address _addr, address[] memory _addresses) private pure returns (bool) {
        for(uint i = 0; i < _addresses.length; i++) {
            if(_addresses[i] == _addr){
                return true;
            }
        }
        return false;
    }

    function vote(uint index, address _for) external payable {
        require(msg.value == reqSum, "Not enought ETH for vote");
        Voting storage cVoting = votings[index];
        require(cVoting.started, "not started!");
        require(!cVoting.ended, "has ended");
        require(!addrExists(msg.sender, cVoting.allParticipants), "You already Voted");

        cVoting.totalAmount += msg.value;
        cVoting.candidates[_for]++;
        cVoting.allParticipants.push(msg.sender);
        cVoting.participants[msg.sender] = _for;
    }

    function winner(uint index) internal view returns (address winner) {
        Voting storage cVoting = votings[index];
        uint count = cVoting.allCandidates.length;
        uint[] memory votes = new uint[](count);
        address[] memory candidatesList = new address[](count);
        uint largest;
        for (uint i = 0; i < count; i++) {
            candidatesList[i] = cVoting.allCandidates[i];
            votes[i] = cVoting.candidates[candidatesList[i]];

            if(votes[i] > largest) {
                largest = votes[i]; 
            }

            if(largest == votes[i]) {
                return candidatesList[i];
            }
        }
    }

    

    function stopVoting(uint index) external {
        Voting storage cVoting = votings[index];
        require(cVoting.started, "not started!");
        require(!cVoting.ended, "has ended");
        // require(block.timestamp >= cVoting.endsAt);

        uint count = cVoting.allCandidates.length;
        uint[] memory votes = new uint[](count);
        address[] memory candidatesList = new address[](count);
        uint largest;
        for (uint i = 0; i < count; i++) {
            candidatesList[i] = cVoting.allCandidates[i];
            votes[i] = cVoting.candidates[candidatesList[i]];

            if(votes[i] > largest) {
                largest = votes[i]; 
            }
            
        }
        cVoting.winner = winner(index);

        address payable _to = payable(cVoting.winner);

        _to.transfer(cVoting.totalAmount - ((cVoting.totalAmount * fee) / 100));
        cVoting.ended = true;
    }

    
    function currentVoting(uint index) external view returns (address[] memory candidatesAddress, uint totalAmount, uint timeToEnd, string memory title) {
            Voting storage cVoting = votings[index];
            require(cVoting.started, "not started!");
            require(!cVoting.ended, "has ended");
            uint timeToEnd = cVoting.endsAt - block.timestamp;
            
            return (cVoting.allCandidates, cVoting.totalAmount, timeToEnd, cVoting.title);
    }

    function ownerFee(uint index) external onlyOwner{
        Voting storage cVoting = votings[index];
        require(cVoting.ended, 'Not ended!');

        address payable _owner = payable(owner);

        _owner.transfer(cVoting.totalAmount - ((cVoting.totalAmount * 90) / 100));
    }
}