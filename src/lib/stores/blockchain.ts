import { writable } from 'svelte/store';

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
    name: 'BSC',
    symbol: 'BNB',
    decimals: 18,
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    explorerUrl: 'https://bscscan.com',
    testnet: {
      chainId: 97,
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
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