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
}

export const appConfig: AppConfig = parse(rawConfig) as AppConfig;
