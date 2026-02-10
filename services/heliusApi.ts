import { NFTAsset, NFTQueryResult } from '../types/nft';

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export async function getAssetsByOwner(
  ownerAddress: string,
  page: number = 1,
  limit: number = 1000
): Promise<NFTQueryResult> {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'nft-query',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress,
        page,
        limit,
        displayOptions: {
          showCollectionMetadata: true,
        },
      },
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch NFTs');
  }

  return {
    items: data.result?.items || [],
    total: data.result?.total || 0,
    page,
  };
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
