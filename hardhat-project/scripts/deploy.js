// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from 'hardhat';

async function main() {
  // Grab the contract factory
  const SecretChats = await hre.ethers.getContractFactory('SecretChats');

  // Set the constructor arguments
  const _chatAdditionFee = 500000000000000; // 0.0005 ETH

  // Start deployment, returning a promise that resolves to a contract object
  const secretChats = await SecretChats.deploy(_chatAdditionFee); // Constructor arguments would go here
  // Wait for the deployment transaction to be mined
  await secretChats.waitForDeployment();

  console.log('Contract deployed to address:', secretChats.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
