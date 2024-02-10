// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from 'hardhat';

async function main() {
  // Grab the contract factory
  const SecretNotes = await hre.ethers.getContractFactory('SecretNotes');

  // Set the constructor arguments
  const _noteAdditionFee = 200000000000000; // 0.0002 ETH

  // Start deployment, returning a promise that resolves to a contract object
  const secretNotes = await SecretNotes.deploy(_noteAdditionFee); // Constructor arguments would go here
  // Wait for the deployment transaction to be mined
  await secretNotes.waitForDeployment();

  console.log('Contract deployed to address:', secretNotes.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
