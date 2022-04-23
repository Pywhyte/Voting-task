const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
  });

  task("newVote", "Prints an account's balance")
  .addParam('name', 'The name of voting')
  .addParam("candidates", 'array оf candidates')
  .setAction(async (taskArgs) =>{
        const [owner] = await ethers.getSigners();
        const Voting = await ethers.getContractFactory("Voiting");
        const voting = await Voting.attach(owner);
    
        await voting.createVoting(taskArgs.name, taskArgs.candidates);
        console.log("create voting")
  });

    task("vote", 'vote for a candidate')
        .addParam('name', 'The name of voting')
        .addParam("candidates", 'array оf candidates')
        .addParam('index', 'The index of voting')
        .addParam('indexCandidate', 'index of candidate address')
        .setAction(async (taskArgs) => {
            const Voting = await ethers.getContractFactory("Voiting");
            const voting = await Voting.attach(owner);
            const [voter] = await ethers.getSigners();

            await voting.createVoting(taskArgs.name, taskArgs.candidates);
            await voting.connect(voter).vote(taskArgs.index, 0, {value: ethers.utils.parseEther("0.01")});
    
            console.log('vote for')
        })

    task("stopVote", 'stop vote')
        .addParam('name', 'The name of voting')
        .addParam("candidates", 'array оf candidates')
        .addParam('index', 'The index of voting')
        .setAction(async (taskArgs) => {
            const Voting = await ethers.getContractFactory("Voiting");
            const voting = await Voting.attach(owner);
            const [voter] = await ethers.getSigners();

            await voting.createVoting(taskArgs.name, taskArgs.candidates);
            await voting.connect(voter).vote(taskArgs.index, taskArgs.address, {value: ethers.utils.parseEther("0.01")});
            await voting.stopVoting(taskArgs.index)
            console.log('Voting stopped')
        })

module.exports = {};