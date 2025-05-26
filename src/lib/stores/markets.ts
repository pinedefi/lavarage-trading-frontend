import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getMarketData, type MarketData } from '$lib/services/offers';

// Create the store with initial state
export const markets = writable<MarketData[]>([]);
export const selectedMarket = writable<string>('BNB-BNB-PERP');
export const currentMarket = writable<MarketData | null>(null);
export const loading = writable<boolean>(true);

let updateInterval: NodeJS.Timeout;

// Function to load market data
export async function loadMarkets() {
  loading.set(true);
  try {
    let marketData = await getMarketData();
    markets.set(marketData);
    
    // Update current market
    if (marketData.length > 0) {
      selectedMarket.subscribe(symbol => {
        const market = marketData.find(m => m.symbol === symbol) || marketData[0];
        if (market) {
          currentMarket.set(market);
          if (!marketData.find(m => m.symbol === symbol)) {
            selectedMarket.set(market.symbol);
          }
        }
      });
    } else {
      currentMarket.set(null);
    }
  } catch (error) {
    console.error('Failed to load markets:', error);
    markets.set([]);
    currentMarket.set(null);
  } finally {
    loading.set(false);
  }
}

// Function to start periodic updates
export function startUpdates(interval = 5000) {
  if (browser) {
    loadMarkets();
    updateInterval = setInterval(loadMarkets, interval);
  }
}

// Function to stop updates
export function stopUpdates() {
  if (browser && updateInterval) {
    clearInterval(updateInterval);
  }
}

// Initialize the store if in browser
if (browser) {
  loadMarkets();
} 