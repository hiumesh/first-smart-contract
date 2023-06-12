const ethers = require("ethers");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const local = false;

const RPC_URL = local ? process.env.LOCAL_RPC_URL : process.env.RPC_URL;
const PRIVATE_KEY = local
  ? process.env.LOCAL_PRIVATE_KEY
  : process.env.PRIVATE_KEY;

async function main() {
  let provider = new ethers.getDefaultProvider(RPC_URL);

  let wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const abi = fs.readFileSync(
    path.join(__dirname, "SimpleStorage_sol_SimpleStorage.abi"),
    { encoding: "utf8" }
  );

  const binary = fs.readFileSync(
    path.join(__dirname, "SimpleStorage_sol_SimpleStorage.bin"),
    { encoding: "utf8" }
  );

  const bytecode = `0x${binary}`;

  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log("Deploying the contract, please wait...");
  const contract = await contractFactory.deploy({ gasLimit: 550000 });
  await contract.deployed();
  console.log(`Contract deployed to ${contract.address}`);

  let currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number: ${currentFavoriteNumber}`);
  console.log("Updating favorite number...");
  let transactionResponse = await contract.store(7);
  let transactionReceipt = await transactionResponse.wait();
  currentFavoriteNumber = await contract.retrieve();
  console.log(`New Favorite Number: ${currentFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
