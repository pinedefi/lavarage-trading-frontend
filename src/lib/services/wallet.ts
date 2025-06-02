import { connect, disconnect, getAccount, getBalance, switchChain, signMessage as wagmiSignMessage } from '@wagmi/core';
import { config } from '$lib/config/wagmi';
import { auth } from '$lib/stores/auth';
import { browser } from '$app/environment';
import type { Connector } from '@wagmi/core';

type ChainId = (typeof config.chains)[number]['id'];

export interface WalletProfile {
  id: string;
  walletAddress: string;
  chain: string;
  walletName: string;
  balance?: string;
}

// Connect wallet using Wagmi
export async function connectWallet(connector: Connector): Promise<void> {
  if (!browser) throw new Error('Wallet connection only available in browser');
  
  auth.setLoading(true);
  auth.setError(null);
  
  try {
    // Connect using Wagmi
    const result = await connect(config, { connector });
    
    // Get account info
    const account = getAccount(config);
    
    if (!account.address) {
      throw new Error('No account found after connection');
    }
    
    // Get balance
    const balance = await getBalance(config, {
      address: account.address,
    });
    
    // Create user profile
    const profile: WalletProfile = {
      id: account.address,
      walletAddress: account.address,
      chain: account.chain?.name || 'bsc',
      walletName: connector.name,
      balance: balance.formatted
    };
    
    // Update auth store
    auth.setUser(profile);
    
    // Store session for persistence
    try {
      localStorage.setItem('wagmi_session', JSON.stringify({
        connectorId: connector.id,
        address: account.address,
        walletName: connector.name
      }));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
    
  } catch (error) {
    console.error('Wallet connection error:', error);
    const message = error instanceof Error ? error.message : 'Failed to connect wallet';
    auth.setError(message);
    throw error;
  } finally {
    auth.setLoading(false);
  }
}

// Disconnect wallet
export async function disconnectWallet(): Promise<void> {
  auth.setLoading(true);
  
  try {
    // Disconnect using Wagmi
    await disconnect(config);
    
    // Clear auth state
    auth.logout();
    
    // Clear session storage
    try {
      localStorage.removeItem('wagmi_session');
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
    
  } catch (error) {
    console.error('Disconnect error:', error);
    auth.setError('Failed to disconnect wallet');
    throw error;
  } finally {
    auth.setLoading(false);
  }
}

// Get current account
export function getCurrentAccount() {
  return getAccount(config);
}

// Switch network
export async function switchNetwork(chainId: ChainId): Promise<void> {
  try {
    await switchChain(config, { chainId });
  } catch (error) {
    console.error('Network switch error:', error);
    throw error;
  }
}

// Sign a message using Wagmi
export async function signMessage(message: string): Promise<string> {
  try {
    const account = getAccount(config);
    if (!account.address) {
      throw new Error('No wallet connected');
    }
    
    return await wagmiSignMessage(config, { message });
  } catch (error) {
    console.error('Message signing error:', error);
    throw error;
  }
}

// Restore wallet session on page load
export async function restoreWalletSession(): Promise<void> {
  if (!browser) return;

  try {
    const account = getAccount(config);

    if (account.isConnected && account.address) {
      // Already connected; sync state
      const balance = await getBalance(config, { address: account.address });

      const profile: WalletProfile = {
        id: account.address,
        walletAddress: account.address,
        chain: account.chain?.name || 'bsc',
        walletName: account.connector?.name || 'Unknown Wallet',
        balance: balance.formatted,
      };

      auth.setUser(profile);
      return;
    }

    const stored = localStorage.getItem('wagmi_session');
    if (!stored) return;

    const { connectorId } = JSON.parse(stored);
    const connector = config.connectors.find((c) => c.id === connectorId);
    if (connector) {
      await connectWallet(connector);
    }
  } catch (e) {
    console.warn('Failed to restore session:', e);
  }
}
