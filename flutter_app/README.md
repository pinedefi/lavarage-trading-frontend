# Leverage Trading Flutter App

A Flutter application for leverage trading using Dynamic.xyz for wallet connectivity.

## Features

- Connect wallet using Dynamic.xyz
- Open long/short positions with customizable leverage
- View and manage open positions
- Real-time transaction updates
- Dark mode UI

## Getting Started

### Prerequisites

- Flutter SDK (latest version)
- iOS development tools (for iOS)
- Android development tools (for Android)
- Dynamic.xyz account and environment ID

### Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```env
# Dynamic.xyz configuration
DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# Ethereum network configuration
RPC_URL=your_ethereum_rpc_url
TRADING_CONTRACT_ADDRESS=your_trading_contract_address

# Optional configuration
CHAIN_ID=1  # 1 for Ethereum mainnet, 5 for Goerli testnet
```

To get these values:
1. Create an account on [Dynamic.xyz](https://www.dynamic.xyz)
2. Create a new environment and get your environment ID
3. Get an RPC URL from providers like Alchemy or Infura
4. Deploy your trading smart contract and get its address

### Installation

1. Clone the repository
2. Install dependencies:
```bash
flutter pub get
```

3. Create the `.env` file as described above

4. Run the app:
```bash
flutter run
```

### Building for Production

For iOS:
```bash
flutter build ios
```

For Android:
```bash
flutter build apk
```

## Architecture

The app follows a service-based architecture with the following components:

- `WalletService`: Handles wallet connectivity using Dynamic.xyz
- `TradingService`: Manages trading operations and position tracking
- Screens and Widgets: UI components for user interaction

### Project Structure

```
lib/
├── models/         # Data models
├── services/       # Business logic and API services
├── screens/        # App screens
├── widgets/        # Reusable UI components
├── utils/          # Helper functions and constants
└── main.dart       # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
