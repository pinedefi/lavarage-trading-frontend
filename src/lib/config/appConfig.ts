import { parse } from '@iarna/toml';
import rawConfig from '../../../config/app-config.toml?raw';

export interface AppConfig {
  network: {
    name: string;
    rpc: string;
  };
  branding: {
    logo: string;
  };
  api: {
    base_url: string;
  };
  token: {
    gas_symbol: string;
  };
  colors: {
    primary: string;
    accent_red: string;
    accent_orange: string;
    accent_green: string;
    bg_dark: string;
    bg_card: string;
    border: string;
  };
}

// Parse the config
const parsedConfig = parse(rawConfig) as unknown as AppConfig;

// Validate the config
const requiredKeys = {
  'network.name': parsedConfig.network?.name,
  'network.rpc': parsedConfig.network?.rpc,
  'branding.logo': parsedConfig.branding?.logo,
  'api.base_url': parsedConfig.api?.base_url,
  'token.gas_symbol': parsedConfig.token?.gas_symbol,
  'colors.primary': parsedConfig.colors?.primary,
  'colors.accent_red': parsedConfig.colors?.accent_red,
  'colors.accent_orange': parsedConfig.colors?.accent_orange,
  'colors.accent_green': parsedConfig.colors?.accent_green,
  'colors.bg_dark': parsedConfig.colors?.bg_dark,
  'colors.bg_card': parsedConfig.colors?.bg_card,
  'colors.border': parsedConfig.colors?.border,
};

const missingKeys = Object.entries(requiredKeys)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(`Invalid configuration: missing required properties: ${missingKeys.join(', ')}`);
}

export const appConfig = parsedConfig;
