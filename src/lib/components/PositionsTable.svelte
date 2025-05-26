<script lang="ts">
  import { positions } from '$lib/stores/positions';
  import { closePosition } from '$lib/services/trading';
  import type { Position } from '$lib/stores/positions';

  let closing: Record<string, boolean> = {};

  async function handleClose(id: string) {
    closing[id] = true;
    try {
      await closePosition(id);
      positions.updatePosition(id, { status: 'closed' });
    } catch (e) {
      console.error('Failed to close position:', e);
    } finally {
      closing[id] = false;
    }
  }
</script>

<table class="min-w-full text-sm">
  <thead class="bg-white/5">
    <tr>
      <th class="px-3 py-2 text-left">Asset</th>
      <th class="px-3 py-2 text-right">Size</th>
      <th class="px-3 py-2 text-right">Entry</th>
      <th class="px-3 py-2 text-right">Price</th>
      <th class="px-3 py-2 text-right">Lev</th>
      <th class="px-3 py-2 text-right">PnL</th>
      <th class="px-3 py-2 text-right"></th>
    </tr>
  </thead>
  <tbody>
    {#each $positions.positions.filter(p => p.status === 'open') as p (p.id)}
      <tr class="border-b border-white/10">
        <td class="px-3 py-2 font-mono">{p.asset}</td>
        <td class="px-3 py-2 text-right font-mono">{p.size.toFixed(4)}</td>
        <td class="px-3 py-2 text-right font-mono">${p.entryPrice.toFixed(2)}</td>
        <td class="px-3 py-2 text-right font-mono">${p.currentPrice.toFixed(2)}</td>
        <td class="px-3 py-2 text-right font-mono">{p.leverage}x</td>
        <td class="px-3 py-2 text-right font-mono {p.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">
          {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
        </td>
        <td class="px-3 py-2 text-right">
          <button class="btn-secondary text-xs" disabled={closing[p.id]} on:click={() => handleClose(p.id)}>
            {closing[p.id] ? 'Closing...' : 'Close'}
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    @apply w-full text-sm;
  }
</style>
