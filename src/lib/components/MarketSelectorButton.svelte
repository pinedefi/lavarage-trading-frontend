<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-svelte';
  import { formatPrice, formatPriceChange } from '$lib/services/birdeye';
  import { markets, selectedMarket, currentMarket } from '$lib/stores/markets';
  import type { MarketData } from '$lib/services/offers';
  import MarketSelector from './MarketSelector.svelte';

  export let currentPrice = 0;
  export let priceChange24h = 0;

  const dispatch = createEventDispatcher<{
    marketChange: MarketData;
  }>();
  
  let showMarketSelector = false;

  $: priceChangeFormatted = formatPriceChange($currentMarket?.change24h || 0);

  function openMarketSelector() {
    showMarketSelector = true;
  }

  function handleMarketSelect(event: CustomEvent<MarketData>) {
    const market = event.detail;
    selectedMarket.set(market.symbol);
    dispatch('marketChange', market);
  }
</script>

<div class="market-selector-container">
  <button class="market-selector-button" on:click={openMarketSelector}>
    <div class="market-info">
      <div class="market-symbol">{$selectedMarket}</div>
      <div class="market-name">{$currentMarket?.name || 'Unknown Market'}</div>
    </div>
    
    <div class="market-price-info">
      <div class="market-price">{formatPrice(Number($currentMarket?.priceVsQuote || 0))}</div>
      <div class="market-change" class:positive={($currentMarket?.change24h || 0) >= 0} class:negative={($currentMarket?.change24h || 0) < 0}>
        {#if ($currentMarket?.change24h || 0) >= 0}
          <TrendingUp size={12} />
        {:else}
          <TrendingDown size={12} />
        {/if}
        {priceChangeFormatted.text}
      </div>
    </div>
    
    <ChevronDown size={16} class="chevron" />
  </button>

  <MarketSelector 
    bind:isOpen={showMarketSelector}
    selectedMarket={$selectedMarket}
    on:select={handleMarketSelect}
  />
</div>

<style>
  .market-selector-container {
    position: relative;
  }

  .market-selector-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 280px;
  }

  .market-selector-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .market-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
    flex: 1;
  }

  .market-symbol {
    font-weight: 600;
    font-size: 0.875rem;
    color: white;
  }

  .market-name {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .market-price-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .market-price {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 0.875rem;
    color: white;
  }

  .market-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 0.75rem;
  }

  .market-change.positive {
    color: #10b981;
  }

  .market-change.negative {
    color: #ef4444;
  }

  :global(.chevron) {
    color: rgba(255, 255, 255, 0.6);
    transition: transform 0.2s ease;
  }

  .market-selector-button:hover :global(.chevron) {
    color: white;
  }

  @media (max-width: 640px) {
    .market-selector-button {
      min-width: 240px;
      padding: 0.625rem 0.875rem;
    }

    .market-symbol {
      font-size: 0.8125rem;
    }

    .market-name {
      font-size: 0.6875rem;
    }

    .market-price {
      font-size: 0.8125rem;
    }

    .market-change {
      font-size: 0.6875rem;
    }
  }
</style> 
