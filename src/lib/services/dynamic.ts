import { auth } from '$lib/stores/auth';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { browser } from '$app/environment';

export interface DynamicUserProfile {
  id: string;
  email?: string;
  walletAddress: string;
  chain: string;
  walletName: string;
}

export interface DynamicConfig {
  environmentId: string;
  walletConnectors: any[];
  events?: {
    onAuthSuccess?: (args: any) => void;
    onLogout?: () => void;
    onAuthFailure?: (error: any) => void;
  };
}

// Dynamic SDK instance
let dynamicClient: any = null;
let dynamicConfig: DynamicConfig | null = null;

// Initialize Dynamic configuration
export function initializeDynamic() {
  if (!browser) return;
  
  const environmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  
  if (!environmentId) {
    console.error('Dynamic.xyz environment ID not found. Please add VITE_DYNAMIC_ENVIRONMENT_ID to your .env file');
    return;
  }
  
  dynamicConfig = {
    environmentId,
    walletConnectors: [EthereumWalletConnectors],
    events: {
      onAuthSuccess: async (args: any) => {
        const { user, primaryWallet } = args;
        
        if (user && primaryWallet) {
          const profile: DynamicUserProfile = {
            id: user.id,
            email: user.email || undefined,
            walletAddress: primaryWallet.address,
            chain: primaryWallet.chain || 'ethereum',
            walletName: primaryWallet.connector?.name || 'Unknown Wallet'
          };
          
          auth.setUser(profile);
          
          // Store session for persistence
          if (browser) {
            try {
              localStorage.setItem('dynamic_user', JSON.stringify(profile));
            } catch (e) {
              console.error('Failed to save session:', e);
            }
          }
        }
      },
      onLogout: () => {
        auth.logout();
        if (browser) {
          try {
            localStorage.removeItem('dynamic_user');
          } catch (e) {
            console.error('Failed to clear session:', e);
          }
        }
      },
      onAuthFailure: (error: any) => {
        console.error('Authentication failed:', error);
        auth.setError(error.message || 'Authentication failed');
      }
    }
  };
  
  // Check for existing session
  if (browser) {
    try {
      const savedUser = localStorage.getItem('dynamic_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        auth.setUser(user);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
  }
}

// Get Dynamic configuration for React components
export function getDynamicConfig(): DynamicConfig | null {
  return dynamicConfig;
}

// Connect wallet using Dynamic SDK
export async function connectWallet(): Promise<void> {
  auth.setLoading(true);
  auth.setError(null);
  
  try {
    if (!dynamicClient) {
      throw new Error('Dynamic SDK not initialized');
    }
    
    // The actual connection is handled by the DynamicWidget component
    // This function is called when user clicks connect, but the SDK handles the flow
    dynamicClient.setShowAuthFlow(true);
  } catch (error) {
    console.error('Wallet connection error:', error);
    auth.setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    throw error;
  } finally {
    auth.setLoading(false);
  }
}

// Disconnect wallet
export async function disconnectWallet(): Promise<void> {
  auth.setLoading(true);
  
  try {
    if (dynamicClient && dynamicClient.logout) {
      await dynamicClient.logout();
    }
    
    auth.logout();
    
    if (browser) {
      try {
        localStorage.removeItem('dynamic_user');
      } catch (e) {
        console.error('Failed to clear session:', e);
      }
    }
  } catch (error) {
    console.error('Disconnect error:', error);
    auth.setError('Failed to disconnect wallet');
    throw error;
  } finally {
    auth.setLoading(false);
  }
}

// Set Dynamic client instance (called from DynamicProvider component)
export function setDynamicClient(client: any) {
  dynamicClient = client;
}

// Get current connected wallets
export function getConnectedWallets() {
  if (!dynamicClient) return [];
  return dynamicClient.connectedWallets || [];
}

// Get primary wallet
export function getPrimaryWallet() {
  const wallets = getConnectedWallets();
  return wallets.find((w: any) => w.isPrimary) || wallets[0] || null;
}

// Switch network
export async function switchNetwork(chainId: number) {
  const wallet = getPrimaryWallet();
  if (!wallet) {
    throw new Error('No wallet connected');
  }
  
  try {
    await wallet.switchNetwork(chainId);
  } catch (error) {
    console.error('Network switch error:', error);
    throw error;
  }
}

// Sign message
export async function signMessage(message: string) {
  const wallet = getPrimaryWallet();
  if (!wallet) {
    throw new Error('No wallet connected');
  }
  
  try {
    const signature = await wallet.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Message signing error:', error);
    throw error;
  }
}

// Get signer for ethers.js
export async function getSigner() {
  const wallet = getPrimaryWallet();
  if (!wallet) {
    throw new Error('No wallet connected');
  }
  
  try {
    const signer = await wallet.getSigner();
    return signer;
  } catch (error) {
    console.error('Failed to get signer:', error);
    throw error;
  }
}