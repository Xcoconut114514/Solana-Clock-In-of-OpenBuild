/**
 * Helius DAS API Service
 * ----------------------
 * Queries Solana mainnet NFTs via Helius Digital Asset Standard (DAS) API.
 * Used to check if a wallet holds specific Blueshift challenge NFTs.
 */

const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY || '';

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface HeliusAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      description?: string;
    };
    json_uri?: string;
    files?: Array<{
      uri?: string;
      cdn_uri?: string;
      mime?: string;
    }>;
    links?: {
      image?: string;
      external_url?: string;
    };
  };
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
  creators?: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership?: {
    owner: string;
    frozen: boolean;
    delegated: boolean;
  };
  compression?: {
    compressed: boolean;
  };
  interface?: string;
}

export interface HeliusGetAssetsResponse {
  jsonrpc: string;
  result: {
    total: number;
    limit: number;
    page: number;
    items: HeliusAsset[];
  };
}

/**
 * Fetch all NFT assets owned by a wallet address using Helius DAS API.
 * Paginates through all results automatically.
 */
export async function getAssetsByOwner(ownerAddress: string): Promise<HeliusAsset[]> {
  if (!HELIUS_API_KEY) {
    throw new Error('Helius API key not configured. Set VITE_HELIUS_API_KEY in .env');
  }

  const allAssets: HeliusAsset[] = [];
  let page = 1;
  const limit = 1000;

  while (true) {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `nft-check-${page}`,
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page,
          limit,
          displayOptions: {
            showCollectionMetadata: true,
            showUnverifiedCollections: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status} ${response.statusText}`);
    }

    const data: HeliusGetAssetsResponse = await response.json();

    if (!data.result?.items) {
      break;
    }

    allAssets.push(...data.result.items);

    // If we got fewer items than the limit, we've reached the last page
    if (data.result.items.length < limit) {
      break;
    }

    page++;
  }

  return allAssets;
}

/**
 * Check if an asset matches a given collection address.
 * Checks grouping (collection), creators, and authorities.
 */
export function assetMatchesCollection(asset: HeliusAsset, collectionAddress: string): boolean {
  // 1. Check grouping (most common for collection NFTs)
  if (asset.grouping) {
    for (const group of asset.grouping) {
      if (group.group_key === 'collection' && group.group_value === collectionAddress) {
        return true;
      }
    }
  }

  // 2. Check if the asset ID itself matches (individual mint address)
  if (asset.id === collectionAddress) {
    return true;
  }

  // 3. Check creators
  if (asset.creators) {
    for (const creator of asset.creators) {
      if (creator.address === collectionAddress && creator.verified) {
        return true;
      }
    }
  }

  // 4. Check authorities
  if (asset.authorities) {
    for (const authority of asset.authorities) {
      if (authority.address === collectionAddress) {
        return true;
      }
    }
  }

  return false;
}
