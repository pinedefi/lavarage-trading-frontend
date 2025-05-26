<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { restoreWalletSession } from '$lib/services/wallet';
  import Nav from '$lib/components/Nav.svelte';

  onMount(async () => {
    try {
      await restoreWalletSession();
    } catch (e) {
      console.warn('Failed to restore wallet session:', e);
    }
  });
</script>

<div class="min-h-screen bg-black text-white">
    <Nav />
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
