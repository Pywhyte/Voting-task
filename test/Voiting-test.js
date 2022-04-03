const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voiting", function () {
  let owner
  let candidate
  let candidate2
  let voter
  let duration = 259200
  const winnerPay = (ethers.utils.parseEther("0.01") - ((ethers.utils.parseEther("0.01") * 10) / 100))
  const ownerPay = (ethers.utils.parseEther("0.01") - ((ethers.utils.parseEther("0.01") * 90) / 100))
  

  beforeEach(async function (){
    [owner, candidate, candidate2, voter] = await ethers.getSigners()

    const Voiting = await ethers.getContractFactory("Voiting", owner)
    voting = await Voiting.deploy()
    await voting.deployed()
  })

  async function getTimestamp(bn) {
    return(
      await ethers.provider.getBlock(bn)
    ).timestamp;
  }

  it("sets owner", async function() {
    const currentOwner = await voting.owner()
    expect(currentOwner).to.eq(owner.address)
  })
  
  describe("breakVoting", function(){
    beforeEach(async function (){
      await voting.createVoting("tested")
    })
    it("break vote", async function() {
      const vote = await voting.vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
      const cVoting = await voting.votings(0)
    })

    it("AddCandidate", async function() {
      await voting.startVoting(0)
      await voting.addCandidate(0)
    })

    it("breakStop", async function(){
      await voting.stopVoting(0)
    })

    it("breakStop", async function(){
      await voting.startVoting(0)
      await voting.stopVoting(0)
      await voting.stopVoting(0)
    })

    it('breakOwnerFee', async function(){
      await voting.ownerFee(0)
    })

    it('breakOwner', async function(){
      await voting.startVoting(0)
      await voting.stopVoting(0)
      await voting.connect(voter.address).ownerFee(0)
    })

    it('breakCurr', async function(){
      await voting.currentVoting(0)
    })

    it('breakCurr', async function(){
      await voting.startVoting(0)
      await voting.stopVoting(0)
      await voting.currentVoting(0)
    })

    it("breakStart", async function(){
      await voting.startVoting(0)
      await voting.startVoting(0)
    })
  })

  it("doubleVoting", async function() {
    await voting.createVoting("tested")
    await voting.connect(candidate).addCandidate(0)
    const tx = await voting.startVoting(0)
    const vote = await voting.connect(voter).vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
    await vote.wait()
    const vote2 = await voting.connect(voter).vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
    await vote2.wait()
  })

  it("afterStop", async function(){
    await voting.createVoting("testvote")
        await voting.connect(candidate).addCandidate(0)
        const tx = await voting.startVoting(0)
        const can = await voting.Candidates(0)
        await voting.stopVoting(0)
        const vote = await voting.vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
  })

  it("notEnoughtETH", async function(){
    await voting.createVoting("testvote")
        await voting.connect(candidate).addCandidate(0)
        const tx = await voting.startVoting(0)
        const can = await voting.Candidates(0)
        const vote = await voting.vote(0, candidate.address, {value: ethers.utils.parseEther("0.001")})
  })

  describe("createVoting", function(){
    it('create Vote', async function(){
      const tx = await voting.createVoting("testvote")
      const cVoting = await voting.votings(0)
      expect(cVoting.title).to.eq("testvote")
    })
  })


  describe("startVoting", function(){
    it("start vote", async function(){
      await voting.createVoting("testvote")
      const tx = await voting.startVoting(0)
      const cVoting = await voting.votings(0)
      const ts = await getTimestamp(tx.blockNumber)
      expect(cVoting.endsAt).to.eq(ts + duration)
      expect(cVoting.started).to.eq(true)
    })
  })

  describe("addCandidate", function(){
    it('add candidate', async function(){
      await voting.createVoting("testvote")
      const cVoting = await voting.votings(0)
      await voting.connect(candidate).addCandidate(0)
      await voting.connect(candidate2).addCandidate(0)
      const tx = await voting.startVoting(0)

      const curr =  await voting.currentVoting(0);
      await expect(curr.title).to.eq('testvote');
      await expect(curr[0][0]).to.eq(candidate.address);
    })
  })

  describe("Candidates", function(){
      it("candadates", async function(){
        await voting.createVoting("testvote")
        const cVoting = await voting.votings(0)
        await voting.connect(candidate).addCandidate(0)
        await voting.connect(candidate2).addCandidate(0)
        const tx = await voting.startVoting(0)
        const can = await voting.Candidates(0)
        const vote = await voting.vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
        const curr =  await voting.currentVoting(0);
      
        await expect(can[0][0]).to.eq(candidate.address);
      })
  })

  describe("stopVoting", function(){
    it("stopped", async function(){
      await voting.createVoting("testvote")
      const cVoting = await voting.votings(0)
      await voting.connect(candidate).addCandidate(0)
      await voting.connect(candidate2).addCandidate(0)
      const sv = await voting.startVoting(0)
    
      const vote = await voting.connect(voter).vote(0, candidate.address, {value: ethers.utils.parseEther("0.01")})
      await vote.wait

      
      const stopped = await voting.stopVoting(0)
      const fee = await voting.ownerFee(0)
      
      await expect(() => stopped)
      .to.changeEtherBalances([candidate, voting], [winnerPay, -winnerPay]);
      
      await expect(() => fee)
      .to.changeEtherBalances([owner, voting], [ownerPay, -ownerPay]);
    })
  })
});
