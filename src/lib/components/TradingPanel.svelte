<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { blockchain } from '$lib/stores/blockchain';
  import { positions } from '$lib/stores/positions';
  import { Zap, TrendingUp } from 'lucide-svelte';
  import { getMarketData, type MarketData } from '$lib/services/offers';
  import { selectedMarket as selectedMarketStore } from '$lib/stores/markets';
  import { openLongPosition } from '$lib/services/trading';
  import { onMount } from 'svelte';
  import { formatPrice } from '$lib/services/birdeye';
  import { switchNetwork } from '$lib/services/wallet';
  import { getAccount } from '@wagmi/core';
  import { config } from '$lib/config/wagmi';
  import { bsc } from '@wagmi/core/chains';
  
  let collateral = 0.1;
  let leverage = 1.2;
  let isOpening = false;
  let markets: MarketData[] = [];
  let loading = true;
  let switchingNetwork = false;

  // Handler to format collateral input to 5 decimal places
  function handleCollateralInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Allow empty input and decimal point for better UX
    if (!value || value.endsWith('.') || value.endsWith('.0') || value.endsWith('.00') || 
        value.endsWith('.000') || value.endsWith('.0000') || value.endsWith('.00000')) {
      collateral = parseFloat(value) || 0;
      return;
    }

    // Only format if we have a complete number
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      // Split the number into integer and decimal parts
      const parts = value.split('.');
      if (parts.length === 2 && parts[1].length > 5) {
        // Only truncate if we have more than 5 decimal places
        collateral = Math.round(parsed * 100000) / 100000;
        input.value = collateral.toString();
      } else {
        collateral = parsed;
      }
    }
  }

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

  async function ensureCorrectNetwork(): Promise<boolean> {
    const account = getAccount(config);
    if (account.chainId !== bsc.id) {
      try {
        switchingNetwork = true;
        await switchNetwork(bsc.id);
        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        alert('Please switch to BSC network in your wallet');
        return false;
      } finally {
        switchingNetwork = false;
      }
    }
    return true;
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

    if (!currentMarket) {
      alert('Market data not available');
      return;
    }

    // Ensure we're on the correct network
    if (!(await ensureCorrectNetwork())) {
      return;
    }
    
    isOpening = true;
    
    try {
      const txHash = await openLongPosition({
        blockchain: $blockchain.current,
        asset: $selectedMarketStore,
        collateral,
        leverage,
        collateralAddress: currentMarket?.collateralToken?.address || '',
        quoteToken:
          typeof currentMarket?.quoteToken === 'string'
            ? currentMarket?.quoteToken
            : currentMarket?.quoteToken?.address || '',
      });

      const position = {
        id: txHash,
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

      collateral = 0.1;
      leverage = 10;

      alert(`Transaction submitted: ${txHash}`);
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
        Collateral (BNB)
      </label>
      <input
        id="collateral-input"
        type="number"
        bind:value={collateral}
        on:input={handleCollateralInput}
        min="0.001"
        step="0.00001"
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
        <span class="font-mono">${formatPrice(currentPrice)}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Liquidation Price</span>
        <span class="font-mono text-red-400">${formatPrice(liquidationPrice)}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-400">Est. Fees</span>
        <span class="font-mono">-{(collateral * 0.0085).toFixed(4)} {tokenSymbol}</span>
      </div>
    </div>
    
    <button
      class="btn-primary w-full inline-flex items-center justify-center gap-2"
      on:click={openPosition}
      disabled={!$isAuthenticated || isOpening || collateral <= 0 || switchingNetwork}
    >
      {#if isOpening}
        <Zap class="w-4 h-4 animate-pulse" />
        Opening Position...
      {:else if switchingNetwork}
        <Zap class="w-4 h-4 animate-pulse" />
        Switching Network...
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