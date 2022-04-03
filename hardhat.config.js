require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers")
require("solidity-coverage");
require('dotenv').config();
require('./tasks/tasks');


const mnemonic = process.env.mnemonic;

module.exports = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    tasks: "./tasks",
  },
  solidity: "0.8.13",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.API_KEY}`,
      accounts: [mnemonic]
    }
  }
};
