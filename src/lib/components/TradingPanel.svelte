<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { blockchain } from '$lib/stores/blockchain';
  import { positions } from '$lib/stores/positions';
  import { Zap, TrendingUp } from 'lucide-svelte';
  
  export let selectedMarket = 'BNB-BNB-PERP';

  let collateral = 0.1;
  let leverage = 10;
  let isOpening = false;

  // Mock price data for different tokens
  const mockPrices: Record<string, number> = {
    'BNB-BNB-PERP': 542.18,
    'WBNB-BNB-PERP': 542.18,
    'USDT-BNB-PERP': 1.0001,
    'USDC-BNB-PERP': 0.9999,
    'BUSD-BNB-PERP': 1.0002,
    'CAKE-BNB-PERP': 2.45,
    'BTC-BNB-PERP': 43250.75,
    'ETH-BNB-PERP': 2650.40,
    'SOL-BNB-PERP': 98.45,
    'ADA-BNB-PERP': 0.4521,
    'DOT-BNB-PERP': 6.78,
    'MATIC-BNB-PERP': 0.8234,
    'AVAX-BNB-PERP': 35.67
  };

  // Extract token symbol from market (e.g., 'BNB-BNB-PERP' -> 'BNB')
  $: tokenSymbol = selectedMarket.split('-')[0];
  $: currentPrice = mockPrices[selectedMarket] || mockPrices['BNB-BNB-PERP'];
  $: positionSize = collateral * leverage;
  $: liquidationPrice = currentPrice * (1 - 1/leverage * 0.9); // Simplified calculation
  
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
        asset: selectedMarket,
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
  <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
    <TrendingUp class="w-5 h-5 text-purple-400" />
    Open Long Position
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
        class="input"
        placeholder="0.1"
      />
    </div>
    
    <div>
      <label for="leverage-input" class="block text-sm font-medium text-gray-300 mb-2">
        Leverage: {leverage}x
      </label>
      <input
        id="leverage-input"
        type="range"
        bind:value={leverage}
        min="1"
        max="100"
        class="slider"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>1x</span>
        <span>100x</span>
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
      class="btn-primary w-full"
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