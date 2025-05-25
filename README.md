# Crypto Trading Platform

A modern, professional crypto trading platform built with SvelteKit, featuring leveraged trading and position management.

## Features

- **Leveraged Trading**: Open long positions with up to 100x leverage
- **Position Management**: Monitor and manage open positions in real-time
- **Multi-Blockchain Ready**: Designed to support Ethereum, Solana, and Sui (currently Ethereum only)
- **Dynamic.xyz Integration**: Secure wallet authentication
- **Modern UI**: Dark theme with red, purple, and orange accents
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: TailwindCSS with custom design system
- **Authentication**: Dynamic.xyz SDK
- **Icons**: Lucide Svelte
- **Blockchain**: Ethers.js (ready for multi-chain expansion)
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/piske-alex/leverage-trading-frontend.git
cd leverage-trading-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Add your Dynamic.xyz environment ID and other configuration.

4. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Project Structure

```
src/
├── routes/          # SvelteKit routes
├── lib/
│   ├── components/  # Reusable UI components
│   ├── stores/      # Svelte stores for state management
│   ├── services/    # API and blockchain services
│   └── utils/       # Helper functions
├── app.css          # Global styles
└── app.html         # HTML template
```

## Key Components

- **TradingPanel**: Main interface for opening leveraged positions
- **PositionCard**: Displays individual position details
- **LeverageSlider**: Interactive leverage selection
- **AuthButton**: Dynamic.xyz wallet connection

## Design Guidelines

- Keep files under 500 lines
- Use TypeScript for type safety
- Follow the established color scheme
- Maintain blockchain-agnostic architecture

## Future Enhancements

- [ ] Short positions
- [ ] Advanced order types (stop-loss, take-profit)
- [ ] Solana blockchain support
- [ ] Sui blockchain support
- [ ] Real-time price charts
- [ ] Trading history
- [ ] Portfolio analytics

## License

MIT