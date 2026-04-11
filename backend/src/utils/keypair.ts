/**
 * Keypair Utility Module
 * ----------------------
 * Provides helper functions for loading and generating Solana keypairs.
 * 
 * Security Note:
 * - The VERIFIER_PRIVATE_KEY is a critical secret that should never be exposed.
 * - This key is used to co-sign transactions, proving that the backend has
 *   validated the user's off-chain progress before allowing a check-in.
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Loads the Verifier Keypair from environment variables.
 * 
 * The Verifier is a special wallet controlled by the backend Oracle.
 * Its signature on a transaction proves that:
 * 1. The user's request passed through our validation
 * 2. The user completed the required off-chain tasks
 * 
 * @returns Keypair - The loaded Solana Keypair
 * @throws Error if the private key is not configured or invalid
 */
export function loadVerifierKeypair(): Keypair {
  const privateKeyBase58 = process.env.VERIFIER_PRIVATE_KEY;

  if (!privateKeyBase58) {
    throw new Error(
      'VERIFIER_PRIVATE_KEY is not configured in environment variables. ' +
      'Run "npm run generate-keypair" to create a new keypair.'
    );
  }

  try {
    // Decode the Base58 encoded private key
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    
    // Validate key length (Solana keypairs are 64 bytes)
    if (privateKeyBytes.length !== 64) {
      throw new Error(
        `Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}. ` +
        'Make sure you copied the entire private key.'
      );
    }

    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid private key length')) {
      throw error;
    }
    throw new Error(
      'Failed to decode VERIFIER_PRIVATE_KEY. Ensure it is a valid Base58-encoded private key.'
    );
  }
}

/**
 * Generates a new random Solana Keypair.
 * 
 * This is used to create a new Verifier wallet.
 * The private key should be stored in .env file.
 * 
 * @returns An object containing the keypair and its Base58-encoded private key
 */
export function generateNewKeypair(): {
  keypair: Keypair;
  publicKey: string;
  privateKeyBase58: string;
} {
  const keypair = Keypair.generate();
  
  return {
    keypair,
    publicKey: keypair.publicKey.toBase58(),
    privateKeyBase58: bs58.encode(keypair.secretKey),
  };
}

/**
 * Validates if a string is a valid Solana public key.
 * 
 * @param publicKeyString - The public key string to validate
 * @returns boolean - True if valid, false otherwise
 */
export function isValidPublicKey(publicKeyString: string): boolean {
  try {
    // Attempt to decode as Base58
    const decoded = bs58.decode(publicKeyString);
    // Solana public keys are 32 bytes
    return decoded.length === 32;
  } catch {
    return false;
  }
}
