<script lang="ts">
  import TradingPanel from '$lib/components/TradingPanel.svelte';
  import BirdeyeChart from '$lib/components/BirdeyeChart.svelte';
  import MarketSelectorButton from '$lib/components/MarketSelectorButton.svelte';
  import { isAuthenticated } from '$lib/stores/auth';
  import { openPositions } from '$lib/stores/positions';
  import { blockchain } from '$lib/stores/blockchain';
  import { formatPrice, formatPriceChange, formatVolume } from '$lib/services/birdeye';
  import { getMarketData, getMockMarketData, type MarketData } from '$lib/services/offers';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { Info, Shield, TrendingUp } from 'lucide-svelte';

  let currentPrice = 0;
  let priceChange24h = 0;
  let volume24h = 0;
  let loading = true;
  let priceUpdateInterval: NodeJS.Timeout;
  let selectedMarket = 'BNB-BNB-PERP';
  let markets: MarketData[] = [];

  // Mock price data for different tokens
  const mockPriceData: Record<string, { basePrice: number; volume: number }> = {
    'BNB': { basePrice: 542.18, volume: 24800000000 },
    'WBNB': { basePrice: 542.18, volume: 24800000000 },
    'BTC': { basePrice: 43250.75, volume: 120000000000 },
    'ETH': { basePrice: 2650.40, volume: 89000000000 },
    'SOL': { basePrice: 98.45, volume: 15600000000 },
    'ADA': { basePrice: 0.4521, volume: 890000000 },
    'DOT': { basePrice: 6.78, volume: 234000000 },
    'MATIC': { basePrice: 0.8234, volume: 670000000 },
    'AVAX': { basePrice: 35.67, volume: 890000000 },
    'USDT': { basePrice: 1.0001, volume: 45000000000 },
    'USDC': { basePrice: 0.9999, volume: 38000000000 },
    'BUSD': { basePrice: 1.0002, volume: 12000000000 },
    'CAKE': { basePrice: 2.45, volume: 890000000 }
  };

  // Map market symbols to token symbols for price data
  function getTokenFromMarket(market: string): string {
    // Extract the first part before the first hyphen (collateral token)
    return market.split('-')[0];
  }

  function generateMockPrice(symbol: string): { price: number; change24h: number; volume: number } {
    const mockData = mockPriceData[symbol] || mockPriceData['BNB'];
    
    // Generate realistic price fluctuation (±5%)
    const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
    const price = mockData.basePrice * (1 + fluctuation);
    
    // Generate realistic 24h change (±15%)
    const change24h = (Math.random() - 0.5) * 30; // ±15%
    
    // Add some volume variation (±20%)
    const volumeVariation = (Math.random() - 0.5) * 0.4; // ±20%
    const volume = mockData.volume * (1 + volumeVariation);
    
    return { price, change24h, volume };
  }

  function updatePriceData() {
    try {
      const token = getTokenFromMarket(selectedMarket);
      const mockData = generateMockPrice(token);
      currentPrice = mockData.price;
      priceChange24h = mockData.change24h;
      volume24h = mockData.volume;
    } catch (error) {
      console.error('Failed to update price data:', error);
    } finally {
      loading = false;
    }
  }

  function handleMarketChange(event: CustomEvent) {
    const market = event.detail;
    selectedMarket = market.symbol;
    updatePriceData();
  }

  async function loadMarkets() {
    try {
      markets = await getMarketData();
      if (markets.length === 0) {
        markets = getMockMarketData();
      }
      // Set the first available market as default if current selection is not found
      if (markets.length > 0 && !markets.find(m => m.symbol === selectedMarket)) {
        selectedMarket = markets[0].symbol;
      }
    } catch (error) {
      console.error('Failed to load markets:', error);
      markets = getMockMarketData();
      if (markets.length > 0) {
        selectedMarket = markets[0].symbol;
      }
    }
  }

  onMount(async () => {
    if (browser) {
      await loadMarkets();
      updatePriceData();
      // Update price every 5 seconds for demo
      priceUpdateInterval = setInterval(updatePriceData, 5000);
    }
  });

  onDestroy(() => {
    if (browser && priceUpdateInterval) {
      clearInterval(priceUpdateInterval);
    }
  });

  $: priceChangeFormatted = formatPriceChange(priceChange24h);
  $: currentToken = getTokenFromMarket(selectedMarket);
</script>

<div class="max-w-6xl mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <div class="card">
        <div class="trade-header">
          <MarketSelectorButton 
            bind:selectedMarket
            bind:currentPrice
            bind:priceChange24h
            on:marketChange={handleMarketChange}
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-400 mb-1">Current Price</p>
            {#if loading}
              <div class="animate-pulse">
                <div class="h-6 bg-gray-600 rounded w-24 mb-1"></div>
                <div class="h-4 bg-gray-600 rounded w-16"></div>
              </div>
            {:else}
              <p class="text-xl font-mono font-semibold">{formatPrice(currentPrice)}</p>
              <p class="text-sm {priceChangeFormatted.color}">{priceChangeFormatted.text}</p>
            {/if}
          </div>
          
          <div class="p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-400 mb-1">24h Volume</p>
            {#if loading}
              <div class="animate-pulse">
                <div class="h-6 bg-gray-600 rounded w-20 mb-1"></div>
                <div class="h-4 bg-gray-600 rounded w-24"></div>
              </div>
            {:else}
              <p class="text-xl font-mono font-semibold">{formatVolume(volume24h)}</p>
              <p class="text-sm text-gray-400">24h trading volume</p>
            {/if}
          </div>
        </div>
        
        <BirdeyeChart symbol={currentToken} height={400} />
      </div>
      
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <Info class="w-5 h-5 text-purple-400" />
          Trading Information
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Max Leverage</span>
              <span class="font-mono">100x</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Funding Rate</span>
              <span class="font-mono text-green-400">+0.01%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Open Interest</span>
              <span class="font-mono">$1.2B</span>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Maintenance Margin</span>
              <span class="font-mono">0.5%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Trading Fee</span>
              <span class="font-mono">0.05%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Min Position</span>
              <span class="font-mono">0.001 {currentToken}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      <TradingPanel {selectedMarket} />
      
      <div class="card space-y-3">
        <h3 class="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Shield class="w-4 h-4" />
          Risk Management
        </h3>
        
        <div class="space-y-2 text-sm">
          <p class="text-gray-400">
            • Use stop-loss orders to limit losses
          </p>
          <p class="text-gray-400">
            • Never trade more than you can afford to lose
          </p>
          <p class="text-gray-400">
            • Higher leverage = higher risk
          </p>
          <p class="text-gray-400">
            • Monitor liquidation prices closely
          </p>
        </div>
      </div>
      
      {#if $isAuthenticated && $openPositions.length > 0}
        <div class="card">
          <h3 class="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <TrendingUp class="w-4 h-4" />
            Active Positions
          </h3>
          <p class="text-2xl font-mono font-semibold">{$openPositions.length}</p>
          <a href="/positions" class="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
            View all positions →
          </a>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .trade-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    .trade-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>