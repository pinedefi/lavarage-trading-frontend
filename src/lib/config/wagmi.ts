import { createConfig, http } from '@wagmi/core';
import { bsc, bscTestnet } from '@wagmi/core/chains';
import { injected, metaMask, coinbaseWallet, walletConnect } from '@wagmi/connectors';

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'Crypto Trading Platform',
      appLogoUrl: 'https://example.com/logo.png',
    }),
    // walletConnect({
    //   projectId,
    //   metadata: {
    //     name: 'Crypto Trading Platform',
    //     description: 'Professional crypto trading with leverage',
    //     url: 'https://example.com',
    //     icons: ['https://example.com/logo.png'],
    //   },
    // }),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

export type Config = typeof config; 
