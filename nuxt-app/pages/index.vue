<template>
  <main class="sm:w-full md:w-[400px] lg:w-[500px] mx-auto">
    <UButton v-if="!userAddress" @click="connectWalletAndSwitchNetwork">
      Connect Wallet
    </UButton>
    <div v-else>
      <div class="py-2">
        Wallet:
        <span class="text-gray-500">
          <a :href="`${explorerUrl}/address/${userAddress}`" target="_blank">{{
            userAddress
          }}</a>
        </span>
      </div>
      <form @submit.prevent="submitNote">
        <UTextarea
          v-model="noteContent"
          placeholder="Enter your secret note"
        ></UTextarea>
        <br />
        <div class="flex items-center justify-between">
          <UButton
            type="submit"
            @click="submitNote"
            :disabled="isSubmitting || !noteContent"
            size="lg"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </UButton>
          <span v-if="!isSubmitting && txId" class="ml-4 text-gray-500 text-sm">
            Pending TX:
            <a :href="`${explorerUrl}/tx/${txId}`" target="_blank">{{
              shortenTxHash(txId)
            }}</a>
          </span>
          <span v-if="!isSubmitting" class="ml-4 text-gray-400">
            Cost: ${{ deployPriceUSD }}
            <!-- ≈ {{ parseFloat(deployPriceETH).toFixed(6) }} ETH + gas fee -->
          </span>
        </div>
      </form>
      <div v-if="userTransactions.length > 0" class="mt-8">
        <div
          v-for="tx in userTransactions"
          :key="tx.hash"
          class="mb-6 p-2 rounded-lg dark:bg-gray-800 shadow"
        >
          <p class="px-2 text-gray-400">
            <span>{{ formatDate(tx.timeStamp) }}</span>
          </p>
          <div class="text-gray-700 my-2">
            <p
              class="bg-gray-100 dark:bg-gray-700 dark:text-gray-100 p-4 rounded-lg text-lg"
            >
              {{ tx.decryptedContent }}
            </p>
          </div>
          <p class="text-gray-400 px-2">
            <span> {{ parseFloat(tx.valueInEth).toFixed(6) }} ETH</span>
            <span class="float-right">
              <a
                :href="`${explorerUrl}/tx/${txId}`"
                target="_blank"
                class="hover:underline"
              >
                {{ shortenTxHash(tx.hash) }}
              </a>
            </span>
          </p>
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
  iconUrls: [
    'https://sepolia-optimism.etherscan.io/images/logo-ether.svg?v=0.0.6',
  ],
  rpcUrls: [rpcUrl],
  blockExplorerUrls: [explorerUrl],
};

let web3, contract;
const userAddress = ref('');
const encryptionKey = ref('');
const noteContent = ref('');
const isSubmitting = ref(false);
const txId = ref('');
const userTransactions = ref([]);

let deployPriceUSD = 0.5;
let deployPriceETH = additionFee;
let ethPriceUSD = 2500;

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

const deriveEncryptionKey = (address) => {
  return keccak256(address);
};

const shortenTxHash = (txHash) => {
  if (txHash && txHash.length > 10) {
    const start = txHash.substring(0, 6);
    const end = txHash.substring(txHash.length - 6);
    return `${start}...${end}`;
  }
  return txHash;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
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

  // Call the smart contract function to add the note
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const valueInWei = web3.utils.toWei(deployPriceETH, 'ether');
    const tx = await contract.methods
      .addNote(noteIdBigInt, encryptedContent)
      .send({
        from: userAddress.value,
        value: valueInWei,
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

// const calculateETHForFixedUSD = (fixedUSD = 0.5) =>
//   (fixedUSD / ethPriceUSD).toFixed(18).toString();

// const convertETHToUSD = (ethAmount) => (ethAmount * ethPriceUSD).toFixed(2);

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
    await fetchTransactions();
    // await fetchNoteAdditionFee();
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
