<template>
  <div>
    <!-- Alert Component -->
    <div
      v-if="alert.show"
      class="fixed bottom-4 right-4 z-[9999] w-full max-w-sm transform transition-all duration-300 ease-in-out"
      :class="{
        'translate-y-0 opacity-100': alert.show,
        'translate-y-full opacity-0': !alert.show
      }"
    >
      <UAlert
        :type="alert.type"
        :title="alert.title"
        :description="alert.description"
        :icon="alert.icon"
        class="shadow-lg w-full"
        :ui="{
          wrapper: 'p-4',
          title: 'font-semibold text-lg',
          description: 'mt-1 text-sm',
          rounded: 'rounded-xl',
          shadow: 'shadow-xl',
          background: 'bg-white dark:bg-gray-900',
          base: 'w-full relative',
        }"
      >
        <template #default>
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium">{{ alert.title }}</p>
              <p class="text-gray-600 dark:text-gray-300 mt-1">{{ alert.description }}</p>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="xs"
              class="flex-shrink-0"
              @click="dismissAlert"
            />
          </div>
        </template>
      </UAlert>
    </div>

    <UContainer :ui="{ width: 'max-w-2xl mx-auto' }">
      <!-- Hero Section (shown only when wallet is not connected) -->
      <div v-if="!userAddress" class="py-20 text-center">
        <UCard class="max-w-2xl mx-auto">
          <template #header>
            <div class="flex items-center justify-center gap-2">
              <UIcon name="i-heroicons-lock-closed" class="w-8 h-8 text-primary" />
              <h1 class="text-4xl font-bold">Secure Your Secrets on Base</h1>
            </div>
          </template>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Store your encrypted notes securely on the blockchain. Your secrets are protected by your wallet and accessible only by you.
          </p>

          <UButton
            size="xl"
            color="primary"
            @click="connectWalletAndSwitchNetwork"
            class="mb-8"
          >
            <template #leading>
              <UIcon name="i-heroicons-wallet" class="w-5 h-5" />
            </template>
            Connect Wallet
          </UButton>
        </UCard>
      </div>

      <!-- Features Section (shown only when wallet is not connected) -->
      <div v-if="!userAddress" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-primary" />
              <h3 class="font-semibold">End-to-End Encryption</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-300">
            Your notes are encrypted using your wallet's private key, ensuring only you can access them.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-server" class="w-6 h-6 text-primary" />
              <h3 class="font-semibold">On-Chain Storage</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-300">
            Your encrypted notes are stored permanently on the Base blockchain, accessible anytime.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-primary" />
              <h3 class="font-semibold">Fast & Efficient</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-300">
            Built on Base, enjoy low transaction fees and fast confirmation times.
          </p>
        </UCard>
      </div>

      <!-- Notes Section (shown when wallet is connected) -->
      <div v-if="userAddress" class="pt-8 space-y-4">
        <UCard class="bg-gray-50 dark:bg-gray-900">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-wallet" class="w-5 h-5 text-primary" />
              <UBadge color="primary" variant="subtle" size="lg">
                {{ shortenTxHash(userAddress) }}
              </UBadge>
            </div>
            <UButton
              color="red"
              variant="ghost"
              size="sm"
              @click="disconnectWallet"
              class="flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-950"
            >
              <UIcon name="i-heroicons-power" class="w-4 h-4" />
              Disconnect
            </UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Your Secure Notes</h2>
          </template>
          
          <form @submit.prevent="submitNote" class="space-y-4">
            <UTextarea
              v-model="noteContent"
              placeholder="Type your secret note here..."
              size="lg"
              :rows="4"
            />
            <div class="flex items-center justify-between">
              <UButton
                type="submit"
                :disabled="isSubmitting || !noteContent"
                size="lg"
                color="primary"
              >
                <template #leading>
                  <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5" />
                </template>
                {{ isSubmitting ? 'Submitting...' : 'Save Note' }}
              </UButton>
              <span v-if="!isSubmitting" class="text-sm text-gray-500">
                Cost: ≈${{ parseFloat(deployPriceUSD).toFixed(2) }}
              </span>
            </div>
          </form>
        </UCard>

        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <ULoadingIcon />
        </div>

        <div v-else-if="userNotes.length > 0" class="space-y-4">
          <UCard v-for="note in userNotes" :key="note.id">
            <div class="flex items-center justify-between mb-2">
              <UBadge color="gray" variant="soft">
                {{ formatDate(note.createdTimestamp) }}
              </UBadge>
            </div>
            <p class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {{ note.decryptedContent }}
            </p>
          </UCard>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-4" />
          <p>You don't have any notes yet</p>
        </div>
      </div>
    </UContainer>
  </div>
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

