import hre from 'hardhat';
import contractABI from '../artifacts/contracts/SecretNotes.sol/SecretNotes.json' assert { type: 'json' };

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contractAddress = '0xef3aDD1f5381e8300f2611D671b4A77B1eC8848F';
  // Create a new contract instance with signer that has the ability to sign transactions
  const secretNotesContract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    deployer
  );
  // Call the withdraw function from the contract
  console.log('Withdrawing funds...');
  const tx = await secretNotesContract.withdraw();

  // Wait for the transaction to be mined
  await tx.wait();
  console.log('Funds withdrawn!', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
