# Dynamic.xyz Setup Guide

This guide will help you set up Dynamic.xyz authentication for the trading platform.

## Prerequisites

1. Create a Dynamic.xyz account at [https://app.dynamic.xyz](https://app.dynamic.xyz)
2. Create a new project in the Dynamic dashboard
3. Get your Environment ID from the project settings

## Configuration Steps

### 1. Environment Setup

Copy `.env.example` to `.env` and add your Dynamic environment ID:

```bash
cp .env.example .env
```

Edit `.env` and update:
```env
VITE_DYNAMIC_ENVIRONMENT_ID=your_actual_environment_id_here
```

### 2. Dynamic Dashboard Configuration

In your Dynamic.xyz dashboard:

1. **Allowed Origins**
   - Add `http://localhost:5173` for development
   - Add your production domain when deploying

2. **Chain Configuration**
   - Enable Ethereum Mainnet
   - Configure any additional chains you want to support

3. **Wallet Connectors**
   - Enable the wallet connectors you want to support:
     - MetaMask
     - WalletConnect
     - Coinbase Wallet
     - etc.

4. **Authentication Settings**
   - Enable "Email" if you want email authentication
   - Configure social logins if desired

### 3. Advanced Configuration (Optional)

You can customize the Dynamic configuration in `src/lib/services/dynamic.ts`:

```typescript
dynamicConfig = {
  environmentId,
  walletConnectors: [EthereumWalletConnectors],
  // Add more configuration options
  settings: {
    // Customize the authentication modal
    initialAuthenticationMode: 'wallet-only',
    
    // Customize styling
    shadowDOMEnabled: false,
    cssOverrides: `
      .dynamic-widget-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    `,
    
    // Network settings
    defaultNetwork: 1, // Ethereum Mainnet
    networksFilter: [1, 137, 42161], // Ethereum, Polygon, Arbitrum
  }
};
```

### 4. Using Dynamic Features

#### Get Connected Wallet
```typescript
import { getPrimaryWallet } from '$lib/services/dynamic';

const wallet = getPrimaryWallet();
if (wallet) {
  console.log('Wallet address:', wallet.address);
  console.log('Chain:', wallet.chain);
}
```

#### Sign Messages
```typescript
import { signMessage } from '$lib/services/dynamic';

try {
  const signature = await signMessage('Hello from Trading Platform!');
  console.log('Signature:', signature);
} catch (error) {
  console.error('Failed to sign message:', error);
}
```

#### Get Ethers.js Signer
```typescript
import { getSigner } from '$lib/services/dynamic';
import { ethers } from 'ethers';

try {
  const signer = await getSigner();
  // Use signer with ethers.js contracts
  const contract = new ethers.Contract(address, abi, signer);
} catch (error) {
  console.error('Failed to get signer:', error);
}
```

#### Switch Networks
```typescript
import { switchNetwork } from '$lib/services/dynamic';

// Switch to Polygon
try {
  await switchNetwork(137);
} catch (error) {
  console.error('Failed to switch network:', error);
}
```

## Troubleshooting

### Common Issues

1. **"Dynamic.xyz environment ID not found"**
   - Make sure you've added `VITE_DYNAMIC_ENVIRONMENT_ID` to your `.env` file
   - Restart the development server after adding environment variables

2. **Wallet not connecting**
   - Check that your domain is added to "Allowed Origins" in Dynamic dashboard
   - Ensure the wallet connectors are enabled in your Dynamic project

3. **SSR Issues**
   - The Dynamic SDK is only loaded on the client side
   - All Dynamic-related code should check for `browser` environment

4. **Styling Issues**
   - Dynamic uses Shadow DOM by default
   - You can disable it or use `cssOverrides` for custom styling

## Production Deployment

1. Add your production domain to "Allowed Origins" in Dynamic dashboard
2. Update environment variables in your production environment
3. Consider implementing proper error handling and loading states
4. Enable analytics in Dynamic dashboard to track user authentication

## Security Best Practices

1. Never expose private keys or sensitive data
2. Always validate signatures on the backend
3. Implement proper session management
4. Use HTTPS in production
5. Implement rate limiting for authentication attempts

## Support

- Dynamic.xyz Documentation: [https://docs.dynamic.xyz](https://docs.dynamic.xyz)
- Dynamic.xyz Discord: [https://discord.gg/dynamic](https://discord.gg/dynamic)
- GitHub Issues: [https://github.com/dynamic-labs/sdk](https://github.com/dynamic-labs/sdk)