<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { blockchain } from '$lib/stores/blockchain';
  import { positions } from '$lib/stores/positions';
  import { Zap, TrendingUp } from 'lucide-svelte';
  import { getMarketData, type MarketData } from '$lib/services/offers';
  import { selectedMarket as selectedMarketStore } from '$lib/stores/markets';
  import { onMount } from 'svelte';
  
  let collateral = 0.1;
  let leverage = 1.2;
  let isOpening = false;
  let markets: MarketData[] = [];
  let loading = true;

  onMount(async () => {
    await loadMarkets();
  });

  async function loadMarkets() {
    try {
      markets = await getMarketData();
    } catch (error) {
      console.error('Failed to load markets:', error);
      markets = [];
    } finally {
      loading = false;
    }
  }

  $: currentMarket = markets.find(m => m.symbol === $selectedMarketStore) || markets[0];
  $: tokenSymbol = $selectedMarketStore?.split('-')[0] || 'BNB';
  $: currentPrice = currentMarket?.price || 0;
  $: positionSize = collateral * leverage;
  $: liquidationPrice = currentPrice * (1 - 1/leverage * 0.9); // Simplified calculation
  $: maxLeverage = currentMarket?.maxLeverage || 100;
  
  async function openPosition() {
    if (!$isAuthenticated) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (collateral <= 0) {
      alert('Please enter a valid collateral amount');
      return;
    }
    
    isOpening = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const position = {
        id: Date.now().toString(),
        type: 'long' as const,
        asset: $selectedMarketStore,
        collateral,
        leverage,
        size: positionSize,
        entryPrice: currentPrice,
        currentPrice: currentPrice,
        liquidationPrice,
        pnl: 0,
        pnlPercentage: 0,
        timestamp: Date.now(),
        blockchain: $blockchain.current,
        status: 'open' as const,
      };
      
      positions.addPosition(position);
      
      // Reset form
      collateral = 0.1;
      leverage = 10;
      
      alert('Position opened successfully!');
    } catch (error) {
      console.error('Failed to open position:', error);
      alert('Failed to open position. Please try again.');
    } finally {
      isOpening = false;
    }
  }
</script>

<div class="card">
  <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 leading-none">
    <TrendingUp class="w-5 h-5 text-purple-400 flex-shrink-0" strokeWidth={2} />
    <span>Open Long Position</span>
  </h2>
  
  <div class="space-y-6">
    <div>
      <label for="collateral-input" class="block text-sm font-medium text-gray-300 mb-2">
        Collateral ({tokenSymbol})
      </label>
      <input
        id="collateral-input"
        type="number"
        bind:value={collateral}
        min="0.001"
        step="0.001"
        class="input-field"
        placeholder="0.1"
      />
    </div>
    
    <div>
      <label for="leverage-input" class="block text-sm font-medium text-gray-300 mb-2">
        Leverage: {leverage}x (Max {maxLeverage}x)
      </label>
      <input
        id="leverage-input"
        type="range"
        bind:value={leverage}
        min="1"
        max={maxLeverage}
        step="0.1"
        class="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-purple-500
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-purple-500/20
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-200
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-purple-500
          [&::-moz-range-thumb]:shadow-lg
          [&::-moz-range-thumb]:shadow-purple-500/20
          [&::-moz-range-thumb]:border-none
          [&::-moz-range-thumb]:cursor-pointer
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:duration-200
          [&::-moz-range-thumb]:hover:scale-110
          [&::-moz-range-progress]:bg-purple-500/50
          [&::-moz-range-track]:bg-white/5
          [&::-moz-range-track]:rounded-full"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>1x</span>
        <span>{maxLeverage}x</span>
      </div>
    </div>
    
    <div class="space-y-3 p-4 bg-white/5 rounded-lg">
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Position Size</span>
        <span class="font-mono">{positionSize.toFixed(4)} {tokenSymbol}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Entry Price</span>
        <span class="font-mono">${currentPrice.toFixed(4)}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Liquidation Price</span>
        <span class="font-mono text-red-400">${liquidationPrice.toFixed(4)}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Est. Fees</span>
        <span class="font-mono">-{(collateral * 0.001).toFixed(4)} {tokenSymbol}</span>
      </div>
    </div>
    
    <button
      class="btn-primary w-full inline-flex items-center justify-center gap-2"
      on:click={openPosition}
      disabled={!$isAuthenticated || isOpening || collateral <= 0}
    >
      {#if isOpening}
        <Zap class="w-4 h-4 animate-pulse" />
        Opening Position...
      {:else}
        <TrendingUp class="w-4 h-4" />
        Open Long Position
      {/if}
    </button>
    
    {#if !$isAuthenticated}
      <p class="text-sm text-gray-400 text-center">
        Connect your wallet to start trading
      </p>
    {/if}
  </div>
</div>