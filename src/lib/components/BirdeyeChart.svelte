<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { blockchain } from '$lib/stores/blockchain';

  export let symbol: string = 'BNB';
  export let height: number = 400;
  
  let chartContainer: HTMLDivElement;
  let loading = true;
  let error: string | null = null;

  // Birdeye token addresses for BSC
  const tokenAddresses: Record<string, string> = {
    'BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB on BSC
    'USDT': '0x55d398326f99059fF775485246999027B3197955',
    'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
  };

  $: tokenAddress = tokenAddresses[symbol] || tokenAddresses['BNB'];

  onMount(async () => {
    if (!browser) return;
    
    try {
      await loadBirdeyeChart();
    } catch (e) {
      console.error('Failed to load Birdeye chart:', e);
      error = 'Failed to load chart';
      loading = false;
    }
  });

  async function loadBirdeyeChart() {
    if (!chartContainer) return;

    loading = true;
    error = null;

    try {
      // Create iframe for Birdeye chart
      const iframe = document.createElement('iframe');
      iframe.src = `https://birdeye.so/tv-widget/bsc/${tokenAddress}?chain=bsc&viewMode=base&chartInterval=15m&chartType=CANDLE&chartTimezone=Etc%2FUTC&hotkey=false&locale=en&theme=dark`;
      iframe.width = '100%';
      iframe.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.allow = 'clipboard-write';
      iframe.loading = 'lazy';

      // Clear container and add iframe
      chartContainer.innerHTML = '';
      chartContainer.appendChild(iframe);

      // Handle iframe load
      iframe.onload = () => {
        loading = false;
      };

      iframe.onerror = () => {
        error = 'Failed to load chart widget';
        loading = false;
      };

    } catch (e) {
      console.error('Chart loading error:', e);
      error = 'Chart unavailable';
      loading = false;
    }
  }

  // Reload chart when symbol changes
  $: if (browser && chartContainer && symbol) {
    loadBirdeyeChart();
  }

  onDestroy(() => {
    if (chartContainer) {
      chartContainer.innerHTML = '';
    }
  });
</script>

<div class="birdeye-chart-wrapper">
  {#if loading}
    <div class="chart-loading" style="height: {height}px;">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="text-gray-400 mt-4">Loading {symbol} chart...</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="chart-error" style="height: {height}px;">
      <div class="error-content">
        <div class="error-icon">📊</div>
        <p class="text-red-400 mb-2">Chart Error</p>
        <p class="text-gray-400 text-sm">{error}</p>
        <button 
          class="retry-btn mt-4"
          on:click={loadBirdeyeChart}
        >
          Retry
        </button>
      </div>
    </div>
  {/if}

  <div 
    bind:this={chartContainer}
    class="chart-container"
    class:hidden={loading || error}
    style="height: {height}px;"
  ></div>
</div>

<style>
  .birdeye-chart-wrapper {
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    overflow: hidden;
  }

  .chart-loading,
  .chart-error {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .error-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .retry-btn {
    padding: 0.5rem 1rem;
    background: rgba(139, 92, 246, 0.2);
    color: #8b5cf6;
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .retry-btn:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .chart-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
  }

  .hidden {
    display: none;
  }
</style> 