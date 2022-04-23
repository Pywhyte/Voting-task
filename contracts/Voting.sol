//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Voting {

    struct Candidate {
        address name;   
        uint voteCount;
    }

    enum Condition {
        notStarted,
        effective,
        ended
    }

    struct Votings {
        string title;
        uint index;
        uint totalAmount;
        uint endsAt;
        address winner;
        mapping(address => bool) voter;
        Condition _condition;    
        Candidate[] _candidates;
    }

    Condition public condition;

    address public owner;
    uint constant duration = 3 days;
    uint constant fee = 10;
    uint constant reqSum = 0.01 ether;

    Candidate[] public candidates;
    Votings[] public votings;

    event VotingCreate(Condition condition, uint endsVoting, Candidate[] candidates);
    event VotingEnded(uint index, uint price, string winnerAddress);

    constructor () {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    function createVoting(string memory _title, address[] memory candidatesAddress) external onlyOwner {
        Votings storage newVoting = votings.push();
        newVoting.title = _title;

        for(uint i = 0; i < candidatesAddress.length; i++) {
                newVoting._candidates.push(Candidate({
                name: candidatesAddress[i],
                voteCount: 0
            }));
        }
        condition = Condition.effective;
        newVoting._condition = condition;
        newVoting.endsAt = block.timestamp + duration;

        emit VotingCreate(condition, newVoting.endsAt, newVoting._candidates);
    }

    function vote(uint index, uint candidate) external payable {
        require(msg.value == reqSum, "Not enought ETH for vote");
        Votings storage cVoting = votings[index];
        require(cVoting._condition == Condition.effective, "not exist");
        require(cVoting.voter[msg.sender] == false, "Already voted.");

        cVoting.voter[msg.sender] = true;
        cVoting._candidates[candidate].voteCount++;
        
        cVoting.totalAmount += msg.value;
    }

    function stopVoting(uint index) external {
        Votings storage cVoting = votings[index];
        require(cVoting._condition == Condition.effective, "not exist");
        // require(block.timestamp >= cVoting.endsAt);
    
        cVoting.winner = winnerName(index);

        address payable _to = payable(cVoting.winner);

        condition = Condition.ended;
        cVoting._condition = condition;

        _to.transfer(cVoting.totalAmount - ((cVoting.totalAmount * fee) / 100));
    }

    function winningCandidate(uint index) internal view returns(uint winningCandidate_) {
        Votings storage cVoting = votings[index];
        uint winningVoteCount = 0;

        for(uint c = 0; c < cVoting._candidates.length; c++) {
            if(cVoting._candidates[c].voteCount > winningVoteCount) {
                winningVoteCount = cVoting._candidates[c].voteCount;
                winningCandidate_ = c;
            }
        }
    }
    
    function getAllVotingsLength() external view returns(uint votingsLength) {
        return votings.length;
    }

    function winnerName(uint index) public view returns (address winnerName_) {
        Votings storage cVoting = votings[index];
        require(cVoting._condition == Condition.effective, "not ended");
        winnerName_ = cVoting._candidates[winningCandidate(index)].name;
    }
    
    function getVoting(uint index) external view returns (Candidate[] memory allCandidates, uint totalAmount, uint timeToEnd, string memory title) {
        Votings storage cVoting = votings[index];
        require(cVoting._condition == Condition.effective, "not exist");
        timeToEnd = cVoting.endsAt - block.timestamp;
            
        return (cVoting._candidates, cVoting.totalAmount, timeToEnd, cVoting.title);
    }

    function ownerFee(uint index) external onlyOwner{
        Votings storage cVoting = votings[index];
        require(cVoting._condition == Condition.ended, "not ended!");

        address payable _owner = payable(owner);

        _owner.transfer(cVoting.totalAmount - ((cVoting.totalAmount * 90) / 100));
    }
}