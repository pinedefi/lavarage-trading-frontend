import { browser } from '$app/environment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ng-api.lavarave.wtf/api/sdk/v1.0';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export async function fetchPositionsEvm(userAddress?: string, status: string = 'open') {
  if (!browser) return [];

  const params = new URLSearchParams();
  if (userAddress) params.append('userAddress', userAddress);
  if (status) params.append('status', status);

  const res = await fetch(`${API_BASE_URL}/positions/evm?${params.toString()}`, {
    headers: {
      'x-api-key': API_KEY,
      referer: window.location.origin,
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch positions');
  }

  return res.json();
}
