/**
 * Wallet Configuration
 * --------------------
 * Configures all supported Solana wallets for the DApp.
 * Supports: Phantom, OKX, Bitget, Coinbase, Solflare, and more.
 */

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Network configuration
export type NetworkType = 'mainnet-beta' | 'devnet' | 'testnet';

interface WalletContextProviderProps {
  children: ReactNode;
  network?: NetworkType;
  customEndpoint?: string;
}

/**
 * WalletContextProvider
 * 
 * Wraps the application with all necessary Solana wallet providers.
 * This enables wallet connection, transaction signing, and more.
 * 
 * Note: With the new Wallet Standard, most wallets (Phantom, OKX, Bitget, etc.)
 * will be automatically detected without needing explicit adapter configuration.
 */
export const WalletContextProvider: FC<WalletContextProviderProps> = ({ 
  children, 
  network = 'devnet',
  customEndpoint 
}) => {
  // Configure RPC endpoint
  const endpoint = useMemo(() => {
    if (customEndpoint) return customEndpoint;
    return clusterApiUrl(network);
  }, [network, customEndpoint]);

  // With Wallet Standard, wallets are auto-detected
  // Pass an empty array to rely on standard wallet detection
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
