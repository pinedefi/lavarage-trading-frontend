// Blockchain configurations
export const CHAIN_IDS = {
  BSC: 80085, // BERACHAIN chain ID
  BSC_TESTNET: 80085, // BERACHAIN testnet chain ID (using same for now)
  SOLANA: 101,
  SUI: 1
};

export const CHAIN_NAMES = {
  [CHAIN_IDS.BSC]: 'BERACHAIN',
  [CHAIN_IDS.BSC_TESTNET]: 'BERACHAIN Testnet',
  [CHAIN_IDS.SOLANA]: 'Solana',
  [CHAIN_IDS.SUI]: 'Sui'
};

export const DEFAULT_CHAIN_ID = CHAIN_IDS.BSC;

// Trading constants
export const TRADING_CONSTANTS = {
  MAX_LEVERAGE: Number(import.meta.env.VITE_MAX_LEVERAGE) || 100,
  DEFAULT_LEVERAGE: Number(import.meta.env.VITE_DEFAULT_LEVERAGE) || 10,
  MIN_POSITION_SIZE: Number(import.meta.env.VITE_MIN_POSITION_SIZE) || 0.001,
  MAINTENANCE_MARGIN_RATE: Number(import.meta.env.VITE_MAINTENANCE_MARGIN_RATE) || 0.005,
  TRADING_FEE_RATE: 0.0005, // 0.05%
  FUNDING_RATE_INTERVAL: 8 * 60 * 60 * 1000, // 8 hours in ms
} as const;

// API endpoints
import { appConfig } from '$lib/config/appConfig';

export const API_ENDPOINTS = {
  BASE_URL: appConfig.api.base_url,
  OFFERS: '/offers/v2',
  POSITIONS: '/positions/v3',
  OPEN_POSITION: '/positions/open',
  CLOSE_POSITION: '/positions/sell',
  PRICE_FEED: '/jupiter/price',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_TESTNET: import.meta.env.VITE_ENABLE_TESTNET === 'true',
  ENABLE_MOCK_TRADING: import.meta.env.VITE_ENABLE_MOCK_TRADING === 'true',
  ENABLE_PRICE_FEEDS: import.meta.env.VITE_ENABLE_PRICE_FEEDS === 'true',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  PRICE_UPDATE_INTERVAL: 5000,
  POSITION_UPDATE_INTERVAL: 10000,
  MAX_SLIPPAGE: 0.05, // 5%
  DEFAULT_SLIPPAGE: 0.005, // 0.5%
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Please enter a valid amount',
  POSITION_NOT_FOUND: 'Position not found',
  NETWORK_ERROR: 'Network error. Please try again',
  SIGNATURE_REJECTED: 'Transaction signature rejected',
  SLIPPAGE_TOO_HIGH: 'Price impact too high',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  POSITION_OPENED: 'Position opened successfully',
  POSITION_CLOSED: 'Position closed successfully',
  WALLET_CONNECTED: 'Wallet connected successfully',
  TRANSACTION_SUBMITTED: 'Transaction submitted',
} as const;