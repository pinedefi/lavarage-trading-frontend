<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import DynamicProvider from '$lib/components/DynamicProvider.svelte';
  import { onMount } from 'svelte';
  import { initializeDynamic } from '$lib/services/dynamic';
  
  onMount(() => {
    initializeDynamic();
  });
</script>

<DynamicProvider>
  <div class="min-h-screen bg-[#0a0a0a]">
    <Nav />
    
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
    
    <!-- Background gradient effects -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pulse-glow" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pulse-glow" 
           style="animation-delay: 1s" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pulse-glow" 
           style="animation-delay: 2s" />
    </div>
  </div>
</DynamicProvider>
