/**
 * Transaction Verification Utility
 * ---------------------------------
 * Provides security checks to ensure the backend is not tricked into
 * signing malicious transactions.
 * 
 * Security Model:
 * The Co-signing pattern requires the backend to validate that:
 * 1. The transaction calls the expected Check-In program
 * 2. The transaction structure matches what we expect
 * 3. The user isn't trying to drain funds or call unauthorized programs
 */

import {
  Transaction,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

/**
 * Configuration for transaction verification
 */
interface VerificationConfig {
  /** The Program ID that the check-in instruction should call */
  expectedProgramId: PublicKey;
  /** The user's public key (should be a signer) */
  userPublicKey: PublicKey;
  /** The verifier's public key (we will add our signature) */
  verifierPublicKey: PublicKey;
}

/**
 * Result of transaction verification
 */
interface VerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Verifies that a transaction is safe to co-sign.
 * 
 * This is a CRITICAL security function. Without proper verification,
 * a malicious user could craft a transaction that:
 * - Transfers SOL from the Verifier wallet
 * - Calls unauthorized programs
 * - Performs actions not related to check-in
 * 
 * @param transaction - The deserialized transaction to verify
 * @param config - Verification configuration
 * @returns VerificationResult indicating if the transaction is safe
 */
export function verifyTransaction(
  transaction: Transaction,
  config: VerificationConfig
): VerificationResult {
  const { expectedProgramId, userPublicKey, verifierPublicKey } = config;

  // ============================================================
  // Check 1: Transaction has at least one instruction
  // ============================================================
  if (!transaction.instructions || transaction.instructions.length === 0) {
    return {
      isValid: false,
      error: 'Transaction has no instructions',
    };
  }

  // ============================================================
  // Check 2: Find and validate the Check-In instruction
  // ============================================================
  const checkInInstruction = transaction.instructions.find(
    (ix: TransactionInstruction) => ix.programId.equals(expectedProgramId)
  );

  if (!checkInInstruction) {
    return {
      isValid: false,
      error: `Transaction does not contain an instruction for the expected program: ${expectedProgramId.toBase58()}`,
    };
  }

  // ============================================================
  // Check 3: Verify the user is a signer
  // ============================================================
  const userAccountMeta = checkInInstruction.keys.find(
    (key) => key.pubkey.equals(userPublicKey)
  );

  if (!userAccountMeta) {
    return {
      isValid: false,
      error: 'User public key is not in the instruction accounts',
    };
  }

  if (!userAccountMeta.isSigner) {
    return {
      isValid: false,
      error: 'User must be a signer on the transaction',
    };
  }

  // ============================================================
  // Check 4: Verify the verifier is included as a signer
  // ============================================================
  const verifierAccountMeta = checkInInstruction.keys.find(
    (key) => key.pubkey.equals(verifierPublicKey)
  );

  if (!verifierAccountMeta) {
    return {
      isValid: false,
      error: 'Verifier public key is not in the instruction accounts',
    };
  }

  if (!verifierAccountMeta.isSigner) {
    return {
      isValid: false,
      error: 'Verifier must be marked as a signer in the instruction',
    };
  }

  // ============================================================
  // Check 5: Ensure verifier is not writable (preventing fund transfer)
  // ============================================================
  // This is an important security check - the verifier account should
  // only be used for signing, not for receiving or sending SOL
  if (verifierAccountMeta.isWritable) {
    return {
      isValid: false,
      error: 'Security violation: Verifier account should not be writable',
    };
  }

  // ============================================================
  // Check 6: Limit the number of instructions (prevent bundled attacks)
  // ============================================================
  // A legitimate check-in should have minimal instructions
  // (usually just the check-in instruction, possibly with compute budget)
  const MAX_ALLOWED_INSTRUCTIONS = 3;
  if (transaction.instructions.length > MAX_ALLOWED_INSTRUCTIONS) {
    return {
      isValid: false,
      error: `Too many instructions in transaction: ${transaction.instructions.length}. Maximum allowed: ${MAX_ALLOWED_INSTRUCTIONS}`,
    };
  }

  // ============================================================
  // Check 7: Ensure no suspicious programs are called
  // ============================================================
  const ALLOWED_PROGRAMS = [
    expectedProgramId.toBase58(),
    // System Program (for compute budget)
    '11111111111111111111111111111111',
    // Compute Budget Program
    'ComputeBudget111111111111111111111111111111',
  ];

  for (const instruction of transaction.instructions) {
    if (!ALLOWED_PROGRAMS.includes(instruction.programId.toBase58())) {
      return {
        isValid: false,
        error: `Unauthorized program detected: ${instruction.programId.toBase58()}`,
      };
    }
  }

  // All checks passed
  return { isValid: true };
}

/**
 * Deserializes a Base64-encoded transaction.
 * 
 * @param serializedTx - Base64 encoded transaction string
 * @returns The deserialized Transaction object
 * @throws Error if deserialization fails
 */
export function deserializeTransaction(serializedTx: string): Transaction {
  try {
    const buffer = Buffer.from(serializedTx, 'base64');
    return Transaction.from(buffer);
  } catch (error) {
    throw new Error(
      `Failed to deserialize transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Serializes a transaction to Base64 format.
 * 
 * @param transaction - The transaction to serialize
 * @returns Base64 encoded string
 */
export function serializeTransaction(transaction: Transaction): string {
  return transaction.serialize({ requireAllSignatures: false }).toString('base64');
}
