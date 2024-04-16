import hre from 'hardhat';
import contractABI from '../artifacts/contracts/SecretNotes.sol/SecretNotes.json' assert { type: 'json' };

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const contractAddress = '0x88b2aF32929F41Ae2Fc10ebd0e4ae9ab3178Dd3f';
  // Create a new contract instance with signer that has the ability to sign transactions
  const secretNotesContract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    deployer
  );
  // Call the updateNoteAdditionFee function from the contract
  console.log('Updating addition fee...');
  const _noteAdditionFee = 100000000000000; // 0.0001 ETH
  const tx = await secretNotesContract.updateNoteAdditionFee(_noteAdditionFee);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log('Fee updated!', tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
