<script lang="ts">
  import { positions, openPositions } from '$lib/stores/positions';
  import { closePosition } from '$lib/services/trading';
  import { selectedMarket } from '$lib/stores/markets';
  import { formatNumber } from '$lib/utils/formatters';

  let closing: Record<string, boolean> = {};

  $: filtered = $openPositions.filter(p => p.asset === $selectedMarket);



  async function handleClose(id: number, positionId: string) {
    closing[id] = true;
    try {
      await closePosition(id);
      positions.updatePosition(positionId, { status: 'closed' });
    } catch (e) {
      console.error('Failed to close position:', e);
    } finally {
      closing[id] = false;
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="min-w-full text-sm whitespace-nowrap">
    <thead class="bg-white/5">
      <tr>
        <th class="px-3 py-2 text-right"></th>
        <th class="px-3 py-2 text-right">PnL</th>
        <th class="px-3 py-2 text-left">Asset</th>
        <th class="px-3 py-2 text-right">Size</th>
        <th class="px-3 py-2 text-right">Entry</th>
        <th class="px-3 py-2 text-right">Price</th>
        <th class="px-3 py-2 text-right">Lev</th>

      </tr>
    </thead>
    <tbody>
      {#each filtered as p (p.id)}
        <tr class="border-b border-white/10">
        <td class="px-3 py-2 text-right">
            <button class="btn-secondary text-xs" disabled={closing[p.loanId]} on:click={() => handleClose(p.loanId, p.id)}>
              {closing[p.loanId] ? 'Closing...' : 'Close'}
            </button>
          </td>
          <td class="px-3 py-2 text-right font-mono {p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">
            {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(5)} BNB
          </td>
          <td class="px-3 py-2 font-mono">{p.asset}</td>
          <td class="px-3 py-2 text-right font-mono">{p.size >= 0 ? p.size.toFixed(4) : '--'}</td>
          <td class="px-3 py-2 text-right font-mono">{formatPrice(p.entryPrice)} BNB</td>
          <td class="px-3 py-2 text-right font-mono">{formatPrice(p.currentPrice)} BNB</td>
          <td class="px-3 py-2 text-right font-mono">{p.leverage}x</td>
          
          
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    @apply w-full text-sm;
  }
  
  .overflow-x-auto {
    @apply -mx-4 px-4;
    @apply sm:mx-0 sm:px-0;
  }

  /* Custom scrollbar styles */
  .overflow-x-auto {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05); /* Firefox */
  }

  /* Webkit (Chrome, Safari, Edge) scrollbar styles */
  .overflow-x-auto::-webkit-scrollbar {
    height: 6px; /* for horizontal scrollbar */
    background-color: rgba(255, 255, 255, 0.05);
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
</style>
