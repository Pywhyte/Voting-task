async function main() {
    const [owner] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", owner.address);
    
    const Voting = await ethers.getContractFactory("voting");
    const voting = await Voting.deploy();
  
    console.log("voting address:", voting.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });