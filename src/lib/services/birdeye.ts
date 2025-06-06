// Birdeye API service for BSC price data
const BIRDEYE_API_BASE = 'https://public-api.birdeye.so';
import { appConfig } from '$lib/config/appConfig';

export interface TokenPrice {
  address: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
}

export interface PriceResponse {
  data: {
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
    priceChange24h: number;
  };
  success: boolean;
}

// Token addresses for BSC
export const BSC_TOKEN_ADDRESSES = {
  [appConfig.token.gas_symbol]: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
  'USDT': '0x55d398326f99059fF775485246999027B3197955',
  'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  'ADA': '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
  'DOT': '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402'
} as const;

export type SupportedToken = keyof typeof BSC_TOKEN_ADDRESSES;

// Get token price from Birdeye
export async function getTokenPrice(symbol: SupportedToken): Promise<TokenPrice | null> {
  try {
    const tokenAddress = BSC_TOKEN_ADDRESSES[symbol];
    if (!tokenAddress) {
      throw new Error(`Unsupported token: ${symbol}`);
    }

    const response = await fetch(
      `${BIRDEYE_API_BASE}/defi/price?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': import.meta.env.VITE_BIRDEYE_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PriceResponse = await response.json();

    if (!data.success || !data.data) {
      throw new Error('Invalid response from Birdeye API');
    }

    return {
      address: tokenAddress,
      symbol,
      price: data.data.value,
      priceChange24h: data.data.priceChange24h || 0,
      volume24h: 0, // Would need separate API call
      marketCap: 0, // Would need separate API call
      liquidity: 0, // Would need separate API call
    };
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
}

// Get multiple token prices
export async function getMultipleTokenPrices(symbols: SupportedToken[]): Promise<Record<string, TokenPrice | null>> {
  const promises = symbols.map(async (symbol) => {
    const price = await getTokenPrice(symbol);
    return [symbol, price] as const;
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

// Format price for display
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `${price.toFixed(4)}`;
  } else if (price >= 0.000001) {
    return `${price.toFixed(6)}`;
  } else if (isNaN(price)) {
    return '--';
  } else {
    // Count leading zeros after decimal point
    const leadingZeros = Math.abs(Math.floor(Math.log10(price))) - 1;
    const significantDigits = price * Math.pow(10, leadingZeros + 1);
    // Convert number to subscript
    const subscript = leadingZeros.toString().split('').map(d => '₀₁₂₃₄₅₆₇₈₉'[parseInt(d)]).join('');
    return `0.0${subscript}${(Number(significantDigits.toFixed(4)) * 10000).toFixed(0)}`;
  }
}

// Format price change percentage
export function formatPriceChange(change: number): { text: string; color: string } {
  const formatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const color = change >= 0 ? 'text-green-400' : 'text-red-400';
  return { text: formatted, color };
}

// Format volume
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(2)}K`;
  } else {
    return `$${volume.toFixed(2)}`;
  }
} 