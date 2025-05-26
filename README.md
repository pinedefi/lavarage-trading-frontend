# Leverage Trading Frontend

A modern, responsive web application for decentralized leverage trading built with SvelteKit and TypeScript.

## Features

- **Modern UI/UX**: Clean, responsive design with dark/light theme support
- **Multi-Blockchain Ready**: Designed to support BSC, Solana, and Sui (currently BSC only)
- **Real-time Trading**: Live price feeds and order management
- **Wallet Integration**: Seamless wallet connection with Wagmi
- **Position Management**: Track and manage leveraged positions
- **Risk Management**: Built-in liquidation protection and risk metrics

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Authentication**: Wagmi wallet connection
- **State Management**: Svelte stores
- **Blockchain**: Wagmi (ready for multi-chain expansion)
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- A BSC wallet (MetaMask, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leverage-trading-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_BSC_RPC_URL=https://bsc-dataseed1.binance.org/
VITE_DEFAULT_NETWORK=bsc
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── stores/         # Svelte stores for state management
│   ├── services/       # Business logic and API calls
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
├── routes/             # SvelteKit routes
└── app.html           # HTML template
```

## Key Components

- **TradingPanel**: Main trading interface
- **PositionManager**: Position tracking and management
- **WalletWidget**: Wallet connection and management
- **PriceChart**: Real-time price visualization

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run type checking
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## Deployment

1. Build the application:
```bash
pnpm build
```

2. The built files will be in the `build/` directory

3. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.