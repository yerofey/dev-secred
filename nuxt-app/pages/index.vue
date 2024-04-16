<template>
  <main class="sm:w-full md:w-[400px] lg:w-[500px] mx-auto">
    <UButton v-if="!userAddress" @click="connectWalletAndSwitchNetwork">
      Connect Wallet
    </UButton>
    <div v-else>
      <div class="py-2">
        <div class="mb-2 flex items-center justify-between">
          <div>
            Wallet:
            <span class="text-gray-500">
              <a
                :href="`${explorerUrl}/address/${userAddress}`"
                target="_blank"
                >{{ shortenTxHash(userAddress) }}</a
              >
            </span>
          </div>
          <div>
            Contract:
            <span class="text-gray-500">
              <a
                :href="`${explorerUrl}/address/${contractAddress}`"
                target="_blank"
                >{{ shortenTxHash(contractAddress) }}</a
              >
            </span>
          </div>
        </div>
        <form @submit.prevent="submitNote">
          <UTextarea
            v-model="noteContent"
            placeholder="Insert the content you want to secure"
            size="lg"
          ></UTextarea>
          <div class="flex items-center justify-between mt-2">
            <UButton
              type="submit"
              @click="submitNote"
              :disabled="isSubmitting || !noteContent"
              size="lg"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit' }}
            </UButton>
            <span
              v-if="!isSubmitting && txId"
              class="ml-4 text-gray-500 text-sm"
            >
              Pending TX:
              <a :href="`${explorerUrl}/tx/${txId}`" target="_blank">{{
                shortenTxHash(txId)
              }}</a>
            </span>
            <span v-if="!isSubmitting" class="ml-4 text-gray-400 text-sm">
              ≈${{ parseFloat(deployPriceUSD).toFixed(2) }}
            </span>
          </div>
        </form>
      </div>
      <div v-if="isLoading" class="flex items-center justify-center">
        <Loader />
      </div>
      <div v-if="!isLoading" class="mt-8">
        <div
          v-if="userNotes.length > 0"
          v-for="note in userNotes"
          :key="note.id"
          class="mb-6 p-2 rounded-lg dark:bg-gray-800 shadow"
        >
          <p class="px-2 text-gray-400">
            <span>{{ formatDate(note.createdTimestamp) }}</span>
          </p>
          <div class="text-gray-700 my-2">
            <p
              class="bg-gray-100 dark:bg-gray-700 dark:text-gray-100 p-4 rounded-lg text-lg"
            >
              {{ note.decryptedContent }}
            </p>
          </div>
        </div>
        <div v-else class="text-gray-500 text-center mt-8">
          You have no notes yet.
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import Web3 from 'web3';
import { nanoid } from 'nanoid';
import jsSha3 from 'js-sha3';
const { keccak256, sha3_256 } = jsSha3;
import CryptoJS from 'crypto-js';
import bigInt from 'big-integer';
import contractABI from '~/assets/contractABI.json';

const config = useRuntimeConfig();
const explorerUrl = config.public.explorerUrl;
const contractAddress = config.public.contractAddress;
const chainId = config.public.chainId;
const chainName = config.public.chainName;
const chainIcon = config.public.chainIcon;
const rpcUrl = config.public.rpcUrl;
const startBlock = config.public.startBlock;
const additionFee = config.public.additionFee;
const networkParams = {
  chainId: chainId,
  chainName: chainName,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  iconUrls: [chainIcon],
  rpcUrls: [rpcUrl],
  blockExplorerUrls: [explorerUrl],
};

let web3, contract;
const isLoading = ref(true);
const userAddress = ref('');
const encryptionKey = ref('');
const noteContent = ref('');
const isSubmitting = ref(false);
const txId = ref('');
const userTransactions = ref([]);
const userNotes = ref([]);

const estimatedGas = ref(0);
const isModalOpen = ref(false);

let deployPriceUSD = 0.3;
let deployPriceETH = additionFee;
let ethPriceUSD = 3000;

const connectWalletAndSwitchNetwork = async () => {
  await connectWallet();
  await switchNetwork();
};

const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('No wallet detected');
    return;
  }

  // Request account access
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    userAddress.value = accounts[0];

    // After successfully connecting, derive the encryption key
    encryptionKey.value = deriveEncryptionKey(userAddress.value);
    // console.log('Encryption Key:', encryptionKey.value);
  } catch (error) {
    console.error(error);
  }
};

const switchNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('No wallet detected');
    return;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }],
    });
  } catch (error) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
    } catch (addError) {
      console.error(addError);
    }
  }
};

