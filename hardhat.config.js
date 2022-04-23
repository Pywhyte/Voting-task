require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require('dotenv').config();
require('./tasks/tasks');


module.exports = {
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    tasks: "./tasks",
  },
  solidity: "0.8.0",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.API_KEY}`,
      accounts: [process.env.mnemonic]
    }
  }
};
