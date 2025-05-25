<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let value = 1;
  export let min = 1;
  export let max = 100;
  export let step = 1;
  
  const dispatch = createEventDispatcher();
  
  $: percentage = ((value - min) / (max - min)) * 100;
  
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = Number(target.value);
    dispatch('change', value);
  }
  
  function getLeverageColor(leverage: number) {
    if (leverage <= 10) return 'text-green-400';
    if (leverage <= 25) return 'text-yellow-400';
    if (leverage <= 50) return 'text-orange-400';
    return 'text-red-400';
  }
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <label class="text-sm font-medium text-gray-400">Leverage</label>
    <div class="flex items-center gap-2">
      <span class="font-mono text-2xl font-semibold {getLeverageColor(value)}">
        {value}x
      </span>
    </div>
  </div>
  
  <div class="relative">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-green-500 via-orange-500 to-red-500 transition-all duration-150"
          style="width: {percentage}%"
        />
      </div>
    </div>
    
    <input
      type="range"
      {min}
      {max}
      {step}
      {value}
      on:input={handleChange}
      class="relative w-full h-2 bg-transparent appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:shadow-lg
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-webkit-slider-thumb]:transition-all
        [&::-webkit-slider-thumb]:duration-150
        [&::-webkit-slider-thumb]:hover:scale-125"
    />
  </div>
  
  <div class="flex justify-between text-xs text-gray-500">
    <span>Low Risk</span>
    <span>Moderate</span>
    <span>High Risk</span>
    <span>Extreme</span>
  </div>
</div>