// const estimatedGas = ref(0);
const isModalOpen = ref(false);

let deployPriceUSD = 0.1;
let deployPriceETH = additionFee;
let ethPriceUSD = 1800;

const toast = useToast();

// Alert state
const alert = reactive({
  show: false,
  type: 'info',
  title: '',
  description: '',
  icon: '',
  timeout: null
});

const dismissAlert = () => {
  alert.show = false;
  if (alert.timeout) {
    clearTimeout(alert.timeout);
  }
};

const showAlert = (type, title, description) => {
  // Clear any existing timeout
  if (alert.timeout) {
    clearTimeout(alert.timeout);
  }

  // Set alert properties
  alert.type = type;
  alert.title = title;
  alert.description = description;
  alert.icon = type === 'success' ? 'i-heroicons-check-circle' 
             : type === 'danger' ? 'i-heroicons-x-circle'
             : 'i-heroicons-information-circle';
  alert.show = true;

  // Auto-dismiss after 5 seconds
  alert.timeout = setTimeout(() => {
    dismissAlert();
  }, 5000);
};

const showErrorAlert = (title, description) => {
  showAlert('danger', title, description);
};

const showSuccessAlert = (title, description) => {
  showAlert('success', title, description);
};

const connectWalletAndSwitchNetwork = async () => {
  await connectWallet();
  await switchNetwork();
};

const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    showErrorAlert(
      'Wallet Not Found',
      'Please install MetaMask or another Web3 wallet.'
    );
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    userAddress.value = accounts[0];
    encryptionKey.value = deriveEncryptionKey(userAddress.value);
    showSuccessAlert(
      'Connected',
      'Wallet connected successfully!'
    );
  } catch (error) {
    if (error.code === 4001) {
      showErrorAlert(
        'Connection Rejected',
        'You rejected the wallet connection request.'
      );
    } else {
      showErrorAlert(
        'Connection Failed',
        'Failed to connect wallet. Please try again.'
      );
    }
    console.error(error);
  }
};

const switchNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    showErrorAlert(
      'Wallet Not Found',
      'Please install MetaMask or another Web3 wallet.'
    );
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
      showErrorAlert(
        'Switch Failed',
        'Failed to switch to Base network. Please try again.'
      );
      console.error(addError);
    }
  }
};

