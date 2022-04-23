const { expect } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

describe("Voting", function () {
  let owner
  let candidate
  let candidate2
  let voter
  let duration = 259200
  const winnerPay = (ethers.utils.parseEther("0.01") - ((ethers.utils.parseEther("0.01") * 10) / 100))
  const ownerPay = (ethers.utils.parseEther("0.01") - ((ethers.utils.parseEther("0.01") * 90) / 100))
  

  beforeEach(async function (){
    [owner, candidate, candidate2, voter] = await ethers.getSigners()

    const Voting = await ethers.getContractFactory("Voting", owner)
    voting = await Voting.deploy()
    await voting.deployed()
  })


  describe("test owner", function(){
    it('Fails when called by a non-owner account', async function  () {
      await expectRevert(
        voting.connect(voter).createVoting("testvote", [candidate.address, candidate2.address]),
        "not an owner!"
      )
    })

    it("sets owner", async function() {
      const currentOwner = await voting.owner()
      expect(currentOwner).to.eq(owner.address)
    })
  })
  
  it('create Vote', async function(){
    const tx = await voting.createVoting("testvote", [candidate.address, candidate2.address])
    const cVoting = await voting.votings(0)
    expect(cVoting.title).to.eq("testvote")
  })
    
  
    it('length votings', async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])
      await voting.createVoting("testvote2", [candidate.address, candidate2.address])
      await voting.createVoting("testvote3", [candidate.address, candidate2.address])
      const len = await voting.getAllVotingsLength()
      expect(3).to.eq(len)
    })

    it('getVotting', async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])
      const cVoting = await voting.votings(0)
      const currVoting = await voting.getVoting(0)
      timeToEnd = cVoting.endsAt - currVoting.timestamp;

      expect(currVoting.allCandidates, cVoting.totalAmount, timeToEnd, cVoting.title).to.eq(currVoting.allCandidates, currVoting.totalAmount, currVoting.timeToEnd, currVoting.title)
    })

    it("revert get Voting", async function() {
      await voting.createVoting("testvote", [candidate.address, candidate2.address])

      const stopped = await voting.stopVoting(0)
      await stopped.wait()

      await expectRevert(
        voting.getVoting(0),
        'not exist'
      )
    })

    describe('try Vote', function() {
      beforeEach(async function(){
        await voting.createVoting("testvote", [candidate.address, candidate2.address])
        const cVoting = await voting.votings(0)
      })

      it("double vote", async function(){
        const vote = await voting.connect(voter).vote(0, 0, {value: ethers.utils.parseEther("0.01")})
        await vote.wait()
        await expectRevert(
          voting.connect(voter).vote(0, 0, {value: ethers.utils.parseEther("0.01")}),
          "Already voted."
        )
      })

      it("not enought eth", async function(){
        await expectRevert(
          voting.connect(voter).vote(0, 0, {value: ethers.utils.parseEther("0.001")}),
          "Not enought ETH for vote"
        )
      })

      it("has ended or not started", async function(){
        const stopped = await voting.stopVoting(0)
        await stopped.wait()

        await expectRevert(
          voting.connect(voter).vote(0, 0, {value: ethers.utils.parseEther("0.01")}),
          "not exist"
        )
      })
    })

    it('winner not exist', async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])

      const stopped = await voting.stopVoting(0)
      await stopped.wait()

      await expectRevert(
        voting.winnerName(0),
        "not ended"
      )
      
    })

  describe("Stop Voting", function(){
    beforeEach(async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])
    })

    it("stopped", async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])
      
      const vote = await voting.connect(voter).vote(0, 0, {value: ethers.utils.parseEther("0.01")})
      await vote.wait()

      
      const stopped = await voting.stopVoting(0)
      await stopped.wait()
      
      const fee = await voting.ownerFee(0)
      await fee.wait()

      await expect(() => stopped)
      .to.changeEtherBalances([candidate, voting], [winnerPay, -winnerPay]);
      
      await expect(() => fee)
      .to.changeEtherBalances([owner, voting], [ownerPay, -ownerPay]);
    })

    it('not exist', async function() {
      const stopped = await voting.stopVoting(0)
      await stopped.wait()

      await expectRevert(
        voting.connect(voter).stopVoting(0),
        "not exist"
      )
    })

    it('revert ownerFee', async function(){
      await voting.createVoting("testvote", [candidate.address, candidate2.address])
      expectRevert(
        voting.ownerFee(0),
        "not ended!"
      )
    })
  })
});
