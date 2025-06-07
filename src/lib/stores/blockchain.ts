import { writable } from 'svelte/store';
import { appConfig } from '$lib/config/appConfig';

export type SupportedBlockchain = 'bsc' | 'solana' | 'sui';

export interface BlockchainConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  testnet?: {
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
  };
}

export const blockchainConfigs: Record<SupportedBlockchain, BlockchainConfig> = {
  bsc: {
    id: 'bsc',
    name: appConfig.network.name,
    symbol: appConfig.token.gas_symbol,
    decimals: 18,
    chainId: appConfig.network.chain_id,
    rpcUrl: appConfig.network.rpc,
    explorerUrl: 'https://bscscan.com',
    testnet: {
      chainId: appConfig.network.testnet_chain_id,
      rpcUrl: appConfig.network.rpc,
      explorerUrl: 'https://testnet.bscscan.com'
    }
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    chainId: 101,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    testnet: {
      chainId: 103,
      rpcUrl: 'https://api.devnet.solana.com',
      explorerUrl: 'https://explorer.solana.com?cluster=devnet'
    }
  },
  sui: {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    decimals: 9,
    chainId: 1,
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://explorer.sui.io',
    testnet: {
      chainId: 2,
      rpcUrl: 'https://fullnode.testnet.sui.io:443',
      explorerUrl: 'https://explorer.sui.io/?network=testnet'
    }
  }
};

function createBlockchainStore() {
  const { subscribe, set, update } = writable({
    current: 'bsc' as SupportedBlockchain,
    config: blockchainConfigs.bsc,
    isTestnet: false
  });

  return {
    subscribe,
    switchBlockchain: (blockchain: SupportedBlockchain) => {
      update(state => ({
        ...state,
        current: blockchain,
        config: blockchainConfigs[blockchain]
      }));
    },
    toggleTestnet: () => {
      update(state => ({
        ...state,
        isTestnet: !state.isTestnet
      }));
    },
    reset: () => set({
      current: 'bsc',
      config: blockchainConfigs.bsc,
      isTestnet: false
    })
  };
}

export const blockchain = createBlockchainStore();