async function estimateGasForTransaction(
  contract,
  method,
  params,
  fromAddress
) {
  try {
    // Estimate the gas required for the transaction
    const valueInWei = web3.utils.toWei(deployPriceETH, 'ether');
    const gasAmount = await contract.methods[method](...params).estimateGas({
      from: fromAddress,
      value: valueInWei,
      gas: web3.utils.toWei('0.1', 'gwei'),
      gasPrice: web3.utils.toWei('0.1', 'gwei'),
    });
    return gasAmount;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
}

async function getEstimatedGasForNoteCreation() {
  try {
    estimatedGas.value = await estimateGasForTransaction(
      contract,
      'addNote',
      ['0x1234567890', 'Sample encrypted note'],
      userAddress.value
    );
    console.log('Estimated Gas:', estimatedGas.value);
  } catch (error) {
    console.error('Error estimating gas:', error);
  }
}

const deriveEncryptionKey = (address) => {
  return keccak256(address);
};

const shortenTxHash = (txHash, startCut = 6, endCut = 4) => {
  if (txHash && txHash.length > 10) {
    const start = txHash.substring(0, startCut);
    const end = txHash.substring(txHash.length - endCut);
    return `${start}...${end}`;
  }
  return txHash;
};

const formatDate = (timestamp) => {
  // Ensure the timestamp is a number and convert BigInt to a number by multiplying it with 1000
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString(undefined, {
    // 'undefined' uses the browser's locale
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const decodeTransactionInput = (input) => {
  // Assuming the function signature for `addNote(uint256,string)` is known and input is the transaction input data
  // Skip the function signature (first 10 characters of the input)
  const inputData = input.slice(10);

  // Define the types of the parameters that you expect
  const parameterTypes = ['uint256', 'string'];

  // Use web3.eth.abi.decodeParameters to decode the input data
  const decodedParameters = web3.eth.abi.decodeParameters(
    parameterTypes,
    inputData
  );
  // console.log(decodedParameters);

  // Assuming the second parameter is the encrypted note content
  return decodedParameters[1]; // This would return the decoded string (encrypted note)
};

const encryptNote = (content, key) => {
  return CryptoJS.AES.encrypt(content, key).toString();
};

const decryptNote = (encryptedContent, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const hashNoteId = async (noteId) => {
  return sha3_256(noteId);
};

const submitNote = async () => {
  if (!window.ethereum) {
    console.error('No wallet detected');
    return;
  }

  if (!userAddress.value) {
    console.error('User address not found');
    return;
  }

  if (!noteContent.value) {
    console.error('Note content is empty');
    return;
  }

  isSubmitting.value = true;

  const noteId = nanoid(); // Generate a unique note ID
  const noteIdHash = await hashNoteId(noteId);
  const noteIdBigInt = `0x${bigInt(noteIdHash, 16).toString(16)}`;
  const encryptedContent = encryptNote(noteContent.value, encryptionKey.value);

  const gasPrice = web3.utils.toWei('0.01', 'gwei');

  // Call the smart contract function to add the note
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const valueInWei = web3.utils.toWei(deployPriceETH, 'ether');
    const tx = await contract.methods
      .addNote(noteIdBigInt, encryptedContent)
      .send({
        from: userAddress.value,
        value: valueInWei,
        gas: estimatedGas.value,
        gasPrice: gasPrice,
      });
    txId.value = tx.transactionHash;

    // Construct the transaction object (simplified example)
    const newTransaction = {
      ...tx,
      hash: tx.transactionHash,
      decryptedContent: noteContent.value,
      valueInEth: deployPriceETH,
      timeStamp: timestamp,
    };

    // Append the new transaction to the existing list
    userTransactions.value = [newTransaction, ...userTransactions.value];

    // Clear the note content after submission
    noteContent.value = '';
    txId.value = '';
  } catch (error) {
    console.error(error);
  }

  isSubmitting.value = false;
};

async function getWalletNotes(userAddress) {
  try {
    const noteIds = await contract.methods
      .getOwnNotesIds()
      .call({ from: userAddress });

    const notesPromises = noteIds.map(async (noteId) => {
      const noteDetails = await contract.methods.getNoteById(noteId).call();
      return {
        id: noteId,
        encryptedContent: noteDetails[0],
        createdTimestamp: noteDetails[1],
      };
    });

    const notes = await Promise.all(notesPromises);
    return notes;
  } catch (error) {
    console.error('Failed to fetch user notes:', error);
    return [];
  }
}

async function fetchUserNotes() {
  const notes = await getWalletNotes(userAddress.value);

  // decrypt notes
  notes.forEach((note) => {
    note.decryptedContent = decryptNote(
      note.encryptedContent,
      encryptionKey.value
    );
  });

  userNotes.value = notes;
  isLoading.value = false;

  console.log('User notes:', notes);
}

const fetchTransactions = async () => {
  const { data } = await useLazyFetch(
    `/api/transactions?address=${userAddress.value}&startblock=${startBlock}&endblock=999999999&sort=desc`
  );
  const transactions = data?.value?.result || [];
  if (transactions) {
    const decryptedTransactions = transactions
      .filter((tx) => tx.to.toLowerCase() === contractAddress.toLowerCase())
      .map((tx) => {
        const encryptedContent = decodeTransactionInput(tx.input);
        const decryptedContent = decryptNote(
          encryptedContent,
          encryptionKey.value
        );
        return {
          ...tx,
          decryptedContent,
          valueInEth: web3.utils.fromWei(tx.value, 'ether'),
        };
      });
    userTransactions.value = decryptedTransactions;
  }
};

const fetchETHPrice = async () => {
  try {
    const { data } = await useFetch('/api/price?coin=ethereum');
    return data.value;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
  }
};

onMounted(async () => {
  if (!window.ethereum) {
    console.error('No wallet detected');
    return;
  }

  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(contractABI, contractAddress);

  // Connect wallet
  await connectWallet();

  // Fetch transactions if user is connected
  if (userAddress.value) {
    await switchNetwork();
    // fetchTransactions();

    // Fetch user notes (if any) using RPC call
    fetchUserNotes();

    // Estimate gas for note creation
    getEstimatedGasForNoteCreation();
  }

  // Fetch ETH price and calculate deploy price in USD
  ethPriceUSD = parseFloat(await fetchETHPrice());
  console.log('ETH Price:', ethPriceUSD);
  deployPriceUSD = (ethPriceUSD * deployPriceETH).toFixed(2);
});
</script>

<style scoped>
main {
  padding: 1rem;
}
</style>
