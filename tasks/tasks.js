const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");

const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
  
    for (const account of accounts) {
      console.log(account.address);
    }
  });

task("balance", "Create new voting")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });


  task("newVote", "Prints an account's balance")
  .addParam('name', 'The name of voting')
  .setAction(async (taskArgs) =>{
        const Voting = await ethers.getContractFactory("Voiting");
        const voting = await Voting.attach(owner);
    
        await voting.createVoting(taskArgs.name);
        console.log("create voting")
  });

  task("startVote", "start Vote")
  .addParam('index', 'The index of voting')
  .setAction(async (taskArgs) =>{
        const Voting = await ethers.getContractFactory("Voiting");
        const voting = await Voting.attach(owner);

        await voting.startVoting(taskArgs.index)
        console.log("vote started")
  });

  task("addCandidate", "add candidate to vote")
    .addParam('name', 'The name of voting')
    .addParam('index', 'The index of voting')
    .setAction(async (taskArgs) => {
        const Voting = await ethers.getContractFactory("Voiting");
        const voting = await Voting.attach(owner);
        const [candidate] = await ethers.getSigners();

        await voting.createVoting(taskArgs.name);
        await voting.connect(candidate).addCandidate(taskArgs.index);

        console.log('add candidate', candidate.address)
    })

    task("vote", 'vote for a candidate')
        .addParam('name', 'The name of voting')
        .addParam('index', 'The index of voting')
        .addParam('address', 'candidate address')
        .setAction(async (taskArgs) => {
            const Voting = await ethers.getContractFactory("Voiting");
            const voting = await Voting.attach(owner);
            const [candidate, voter] = await ethers.getSigners();

            await voting.createVoting(taskArgs.name);
            await voting.connect(candidate).addCandidate(taskArgs.index);
            await voting.startVoting(taskArgs.index);
            await voting.connect(voter).vote(taskArgs.index, taskArgs.address, {value: ethers.utils.parseEther("0.01")});
    
            console.log('vote for', candidate.address)
        })

    task("stopVote", 'stop vote')
        .addParam('name', 'The name of voting')
        .addParam('index', 'The index of voting')
        .addParam('address', 'candidate address')
        .setAction(async (taskArgs) => {
            const Voting = await ethers.getContractFactory("Voiting");
            const voting = await Voting.attach(owner);
            const [candidate, voter] = await ethers.getSigners();

            await voting.createVoting(taskArgs.name);
            await voting.connect(candidate).addCandidate(taskArgs.index);
            await voting.startVoting(taskArgs.index);
            await voting.connect(voter).vote(taskArgs.index, taskArgs.address, {value: ethers.utils.parseEther("0.01")});
            await voting.stopVoting(taskArgs.index)
            console.log('Voting stopped')
        })

module.exports = {};