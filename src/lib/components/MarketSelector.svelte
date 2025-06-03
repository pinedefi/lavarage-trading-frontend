<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, Star, TrendingUp, TrendingDown, Loader2 } from 'lucide-svelte';
  import { formatPrice, formatPriceChange, formatVolume } from '$lib/services/birdeye';
  import { markets, selectedMarket, loading } from '$lib/stores/markets';
  import type { MarketData } from '$lib/services/offers';

  const dispatch = createEventDispatcher<{
    select: MarketData;
  }>();

  export let isOpen = false;

  let searchQuery = '';
  let selectedCategory = 'all';
  let sortBy = 'volume';
  let sortDirection = 'desc';

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'margin', label: 'Margin' },
    { id: 'futures', label: 'Futures' },
    { id: 'options', label: 'Options' }
  ];

  $: filteredMarkets = $markets
    .filter(market => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return market.symbol.toLowerCase().includes(query) || 
               market.name.toLowerCase().includes(query);
      }
      return true;
    })
    .filter(market => {
      // Filter by category
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return market.isFavorite;
      return market.category === selectedCategory;
    })
    .sort((a, b) => {
      // Sort markets
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'symbol':
          return sortDirection === 'asc' 
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);
        case 'price':
          aValue = Number(a.priceVsQuote);
          bValue = Number(b.priceVsQuote);
          break;
        case 'change':
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case 'volume':
        default:
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  function selectMarket(market: MarketData) {
    dispatch('select', market);
    isOpen = false;
  }

  function toggleFavorite(market: MarketData) {
    market.isFavorite = !market.isFavorite;
    markets.set($markets); // Trigger reactivity
  }

  function setSortBy(field: string) {
    if (sortBy === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortDirection = 'desc';
    }
  }

  function closeModal() {
    isOpen = false;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="market-selector-title">
      <div class="modal-header">
        <h2 id="market-selector-title" class="modal-title">Select Market</h2>
        <button class="close-button" on:click={closeModal} aria-label="Close market selector">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- Search -->
        <div class="search-container">
          <Search class="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search markets..."
            bind:value={searchQuery}
            class="search-input"
          />
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
          {#each categories as category}
            <button
              class="category-tab"
              class:active={selectedCategory === category.id}
              on:click={() => selectedCategory = category.id}
            >
              {category.label}
            </button>
          {/each}
        </div>

        <!-- Market List Header -->
        <div class="market-list-header">
          <button class="header-cell symbol-cell" on:click={() => setSortBy('symbol')}>
            Market
            {#if sortBy === 'symbol'}
              <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </button>
          <button class="header-cell price-cell" on:click={() => setSortBy('price')}>
            Price
            {#if sortBy === 'price'}
              <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </button>
          <button class="header-cell change-cell" on:click={() => setSortBy('change')}>
            24h Change
            {#if sortBy === 'change'}
              <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </button>
          <button class="header-cell volume-cell" on:click={() => setSortBy('volume')}>
            24h Volume
            {#if sortBy === 'volume'}
              <span class="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            {/if}
          </button>
        </div>

        <!-- Market List -->
        <div class="market-list">
          {#if $loading}
            <div class="loading-container">
              <Loader2 class="loading-spinner" size={24} />
              <p>Loading markets...</p>
            </div>
          {:else if filteredMarkets.length === 0}
            <div class="empty-state">
              <p>No markets found</p>
            </div>
          {:else}
            {#each filteredMarkets as market}
              {@const priceChangeFormatted = formatPriceChange(market.change24h)}
              <div
                class="market-row"
                class:selected={market.symbol === $selectedMarket}
                on:click={() => selectMarket(market)}
                on:keydown={(e) => e.key === 'Enter' && selectMarket(market)}
                role="button"
                tabindex="0"
              >
                <div class="market-info">
                  <button
                    class="favorite-button"
                    class:favorited={market.isFavorite}
                    on:click|stopPropagation={() => toggleFavorite(market)}
                    aria-label={market.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={14} />
                  </button>
                  <div class="market-details">
                    <div class="market-symbol">{market.symbol}</div>
                    <div class="market-name">{market.name}</div>
                    <div class="market-leverage">Max {market.maxLeverage}x</div>
                  </div>
                </div>

                <div class="market-price">
                  <div class="price">{formatPrice(Number(market.priceVsQuote))}</div>
                </div>

                <div class="market-change">
                  <div class="change" class:positive={market.change24h >= 0} class:negative={market.change24h < 0}>
                    {#if market.change24h >= 0}
                      <TrendingUp size={12} />
                    {:else}
                      <TrendingDown size={12} />
                    {/if}
                    {priceChangeFormatted.text}
                  </div>
                </div>

                <div class="market-volume">
                  <div class="volume">{formatVolume(market.volume24h)}</div>
                  <div class="apr">APR: {market.apr.toFixed(1)}%</div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    width: 100%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .close-button:hover {
    color: white;
  }

  .modal-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-container {
    position: relative;
    margin: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #8b5cf6;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
    margin: 0 1.5rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .category-tab {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .category-tab:hover {
    color: white;
  }

  .category-tab.active {
    color: #8b5cf6;
    border-bottom-color: #8b5cf6;
  }

  .market-list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-cell {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    text-align: left;
    transition: color 0.2s ease;
  }

  .header-cell:hover {
    color: white;
  }

  .sort-indicator {
    font-size: 0.75rem;
    color: #8b5cf6;
  }

  .market-list {
    flex: 1;
    overflow-y: auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.6);
    gap: 1rem;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.6);
    gap: 1rem;
  }

  .retry-button {
    background: #8b5cf6;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;
  }

  .retry-button:hover {
    background: #7c3aed;
  }

  .market-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .market-row:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .market-row.selected {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .market-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .favorite-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s ease;
  }

  .favorite-button:hover {
    color: rgba(255, 255, 255, 0.6);
  }

  .favorite-button.favorited {
    color: #fbbf24;
  }

  .market-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
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

  .market-leverage {
    font-size: 0.6875rem;
    color: rgba(139, 92, 246, 0.8);
    font-weight: 500;
  }

  .market-price {
    display: flex;
    align-items: center;
  }

  .price {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 0.875rem;
    color: white;
  }

  .market-change {
    display: flex;
    align-items: center;
  }

  .change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 0.75rem;
  }

  .change.positive {
    color: #10b981;
  }

  .change.negative {
    color: #ef4444;
  }

  .market-volume {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.125rem;
  }

  .volume {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 0.75rem;
    color: white;
  }

  .apr {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 768px) {
    .modal {
      margin: 0.5rem;
      max-height: 90vh;
    }

    .market-list-header,
    .market-row {
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
    }

    .market-volume {
      display: none;
    }

    .header-cell.volume-cell {
      display: none;
    }
  }
</style> 