import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { 
  StacksMainnet, 
  StacksTestnet,
  StacksNetwork 
} from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
  someCV,
  noneCV,
  stringUtf8CV,
  trueCV,
  falseCV,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions';

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Get network configuration
export function getNetwork(): StacksNetwork {
  const networkType = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}

// Contract details
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'linkchain-tips';

// Connect wallet
export function connectWallet(onFinish?: (userData: any) => void) {
  showConnect({
    appDetails: {
      name: 'LinkChain',
      icon: '/logo.png',
    },
    redirectTo: '/',
    onFinish: (userData) => {
      console.log('Wallet connected:', userData);
      if (onFinish) onFinish(userData);
    },
    userSession,
  });
}

// Disconnect wallet
export function disconnectWallet() {
  userSession.signUserOut();
}

// Check if wallet is connected
export function isWalletConnected(): boolean {
  return userSession.isUserSignedIn();
}

// Get user address
export function getUserAddress(): string | null {
  if (!userSession.isUserSignedIn()) return null;
  const userData = userSession.loadUserData();
  return userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
}

// Get user profile
export function getUserProfile() {
  if (!userSession.isUserSignedIn()) return null;
  return userSession.loadUserData();
}

// Send tip to creator
export async function sendTip(
  creatorAddress: string,
  amount: number,
  message?: string,
  anonymous: boolean = false
): Promise<string> {
  const network = getNetwork();
  const senderAddress = getUserAddress();
  
  if (!senderAddress) {
    throw new Error('Wallet not connected');
  }

  // Convert amount to microSTX
  const microSTXAmount = Math.floor(amount * 1000000);

  const functionArgs = [
    principalCV(creatorAddress),
    uintCV(microSTXAmount),
    message ? someCV(stringUtf8CV(message)) : noneCV(),
    anonymous ? trueCV() : falseCV(),
  ];

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'send-tip',
    functionArgs,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    senderKey: senderAddress,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      throw new Error(broadcastResponse.error);
    }
    
    return broadcastResponse.txid;
  } catch (error) {
    console.error('Error sending tip:', error);
    throw error;
  }
}

// Get creator earnings
export async function getCreatorEarnings(creatorAddress: string): Promise<number> {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-creator-earnings',
      functionArgs: [principalCV(creatorAddress)],
      network,
      senderAddress: creatorAddress,
    });

    const earnings = cvToJSON(result).value;
    return Number(earnings) / 1000000; // Convert microSTX to STX
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return 0;
  }
}

// Get tip count for creator
export async function getTipCount(creatorAddress: string): Promise<number> {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-tip-count',
      functionArgs: [principalCV(creatorAddress)],
      network,
      senderAddress: creatorAddress,
    });

    return Number(cvToJSON(result).value);
  } catch (error) {
    console.error('Error fetching tip count:', error);
    return 0;
  }
}

// Get tip details
export async function getTipDetails(
  creatorAddress: string,
  tipId: number
): Promise<any> {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-tip-details',
      functionArgs: [principalCV(creatorAddress), uintCV(tipId)],
      network,
      senderAddress: creatorAddress,
    });

    return cvToJSON(result);
  } catch (error) {
    console.error('Error fetching tip details:', error);
    return null;
  }
}

// Get all tips for a creator
export async function getAllTips(creatorAddress: string): Promise<any[]> {
  const tipCount = await getTipCount(creatorAddress);
  const tips = [];

  for (let i = 1; i <= tipCount; i++) {
    const tipDetails = await getTipDetails(creatorAddress, i);
    if (tipDetails && tipDetails.value) {
      tips.push({
        id: i,
        ...tipDetails.value,
      });
    }
  }

  return tips;
}

// Calculate platform fee
export async function calculateFee(amount: number): Promise<number> {
  const network = getNetwork();
  const microSTXAmount = Math.floor(amount * 1000000);

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'calculate-fee',
      functionArgs: [uintCV(microSTXAmount)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    return Number(cvToJSON(result).value) / 1000000;
  } catch (error) {
    console.error('Error calculating fee:', error);
    return 0;
  }
}

// Verify transaction
export async function verifyTransaction(txId: string): Promise<boolean> {
  const network = getNetwork();
  const apiUrl = network.isMainnet() 
    ? 'https://stacks-node-api.mainnet.stacks.co'
    : 'https://stacks-node-api.testnet.stacks.co';

  try {
    const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);
    const data = await response.json();
    return data.tx_status === 'success';
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}
