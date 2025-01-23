import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks:{
    local:{
      url : "http://127.0.0.1:8545/",
      chainId:31337,
      accounts:{
        mnemonic : "test test test test test test test test test test test junk"
      }
    },
    ganache : {
      url : "http://127.0.0.1:7545",
      chainId : 1337,
      accounts:{
        mnemonic : process.env.MNEMONIC_GANACHE
      }
    },
    sepolia:{
      url:process.env.SEPOLIA_URL,
      chainId:11155111,
      accounts:{
        mnemonic:process.env.MNEMONIC
      }
    }
    
  },
  etherscan:{
    apiKey:process.env.API_KEY
  }

};

export default config;