import { writable, derived } from 'svelte/store';

export type SupportedBlockchain = 'ethereum' | 'solana' | 'sui';

export interface BlockchainConfig {
  id: SupportedBlockchain;
  name: string;
  symbol: string;
  icon: string;
  chainId?: number;
  rpcUrl: string;
  explorerUrl: string;
  decimals: number;
  supported: boolean;
}

export const BLOCKCHAIN_CONFIGS: Record<SupportedBlockchain, BlockchainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    explorerUrl: 'https://etherscan.io',
    decimals: 18,
    supported: true
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    decimals: 9,
    supported: false // Future support
  },
  sui: {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    icon: '⟐',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://suiexplorer.com',
    decimals: 9,
    supported: false // Future support
  }
};

interface BlockchainState {
  current: SupportedBlockchain;
  configs: typeof BLOCKCHAIN_CONFIGS;
}

function createBlockchainStore() {
  const { subscribe, set, update } = writable<BlockchainState>({
    current: 'ethereum',
    configs: BLOCKCHAIN_CONFIGS
  });

  return {
    subscribe,
    setBlockchain: (blockchain: SupportedBlockchain) => {
      if (BLOCKCHAIN_CONFIGS[blockchain].supported) {
        update(state => ({ ...state, current: blockchain }));
      }
    },
    getCurrentConfig: () => {
      let config: BlockchainConfig;
      subscribe(state => {
        config = state.configs[state.current];
      })();
      return config!;
    }
  };
}

export const blockchain = createBlockchainStore();

export const currentBlockchain = derived(
  blockchain,
  $blockchain => $blockchain.configs[$blockchain.current]
);

export const supportedBlockchains = derived(
  blockchain,
  $blockchain => Object.values($blockchain.configs).filter(b => b.supported)
);