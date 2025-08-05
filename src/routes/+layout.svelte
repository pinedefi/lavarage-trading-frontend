<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { restoreWalletSession } from '$lib/services/wallet';
  import { isAuthenticated } from '$lib/stores/auth';
  import { startPositionsUpdates, stopPositionsUpdates } from '$lib/stores/positions';
  import { applyThemeColors } from '$lib/utils/theme';
  import Nav from '$lib/components/Nav.svelte';
  import BouncingBalls from '../components/BouncingBalls.svelte';

  onMount(async () => {
    try {
      // Apply theme colors
      applyThemeColors();
      
      // Restore wallet session
      await restoreWalletSession();
      if ($isAuthenticated) startPositionsUpdates('open');
    } catch (e) {
      console.warn('Failed to restore wallet session:', e);
    }
  });

  $: if ($isAuthenticated) {
    startPositionsUpdates('open');
  } else {
    stopPositionsUpdates();
  }

  onDestroy(() => {
    stopPositionsUpdates();
  });
</script>

<div class="min-h-screen relative">
  <BouncingBalls />
  <div class="relative z-10 text-white">
    <div class="glass">
      <Nav />
    </div>
    <main class="container mx-auto px-4 py-8">
      {#if $$slots.default}
        <div class="">
          <slot />
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  /* Add a subtle transition for the background opacity */
  .bg-\[var\(--bg-card\)\] {
    transition: background-color 0.2s ease;
  }
</style>
