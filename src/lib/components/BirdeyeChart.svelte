<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { blockchain } from '$lib/stores/blockchain';
  import { currentMarket } from '$lib/stores/markets';
  import type { TokenModel } from '$lib/services/offers';
  import { appConfig } from '$lib/config/appConfig';

  export let height: number = 400;
  export let symbol: string = '';
  
  let chartContainer: HTMLDivElement;
  let loading = true;
  let error: string | null = null;
  let prevBaseAddress: string | null = null;
  let prevQuoteAddress: string | null = null;

  // Get token addresses from current market
  $: baseToken = $currentMarket?.collateralToken?.symbol || 'Unknown';
  $: quoteToken = typeof $currentMarket?.quoteToken === 'string'
    ? appConfig.token.gas_symbol
    : $currentMarket?.quoteToken?.symbol || appConfig.token.gas_symbol;
  
  $: baseAddress = $currentMarket?.collateralToken?.address || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  $: quoteAddress = typeof $currentMarket?.quoteToken === 'string'
    ? '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // Default gas token address
    : $currentMarket?.quoteToken?.address || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

  // Only reload chart if token addresses have changed
  $: if (browser && chartContainer && $currentMarket && (baseAddress !== prevBaseAddress || quoteAddress !== prevQuoteAddress)) {
    prevBaseAddress = baseAddress;
    prevQuoteAddress = quoteAddress;
    loadBirdeyeChart();
  }

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
      console.log('birdeye', baseAddress, quoteAddress);
      console.log(`https://birdeye.so/tv-widget/${baseAddress}/${quoteAddress}?chain=bsc&viewMode=base%2Fquote&chartInterval=15&chartType=Candle&chartTimezone=Etc%2FUTC&chartLeftToolbar=show&theme=dark`)
      
      // Create iframe for Birdeye chart
      const iframe = document.createElement('iframe');
      
      // Set up load handler before setting src
      iframe.onload = () => {
        console.log('iframe loaded');
        loading = false;
      };

      iframe.onerror = () => {
        console.error('Chart widget failed to load');
        error = 'Failed to load chart widget';
        loading = false;
      };

      iframe.width = '100%';
      iframe.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.allow = 'clipboard-write';
      iframe.loading = 'lazy';
      iframe.title = 'DEXTools Trading Chart';
      
      // Clear container and add iframe
      chartContainer.innerHTML = '';
      chartContainer.appendChild(iframe);

      //<iframe id="dextools-widget"
    // title="DEXTools Trading Chart"
    // width="500" height="400"
    // src="https://www.dextools.io/widget-chart/en/berachain/pe-light/0xe454c546c8f3875e928910abc653de5f8c432f11?theme=light&chartType=2&chartResolution=30&drawingToolbars=false"></iframe>

      // Set src after all other properties and handlers are set
      iframe.src = `https://www.dextools.io/widget-chart/en/berachain/pe-light/${$currentMarket?.pairAddress}?theme=light&chartType=2&chartResolution=30&drawingToolbars=false`

    } catch (e) {
      console.error('Chart loading error:', e);
      error = 'Chart unavailable';
      loading = false;
    }
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
        <p class="text-gray-400 mt-4">Loading {baseToken}-{quoteToken} chart...</p>
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