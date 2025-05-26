# Wagmi Wallet Integration Setup

This guide covers the setup and configuration of Wagmi for wallet connections in the BSC trading platform.

## Overview

Wagmi is a React Hooks library for BSC that provides:
- Support for multiple wallet types (MetaMask, Coinbase Wallet, WalletConnect, etc.)
- Type-safe interactions with BSC
- Automatic connection state management
- Network switching capabilities

## Setup

### 1. Environment Configuration

Create a `.env` file with your WalletConnect project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. WalletConnect Project Setup

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID to your `.env` file

### 3. Supported Wallets

The current configuration supports:
- **Injected wallets** (MetaMask, Brave, etc.)
- **MetaMask** (dedicated connector)
- **Coinbase Wallet**
- **WalletConnect** (for mobile wallets)

## Configuration

The main configuration is in `src/lib/config/wagmi.ts`:

```typescript
import { createConfig, http } from '@wagmi/core'
import { bsc, bscTestnet } from '@wagmi/core/chains'
import { injected, metaMask, coinbaseWallet, walletConnect } from '@wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'BSC Trading Platform',
      appLogoUrl: 'https://example.com/logo.png'
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'BSC Trading Platform',
        description: 'Decentralized trading on BSC',
        url: 'https://example.com',
        icons: ['https://example.com/logo.png']
      }
    })
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http()
  }
})
```

## Usage

### Connecting a Wallet

```typescript
import { connectWallet } from '$lib/services/wallet'

// Connect with a specific connector
await connectWallet(connector)
```

### Getting Current Account

```typescript
import { getCurrentAccount } from '$lib/services/wallet'

const account = getCurrentAccount()
console.log(account.address) // User's BSC address
```

### Signing Messages

```typescript
import { signMessage } from '$lib/services/wallet'

const signature = await signMessage('Hello BSC!')
```

### Switching Networks

```typescript
import { switchNetwork } from '$lib/services/wallet'

// Switch to BSC mainnet
await switchNetwork(56)

// Switch to BSC testnet
await switchNetwork(97)
```

## Components

### WalletWidget

The main wallet connection component (`src/lib/components/WalletWidget.svelte`) provides:
- Modal interface for wallet selection
- Connection state management
- Error handling
- SSR compatibility

### AuthButton

The authentication button (`src/lib/components/AuthButton.svelte`) shows:
- Connect button when disconnected
- User address and balance when connected
- Disconnect functionality

## Troubleshooting

### Common Issues

1. **WalletConnect not working**: Ensure your project ID is correct in the `.env` file
2. **SSR errors**: The wallet connectors are only initialized on the client side
3. **Network issues**: Make sure you're connected to BSC mainnet or testnet

### Development Tips

- Use BSC testnet for development
- Test with multiple wallet types
- Check browser console for detailed error messages

## Production Deployment

1. Set up proper environment variables
2. Configure your domain in WalletConnect Cloud
3. Test wallet connections on your production domain
4. Monitor for any BSC network issues

## Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Viem Documentation](https://viem.sh/)
- [BSC Documentation](https://docs.bnbchain.org/) 
