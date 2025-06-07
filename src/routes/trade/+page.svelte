<script lang="ts">
  import TradingPanel from '$lib/components/TradingPanel.svelte';
  import BirdeyeChart from '$lib/components/BirdeyeChart.svelte';
  import MarketSelectorButton from '$lib/components/MarketSelectorButton.svelte';
  import PositionsTable from '$lib/components/PositionsTable.svelte';
  import { isAuthenticated } from '$lib/stores/auth';
  import { openPositions, loadPositions } from '$lib/stores/positions';
  import { blockchain } from '$lib/stores/blockchain';
  import { formatPrice, formatPriceChange, formatVolume } from '$lib/services/birdeye';
  import { markets, selectedMarket, currentMarket, loading, startUpdates, stopUpdates } from '$lib/stores/markets';
  import { appConfig } from '$lib/config/appConfig';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { Info, Shield, TrendingUp } from 'lucide-svelte';

  let currentPrice = 0;
  let priceChange24h = 0;
  let volume24h = 0;

  // Subscribe to currentMarket store to update local values
  $: if ($currentMarket) {
    currentPrice = Number($currentMarket.priceVsQuote);
    priceChange24h = $currentMarket.change24h;
    volume24h = $currentMarket.volume24h;
  }

  function handleMarketChange(event: CustomEvent) {
    const market = event.detail;
    selectedMarket.set(market.symbol);
  }

  onMount(() => {
    if (browser) {
      startUpdates();
    }
  });

  onDestroy(() => {
    if (browser) {
      stopUpdates();
    }
  });

  $: if ($isAuthenticated) {
    loadPositions();
  }

  $: priceChangeFormatted = formatPriceChange(priceChange24h);
  $: currentToken = $selectedMarket.split('-')[0];
  $: maxLeverageDisplay = $currentMarket ? `${$currentMarket.maxLeverage}x` : '--';
  $: interestPerDay = $currentMarket ? `${($currentMarket.apr / 365 * 100).toFixed(2)}%` : '--';
  $: openInterest = $currentMarket ? formatVolume(Number($currentMarket.currentExposure ?? $currentMarket.availableForOpen)) : '--';
  $: minPosition = $currentMarket?.maxOpenPerTrade ? `${Number($currentMarket.maxOpenPerTrade).toLocaleString()} ${currentToken}` : '--';
</script>

<div class="max-w-6xl mx-auto">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <div class="card">
        <div class="trade-header">
          <MarketSelectorButton on:marketChange={handleMarketChange} />
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-400 mb-1">Current Price</p>
            {#if $loading}
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
            {#if $loading}
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

      {#if $openPositions.length > 0}
        <div class="card">
          <PositionsTable />
        </div>
      {/if}
      
      <div class="card space-y-4">
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <Info class="w-5 h-5 text-primary" />
          Trading Information
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Max Leverage</span>
              <span class="font-mono">{maxLeverageDisplay}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Interest / Day</span>
              <span class="font-mono text-green-400">{interestPerDay}</span>
            </div>
            <!-- <div class="flex justify-between">
              <span class="text-gray-400">Open Interest</span>
              <span class="font-mono">{openInterest}</span>
            </div> -->
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">Maintenance Margin</span>
              <span class="font-mono">10%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Trading Fee</span>
              <span class="font-mono">1%</span>
            </div>
            <!-- <div class="flex justify-between">
              <span class="text-gray-400">Min Position</span>
              <span class="font-mono">{minPosition} {appConfig.token.gas_symbol}</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-6">
      <TradingPanel />

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
          <a href="/positions" class="text-sm text-primary hover:text-primary/80 mt-2 inline-block">
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