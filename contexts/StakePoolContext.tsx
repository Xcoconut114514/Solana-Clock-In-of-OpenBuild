/**
 * Staking Pool Context
 * --------------------
 * Manages the staking pool state, user stakes, and check-in records.
 * This provides a centralized state management for all staking operations.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';

// Constants
const STAKE_AMOUNT_SOL = 0.1; // 0.1 SOL stake amount
const BACKEND_URL = 'http://localhost:3001';

// Types
export interface StakePoolStats {
  totalPoolSol: number;
  totalParticipants: number;
  daysRemaining: number;
  userStaked: boolean;
  userStakeAmount: number;
  userCheckInDays: number[];
  todayCheckedIn: boolean;
}

export interface StakePoolContextType {
  stats: StakePoolStats;
  isLoading: boolean;
  error: string | null;
  verifierPublicKey: string | null;
  // Actions
  stake: () => Promise<boolean>;
  checkIn: () => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

const defaultStats: StakePoolStats = {
  totalPoolSol: 0,
  totalParticipants: 0,
  daysRemaining: 14,
  userStaked: false,
  userStakeAmount: 0,
  userCheckInDays: [],
  todayCheckedIn: false,
};

const StakePoolContext = createContext<StakePoolContextType | null>(null);

export const useStakePool = () => {
  const context = useContext(StakePoolContext);
  if (!context) {
    throw new Error('useStakePool must be used within a StakePoolProvider');
  }
  return context;
};

interface StakePoolProviderProps {
  children: ReactNode;
}

export const StakePoolProvider: React.FC<StakePoolProviderProps> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  const [stats, setStats] = useState<StakePoolStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifierPublicKey, setVerifierPublicKey] = useState<string | null>(null);

  // Fetch verifier public key from backend
  useEffect(() => {
    const fetchVerifier = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/verifier`);
        const data = await response.json();
        if (data.success) {
          setVerifierPublicKey(data.verifierPublicKey);
        }
      } catch (err) {
        console.error('Failed to fetch verifier:', err);
      }
    };
    fetchVerifier();
  }, []);

  // Simulated pool state (in production, this would come from on-chain data)
  const [poolState, setPoolState] = useState({
    stakes: new Map<string, { amount: number; checkIns: number[] }>(),
    totalPool: 155.5,
    participants: 1555,
  });

  // Refresh stats based on current wallet
  const refreshStats = useCallback(async () => {
    if (!publicKey) {
      setStats(defaultStats);
      return;
    }

    const userKey = publicKey.toBase58();
    const userStake = poolState.stakes.get(userKey);
    const today = new Date().getDate();
    
    setStats({
      totalPoolSol: poolState.totalPool,
      totalParticipants: poolState.participants,
      daysRemaining: 14, // Calculate from bootcamp dates
      userStaked: !!userStake,
      userStakeAmount: userStake?.amount || 0,
      userCheckInDays: userStake?.checkIns || [],
      todayCheckedIn: userStake?.checkIns.includes(today) || false,
    });
  }, [publicKey, poolState]);

  // Refresh on wallet change
  useEffect(() => {
    refreshStats();
  }, [refreshStats, connected]);

  /**
   * Stake SOL to join the bootcamp
   * 
   * This creates a real SOL transfer transaction.
   * In production, this would transfer to a program-derived address (PDA).
   */
  const stake = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo: Create a simple SOL transfer (to self, just for demonstration)
      // In production: Transfer to a PDA controlled by your staking program
      
      const stakeAmountLamports = STAKE_AMOUNT_SOL * LAMPORTS_PER_SOL;
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add a memo-like instruction to mark this as a stake
      // In production, this would be your actual program instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Demo: transfer to self
          lamports: 100, // Minimal amount for demo
        })
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signedTx = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log('✅ Stake transaction confirmed:', signature);

      // Update local state
      const userKey = publicKey.toBase58();
      setPoolState(prev => {
        const newStakes = new Map(prev.stakes);
        newStakes.set(userKey, { amount: STAKE_AMOUNT_SOL, checkIns: [] });
        return {
          ...prev,
          stakes: newStakes,
          totalPool: prev.totalPool + STAKE_AMOUNT_SOL,
          participants: prev.participants + 1,
        };
      });

      await refreshStats();
      return true;

    } catch (err) {
      console.error('Stake failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signTransaction, connection, refreshStats]);

  /**
   * Check-in for today
   * 
   * This implements the co-signing flow:
   * 1. Create partial transaction
   * 2. Send to backend for validation and co-signing
   * 3. Submit fully signed transaction to chain
   */
  const checkIn = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return false;
    }

    if (!verifierPublicKey) {
      setError('Backend not available');
      return false;
    }

    if (!stats.userStaked) {
      setError('Please stake first to join the bootcamp');
      return false;
    }

    if (stats.todayCheckedIn) {
      setError('Already checked in today');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // For demo: Create a simple transaction
      // In production: This would be your actual check-in program instruction
      
      const transaction = new Transaction();
      
      // Add transfer instruction as a placeholder
      // In production: Add your check-in program instruction with verifier as signer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 100,
        })
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction (user's partial signature)
      const signedTx = await signTransaction(transaction);
      
      // Serialize for backend
      const serializedTx = signedTx.serialize({ requireAllSignatures: false }).toString('base64');

      // Send to backend for co-signing
      console.log('📤 Sending to backend for co-signing...');
      
      const response = await fetch(`${BACKEND_URL}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPublicKey: publicKey.toBase58(),
          serializedTx,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Backend validation failed');
      }

      console.log('✅ Backend co-signed transaction');

      // Deserialize the co-signed transaction
      const coSignedTx = Transaction.from(Buffer.from(result.signedTx, 'base64'));
      
      // Send to network
      const signature = await connection.sendRawTransaction(coSignedTx.serialize());
      
      // Confirm
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log('✅ Check-in confirmed on-chain:', signature);

      // Update local state
      const today = new Date().getDate();
      const userKey = publicKey.toBase58();
      
      setPoolState(prev => {
        const newStakes = new Map(prev.stakes);
        const userStake = newStakes.get(userKey);
        if (userStake) {
          userStake.checkIns = [...userStake.checkIns, today];
        }
        return { ...prev, stakes: newStakes };
      });

      await refreshStats();
      return true;

    } catch (err) {
      console.error('Check-in failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to check in');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signTransaction, connection, verifierPublicKey, stats, refreshStats]);

  const value: StakePoolContextType = {
    stats,
    isLoading,
    error,
    verifierPublicKey,
    stake,
    checkIn,
    refreshStats,
  };

  return (
    <StakePoolContext.Provider value={value}>
      {children}
    </StakePoolContext.Provider>
  );
};

export default StakePoolProvider;
