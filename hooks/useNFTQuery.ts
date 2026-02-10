/**
 * useNFTQuery Hook
 * ----------------
 * Custom React hook that queries a wallet's NFTs and checks
 * completion status against Blueshift challenge tasks.
 */

import { useState, useCallback } from 'react';
import { getAssetsByOwner, assetMatchesCollection, HeliusAsset } from '../services/heliusApi';
import { BLUESHIFT_TASKS, REQUIRED_TASK_COUNT, TaskDefinition } from '../config/blueshiftCollections';

export interface TaskResult {
  task: TaskDefinition;
  completed: boolean;
  matchedAsset?: HeliusAsset;
  imageUrl?: string;
}

export interface NFTQueryResult {
  tasks: TaskResult[];
  completedCount: number;
  requiredCompletedCount: number;
  isQualified: boolean;
  totalAssets: number;
}

export function useNFTQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NFTQueryResult | null>(null);

  const queryNFTs = useCallback(async (walletAddress: string) => {
    if (!walletAddress || walletAddress.trim().length === 0) {
      setError('请输入 Solana 钱包地址');
      return;
    }

    // Basic Solana address validation (base58, 32-44 chars)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58Regex.test(walletAddress.trim())) {
      setError('无效的 Solana 钱包地址格式');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const assets = await getAssetsByOwner(walletAddress.trim());

      const taskResults: TaskResult[] = BLUESHIFT_TASKS.map((task) => {
        let matchedAsset: HeliusAsset | undefined;

        for (const asset of assets) {
          if (assetMatchesCollection(asset, task.collectionAddress)) {
            matchedAsset = asset;
            break;
          }
        }

        // Extract image URL from matched asset
        let imageUrl: string | undefined;
        if (matchedAsset) {
          imageUrl =
            matchedAsset.content?.links?.image ||
            matchedAsset.content?.files?.[0]?.cdn_uri ||
            matchedAsset.content?.files?.[0]?.uri ||
            undefined;
        }

        return {
          task,
          completed: !!matchedAsset,
          matchedAsset,
          imageUrl,
        };
      });

      const completedCount = taskResults.filter((r) => r.completed).length;
      const requiredCompletedCount = taskResults.filter(
        (r) => r.task.required && r.completed
      ).length;
      const isQualified = requiredCompletedCount >= REQUIRED_TASK_COUNT;

      setResult({
        tasks: taskResults,
        completedCount,
        requiredCompletedCount,
        isQualified,
        totalAssets: assets.length,
      });
    } catch (err: any) {
      setError(err.message || '查询 NFT 时发生错误');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, result, queryNFTs, reset };
}
