import { createConfig, http } from '@wagmi/core';
import type { Chain } from 'viem';
import { defineChain } from 'viem';
import { injected, metaMask, coinbaseWallet } from '@wagmi/connectors';
import { appConfig } from '$lib/config/appConfig';

// Define BERACHAIN chain
export const berachain = defineChain({
  id: appConfig.network.chain_id,
  name: appConfig.network.name,
  nativeCurrency: {
    name: appConfig.token.gas_symbol,
    symbol: appConfig.token.gas_symbol,
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [appConfig.network.rpc] },
    public: { http: [appConfig.network.rpc] },
  },
});

// Get environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = createConfig({
  chains: [berachain],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: `${appConfig.network.name} Trading Platform`,
      appLogoUrl: appConfig.branding.logo,
    }),
  ],
  transports: {
    [berachain.id]: http(),
  },
});

export type Config = typeof config; 
