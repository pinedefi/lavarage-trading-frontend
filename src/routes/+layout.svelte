<script lang="ts">
  import '../app.css';
  import { onMount, onDestroy } from 'svelte';
  import { restoreWalletSession } from '$lib/services/wallet';
  import { isAuthenticated } from '$lib/stores/auth';
  import { startPositionsUpdates, stopPositionsUpdates } from '$lib/stores/positions';
  import Nav from '$lib/components/Nav.svelte';

  onMount(async () => {
    try {
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

<div class="min-h-screen bg-black text-white">
    <Nav />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
