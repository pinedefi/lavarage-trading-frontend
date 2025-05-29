import { browser } from '$app/environment';

export interface TokenModel {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  decimals: number;
  change24h: number;
  volume24h: string;
}

export interface OfferAccount {
  interestRate: number;
  collateralType: string;
  maxBorrow: string;
  nodeWallet: string;
  maxExposure: string;
  currentExposure: string;
}

export interface OfferEvmModel {
  publicKey: string;
  apr: number;
  maxBorrow: string;
  nodeWallet: string;
  maxExposure: string;
  currentExposure: string;
  collateralToken?: TokenModel;
  quoteToken: TokenModel | string;
  maxLeverage: number;
  maxOpenPerTrade: string;
  availableForOpen: string;
  tags: string[];
  active: boolean;
  account: OfferAccount;
  priceVsQuote: string;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  category: string;
  isFavorite: boolean;
  isActive: boolean;
  maxLeverage: number;
  apr: number;
  availableForOpen: string;
  maxBorrow?: string;
  maxOpenPerTrade?: string;
  maxExposure?: string;
  currentExposure?: string;
  collateralToken?: TokenModel;
  quoteToken: TokenModel | string;
  priceVsQuote: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ng-api.lavarave.wtf/api/sdk/v1.0';
const API_KEY = import.meta.env.VITE_LAVARAGE_API_KEY || 'your_api_key_here';

export async function fetchBscOffers(): Promise<OfferEvmModel[]> {
  if (!browser) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/offers/bsc`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const offers: OfferEvmModel[] = await response.json();
    return offers.filter(offer => offer.active);
  } catch (error) {
    console.error('Failed to fetch BSC offers:', error);
    return [];
  }
}

export function transformOfferToMarket(offer: OfferEvmModel): MarketData {
  const collateralToken = offer.collateralToken;
  const quoteTokenSymbol = typeof offer.quoteToken === 'string' 
    ? 'BNB' // Default for BSC
    : offer.quoteToken.symbol;

  const symbol = collateralToken 
    ? `${offer.collateralToken?.symbol}-${quoteTokenSymbol}`
    : 'UNKNOWN-PERP';

  const name = collateralToken 
    ? `${collateralToken.name}`
    : 'Unknown Margin';

  // Mock price data - in a real app, you'd fetch this from a price API
  const mockPrices: Record<string, { price: number; change24h: number; volume: number }> = {
    'BNB': { price: 542.18, change24h: 2.45, volume: 24800000000 },
    'WBNB': { price: 542.18, change24h: 2.45, volume: 24800000000 },
    'USDT': { price: 1.0001, change24h: 0.01, volume: 45000000000 },
    'USDC': { price: 0.9999, change24h: -0.01, volume: 38000000000 },
    'BUSD': { price: 1.0002, change24h: 0.02, volume: 12000000000 },
    'CAKE': { price: 2.45, change24h: 3.21, volume: 890000000 },
    'ADA': { price: 0.4521, change24h: 1.89, volume: 890000000 },
    'DOT': { price: 6.78, change24h: -0.95, volume: 234000000 },
    'MATIC': { price: 0.8234, change24h: 4.12, volume: 670000000 },
    'AVAX': { price: 35.67, change24h: -1.78, volume: 890000000 },
    'ETH': { price: 2650.40, change24h: 3.67, volume: 89000000000 },
    'BTC': { price: 43250.75, change24h: -1.23, volume: 120000000000 },
  };

  const tokenSymbol = collateralToken?.symbol || 'UNKNOWN';
  const priceData = mockPrices[tokenSymbol] || mockPrices['BNB'];

  return {
    symbol,
    name,
    price: Number(offer.priceVsQuote),
    change24h: offer.collateralToken?.change24h || 0,
    volume24h: Number(offer.collateralToken?.volume24h) || 0,
    category: 'margin',
    isFavorite: false,
    isActive: offer.active,
    maxLeverage: offer.maxLeverage,
    apr: offer.apr,
    availableForOpen: offer.availableForOpen,
    maxBorrow: offer.maxBorrow,
    maxOpenPerTrade: offer.maxOpenPerTrade,
    maxExposure: offer.maxExposure,
    currentExposure: offer.currentExposure,
    collateralToken: offer.collateralToken,
    quoteToken: offer.quoteToken,
    priceVsQuote: offer.priceVsQuote,
  };
}

export async function getMarketData(): Promise<MarketData[]> {
  try {
    const offers = await fetchBscOffers();
    return offers.map(transformOfferToMarket);
  } catch (error) {
    console.error('Failed to get market data:', error);
    // Return empty array if network request fails
    return [];
  }
}

export function getMockMarketData(): MarketData[] {
  return [
    {
      symbol: 'BNB-BNB-PERP',
      name: 'BNB Margin',
      price: 542.18,
      change24h: 2.45,
      volume24h: 24800000000,
      category: 'margin',
      isFavorite: true,
      isActive: true,
      maxLeverage: 10,
      apr: 12.5,
      availableForOpen: '1000000000000',
      maxBorrow: '500000000000',
      maxOpenPerTrade: '100000000000',
      maxExposure: '2000000000000',
      currentExposure: '800000000000',
      quoteToken: 'BNB',
      priceVsQuote: '1.0000',
    },
    {
      symbol: 'USDT-BNB-PERP',
      name: 'USDT Margin',
      price: 1.0001,
      change24h: 0.01,
      volume24h: 45000000000,
      category: 'margin',
      isFavorite: false,
      isActive: true,
      maxLeverage: 20,
      apr: 8.2,
      availableForOpen: '2000000000000',
      maxBorrow: '1000000000000',
      maxOpenPerTrade: '200000000000',
      maxExposure: '4000000000000',
      currentExposure: '1500000000000',
      quoteToken: 'BNB',
      priceVsQuote: '1.0001',
    },
    {
      symbol: 'USDC-BNB-PERP',
      name: 'USDC Margin',
      price: 0.9999,
      change24h: -0.01,
      volume24h: 38000000000,
      category: 'margin',
      isFavorite: false,
      isActive: true,
      maxLeverage: 20,
      apr: 7.8,
      availableForOpen: '1800000000000',
      maxBorrow: '800000000000',
      maxOpenPerTrade: '150000000000',
      maxExposure: '3500000000000',
      currentExposure: '1200000000000',
      quoteToken: 'BNB',
      priceVsQuote: '0.9999',
    },
    {
      symbol: 'CAKE-BNB-PERP',
      name: 'PancakeSwap Margin',
      price: 2.45,
      change24h: 3.21,
      volume24h: 890000000,
      category: 'margin',
      isFavorite: false,
      isActive: true,
      maxLeverage: 15,
      apr: 15.3,
      availableForOpen: '500000000000',
      maxBorrow: '250000000000',
      maxOpenPerTrade: '50000000000',
      maxExposure: '1000000000000',
      currentExposure: '200000000000',
      quoteToken: 'BNB',
      priceVsQuote: '1.0000',
    },
  ];
}
