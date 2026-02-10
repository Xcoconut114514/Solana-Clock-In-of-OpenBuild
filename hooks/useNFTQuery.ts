import { useState, useCallback } from 'react';
import { NFTAsset } from '../types/nft';
import { getAssetsByOwner, isValidSolanaAddress } from '../services/heliusApi';
import { BLUESHIFT_TASKS, REQUIRED_TASK_IDS, getCollectionAddressSet } from '../config/blueshiftCollections';

export interface TaskCompletionStatus {
  taskId: number;
  completed: boolean;
  nft: NFTAsset | null;
}

export interface UseNFTQueryResult {
  isLoading: boolean;
  error: string | null;
  queried: boolean;
  taskStatuses: TaskCompletionStatus[];
  completedCount: number;
  requiredCompleted: boolean;
  queryAddress: (address: string) => Promise<void>;
  reset: () => void;
}

export function useNFTQuery(): UseNFTQueryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queried, setQueried] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<TaskCompletionStatus[]>([]);

  const reset = useCallback(() => {
    setTaskStatuses([]);
    setError(null);
    setQueried(false);
  }, []);

  const queryAddress = useCallback(async (address: string) => {
    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana address format');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQueried(false);

    try {
      const collectionAddresses = getCollectionAddressSet();
      let allAssets: NFTAsset[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await getAssetsByOwner(address, page, 1000);
        allAssets = [...allAssets, ...result.items];
        hasMore = result.items.length === 1000;
        page++;
        if (page > 5) break;
      }

      // Match NFTs to tasks by collection address
      const nftByCollection = new Map<string, NFTAsset>();
      for (const nft of allAssets) {
        const collection = nft.grouping?.find(g => g.group_key === 'collection');
        if (collection && collectionAddresses.has(collection.group_value)) {
          nftByCollection.set(collection.group_value, nft);
        }
      }

      // Build task completion statuses
      const statuses: TaskCompletionStatus[] = BLUESHIFT_TASKS.map(task => ({
        taskId: task.id,
        completed: nftByCollection.has(task.collectionAddress),
        nft: nftByCollection.get(task.collectionAddress) || null,
      }));

      setTaskStatuses(statuses);
      setQueried(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed, please try again');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completedCount = taskStatuses.filter(s => s.completed).length;
  const requiredCompleted = REQUIRED_TASK_IDS.every(
    id => taskStatuses.find(s => s.taskId === id)?.completed
  );

  return {
    isLoading,
    error,
    queried,
    taskStatuses,
    completedCount,
    requiredCompleted,
    queryAddress,
    reset,
  };
}
