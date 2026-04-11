#!/usr/bin/env ts-node-esm
/**
 * Keypair Generator Script
 * ------------------------
 * Generates a new random Solana keypair for use as the Verifier wallet.
 * 
 * Usage:
 *   npm run generate-keypair
 * 
 * This will output:
 *   - Public Key: Share this with your frontend and smart contract
 *   - Private Key: Copy this to your .env file (NEVER share this!)
 * 
 * Security Notes:
 * - The private key must be kept secret
 * - Never commit the private key to version control
 * - Store it securely in environment variables
 * - If compromised, anyone can co-sign transactions
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Generates a new random Solana Keypair.
 */
function generateNewKeypair(): {
  publicKey: string;
  privateKeyBase58: string;
} {
  const keypair = Keypair.generate();
  
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKeyBase58: bs58.encode(keypair.secretKey),
  };
}

console.log('\n');
console.log('═'.repeat(70));
console.log('          🔐 SOLANA VERIFIER KEYPAIR GENERATOR 🔐');
console.log('═'.repeat(70));
console.log('\n');

// Generate new keypair
const { publicKey, privateKeyBase58 } = generateNewKeypair();

console.log('A new Solana keypair has been generated for your Verifier wallet.\n');

console.log('┌' + '─'.repeat(68) + '┐');
console.log('│ PUBLIC KEY (Safe to share):                                       │');
console.log('└' + '─'.repeat(68) + '┘');
console.log(`\n  ${publicKey}\n`);

console.log('┌' + '─'.repeat(68) + '┐');
console.log('│ PRIVATE KEY (Keep this SECRET!):                                  │');
console.log('└' + '─'.repeat(68) + '┘');
console.log(`\n  ${privateKeyBase58}\n`);

console.log('═'.repeat(70));
console.log('                           NEXT STEPS');
console.log('═'.repeat(70));
console.log(`
  1. Copy the PRIVATE KEY above to your .env file:
     
     VERIFIER_PRIVATE_KEY=${privateKeyBase58}

  2. Fund the verifier wallet on Devnet (for testing):
     
     solana airdrop 1 ${publicKey} --url devnet

  3. Update your smart contract with the verifier's PUBLIC KEY
     so it knows to require this wallet's signature.

  4. Share the PUBLIC KEY with your frontend so it can include
     the verifier as a required signer in transactions.
`);

console.log('═'.repeat(70));
console.log('          ⚠️  SECURITY WARNING ⚠️');
console.log('═'.repeat(70));
console.log(`
  • NEVER commit the private key to version control
  • NEVER share the private key with anyone
  • Store it securely in environment variables only
  • If compromised, generate a new keypair immediately
`);
console.log('═'.repeat(70));
console.log('\n');
