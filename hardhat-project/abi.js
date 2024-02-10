import { readFile, writeFile } from 'fs/promises';

async function extractABI() {
  try {
    // Specify the path to your compiled contract JSON file
    const contractJsonPath =
      './artifacts/contracts/SecretNotes.sol/SecretNotes.json';

    // Read file content from file
    const contractJsonContent = await readFile(contractJsonPath, 'utf-8');
    const contractJson = JSON.parse(contractJsonContent); // Parse the JSON content

    // Extract ABI
    const abi = contractJson.abi;

    // Specify the output path for the ABI
    const abiOutputPath = './src/contractABI.json';

    // Write the ABI to a new file
    await writeFile(abiOutputPath, JSON.stringify(abi, null, 2), 'utf-8');

    console.log(`ABI extracted to ${abiOutputPath}`);
  } catch (error) {
    console.error('Failed to extract ABI:', error);
  }
}

extractABI();
