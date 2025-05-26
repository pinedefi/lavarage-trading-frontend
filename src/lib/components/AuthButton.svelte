<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import WalletWidget from './WalletWidget.svelte';
  import { User, LogOut } from 'lucide-svelte';

  async function handleLogout() {
    auth.logout();
  }
</script>

<div class="auth-container">
  {#if $auth.user}
    <div class="user-info">
      <div class="user-avatar">
        <User size={20} />
      </div>
      <div class="user-details">
        <span class="user-name">{$auth.user.walletName || 'User'}</span>
        <span class="user-address">{$auth.user.walletAddress?.slice(0, 6)}...{$auth.user.walletAddress?.slice(-4)}</span>
      </div>
      <button class="logout-btn" on:click={handleLogout} title="Logout">
        <LogOut size={16} />
  </button>
    </div>
  {:else}
    <WalletWidget />
  {/if}
</div>

<style>
  .auth-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    color: white;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .user-name {
    font-weight: 500;
    color: white;
    font-size: 0.875rem;
  }

  .user-address {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .logout-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: color 0.2s ease;
  }

  .logout-btn:hover {
    color: white;
  }

  @media (max-width: 640px) {
    .user-details {
      display: none;
    }
    
    .user-info {
      padding: 0.5rem;
    }
  }
</style>