async function fetchGasPrice() {
  // let gasPrice = 0;
  // try {
  //   gasPrice = await web3.eth.getGasPrice();
  //   console.log('Gas Price:', gasPrice);
  // } catch (error) {
  //   console.error('Error fetching gas price:', error);
  // }

  const customGasPrice = web3.utils.toWei('0.1', 'gwei');
  // console.log('Custom Gas Price:', customGasPrice);

  // increase gas price by 10%
  // const customGasPrice = parseInt(gasPrice) * 1.1;

  return customGasPrice;
}

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
    showErrorAlert(
      'Wallet Not Found',
      'Please install MetaMask or another Web3 wallet.'
    );
    return;
  }

  if (!userAddress.value) {
    showErrorAlert(
      'Not Connected',
      'Please connect your wallet first.'
    );
    return;
  }

  if (!noteContent.value) {
    showErrorAlert(
      'Empty Note',
      'Please enter some content for your note.'
    );
    return;
  }

  isSubmitting.value = true;

  try {
    const noteId = nanoid();
    const noteIdHash = await hashNoteId(noteId);
    const noteIdBigInt = `0x${bigInt(noteIdHash, 16).toString(16)}`;
    const encryptedContent = encryptNote(noteContent.value, encryptionKey.value);

    // Estimate gas for the transaction
    let estimatedGas = 0;
    try {
      estimatedGas = Number(
        (await estimateGasForTransaction(
          contract,
          'addNote',
          [noteIdBigInt, encryptedContent],
          userAddress.value
        )) || 0
      );
      estimatedGas = Math.ceil(estimatedGas * 1.05);
    } catch (error) {
      console.error('Error estimating gas:', error);
      if (error.message.includes('insufficient fee')) {
        showErrorAlert(
          'Insufficient Funds',
          'You do not have enough funds to cover the transaction fee.'
        );
      } else {
        showErrorAlert(
          'Gas Estimation Failed',
          'Failed to estimate transaction cost. Please try again.'
        );
      }
      isSubmitting.value = false;
      return;
    }

    const currentGasPrice = await fetchGasPrice();
    const timestamp = Math.floor(Date.now() / 1000);
    const valueInWei = web3.utils.toWei(deployPriceETH, 'ether');

    const tx = await contract.methods
      .addNote(noteIdBigInt, encryptedContent)
      .send({
        from: userAddress.value,
        value: valueInWei,
        gas: estimatedGas,
        gasPrice: currentGasPrice,
      });

    txId.value = tx.transactionHash;

    // Add the note to the user's notes list
    userNotes.value = [
      {
        id: noteId,
        encryptedContent,
        decryptedContent: noteContent.value,
        createdTimestamp: timestamp,
      },
      ...userNotes.value,
    ];

    // Clear the note content after submission
    noteContent.value = '';
    txId.value = '';
    
    showSuccessAlert(
      'Note Saved',
      'Your note has been saved successfully!'
    );
  } catch (error) {
    console.error('Transaction error:', error);
    
    if (error.code === 4001) {
      showErrorAlert(
        'Transaction Rejected',
        'You rejected the transaction.'
      );
    } else if (error.message.includes('insufficient funds')) {
      showErrorAlert(
        'Insufficient Funds',
        'You do not have enough funds to complete the transaction.'
      );
    } else if (error.message.includes('nonce')) {
      showErrorAlert(
        'Transaction Error',
        'Transaction sequence error. Please reset your wallet or try again.'
      );
    } else {
      showErrorAlert(
        'Transaction Failed',
        'Failed to save note. Please try again.'
      );
    }
  } finally {
    isSubmitting.value = false;
  }
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
  try {
    const notes = await getWalletNotes(userAddress.value);

    // decrypt notes
    notes.forEach((note) => {
      note.decryptedContent = decryptNote(
        note.encryptedContent,
        encryptionKey.value
      );
    });

    // sort notes by timestamp in descending order
    notes.sort((a, b) => Number(b.createdTimestamp) - Number(a.createdTimestamp));

    userNotes.value = notes;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    showErrorAlert(
      'Fetch Error',
      'Failed to load your notes. Please try again.'
    );
  } finally {
    isLoading.value = false;
  }
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

const disconnectWallet = () => {
  userAddress.value = '';
  encryptionKey.value = '';
  userNotes.value = [];
  isLoading.value = true;
  showSuccessAlert(
    'Disconnected',
    'Wallet disconnected successfully!'
  );
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
    // getEstimatedGasForNoteCreation();
  }

  // Fetch ETH price and calculate deploy price in USD
  ethPriceUSD = parseFloat(await fetchETHPrice());
  console.log('ETH Price:', ethPriceUSD);
  deployPriceUSD = (ethPriceUSD * deployPriceETH).toFixed(2);
});
</script>

<style scoped>
.translate-y-full {
  transform: translateY(100%);
}

.translate-y-0 {
  transform: translateY(0);
}

/* Add max width constraint for larger screens */
:deep(.container) {
  max-width: 768px !important;
}

/* Ensure alert content is always visible */
:deep(.alert) {
  position: relative;
  z-index: 9999;
  width: 100%;
  overflow: visible;
}
</style>
