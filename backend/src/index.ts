/**
 * Solana Clock-In Backend Oracle Service
 * =======================================
 * 
 * This backend implements a "Co-signing" security pattern for the
 * Stake-to-Learn DApp. The flow works as follows:
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                        CO-SIGNING FLOW                              │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │                                                                     │
 * │  1. User completes off-chain task (watches video, reads article)   │
 * │                              │                                      │
 * │                              ▼                                      │
 * │  2. Frontend creates a PARTIAL transaction                         │
 * │     - Includes check-in instruction                                │
 * │     - User signs the transaction                                   │
 * │     - Transaction requires VERIFIER signature (not yet added)      │
 * │                              │                                      │
 * │                              ▼                                      │
 * │  3. Frontend sends transaction to this Backend                     │
 * │     POST /api/check-in { userPublicKey, serializedTx }            │
 * │                              │                                      │
 * │                              ▼                                      │
 * │  4. Backend VALIDATES:                                              │
 * │     - User identity                                                 │
 * │     - Off-chain progress (via OpenBuild API - TODO)                │
 * │     - Transaction integrity (security checks)                       │
 * │                              │                                      │
 * │                              ▼                                      │
 * │  5. Backend CO-SIGNS with VERIFIER_PRIVATE_KEY                     │
 * │     - Adds verifier signature to transaction                       │
 * │     - Returns fully signed transaction to frontend                 │
 * │                              │                                      │
 * │                              ▼                                      │
 * │  6. Frontend submits transaction to Solana                         │
 * │     - Both user and verifier have signed                           │
 * │     - Smart contract validates both signatures                     │
 * │     - Check-in is recorded on-chain                                │
 * │                                                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * Why This Pattern?
 * -----------------
 * Without co-signing, users could:
 * - Directly call the smart contract without completing tasks
 * - Claim rewards without actually learning
 * 
 * With co-signing:
 * - Smart contract REQUIRES the verifier's signature
 * - Only this backend has the verifier's private key
 * - Backend only signs after validating user progress
 * - Cheating becomes impossible
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PublicKey, Connection } from '@solana/web3.js';

import { loadVerifierKeypair, isValidPublicKey } from './utils/keypair.ts';
import {
  deserializeTransaction,
  serializeTransaction,
  verifyTransaction,
} from './utils/verification.ts';

// Load environment variables
dotenv.config();

// ============================================================
// Configuration
// ============================================================
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const CHECKIN_PROGRAM_ID = process.env.CHECKIN_PROGRAM_ID;

// Initialize Express app
const app = express();

// ============================================================
// Middleware
// ============================================================
app.use(express.json({ limit: '1mb' }));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
}));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// Solana Connection & Verifier Setup
// ============================================================
let verifierKeypair: ReturnType<typeof loadVerifierKeypair> | null = null;
let connection: Connection | null = null;

/**
 * Initialize the Solana connection and verifier keypair.
 * Called once at server startup.
 */
function initializeSolana(): boolean {
  try {
    // Load the verifier keypair
    verifierKeypair = loadVerifierKeypair();
    console.log(`✅ Verifier wallet loaded: ${verifierKeypair.publicKey.toBase58()}`);

    // Initialize Solana connection
    connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    console.log(`✅ Connected to Solana RPC: ${SOLANA_RPC_URL}`);

    // Validate program ID is configured
    if (!CHECKIN_PROGRAM_ID) {
      console.warn('⚠️  CHECKIN_PROGRAM_ID not configured - transaction verification will fail');
    } else {
      console.log(`✅ Check-in Program ID: ${CHECKIN_PROGRAM_ID}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Solana:', error);
    return false;
  }
}

// ============================================================
// API Endpoints
// ============================================================

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    verifierConfigured: verifierKeypair !== null,
    programIdConfigured: !!CHECKIN_PROGRAM_ID,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get verifier public key
 * Frontend needs this to include verifier as a signer in the transaction
 */
app.get('/api/verifier', (_req: Request, res: Response) => {
  if (!verifierKeypair) {
    return res.status(503).json({
      success: false,
      error: 'Verifier not configured',
    });
  }

  res.json({
    success: true,
    verifierPublicKey: verifierKeypair.publicKey.toBase58(),
  });
});

/**
 * Check-In Endpoint
 * -----------------
 * This is the main co-signing endpoint.
 * 
 * Request Body:
 * - userPublicKey: The user's wallet address (Base58)
 * - serializedTx: The partially signed transaction (Base64)
 * 
 * Response:
 * - success: boolean
 * - signedTx: The fully signed transaction (Base64) - if success
 * - error: Error message - if failed
 */
interface CheckInRequest {
  userPublicKey: string;
  serializedTx: string;
}

app.post('/api/check-in', async (req: Request<object, object, CheckInRequest>, res: Response) => {
  try {
    const { userPublicKey, serializedTx } = req.body;

    // ============================================================
    // Step 1: Validate Request Parameters
    // ============================================================
    if (!userPublicKey || !serializedTx) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userPublicKey and serializedTx',
      });
    }

    if (!isValidPublicKey(userPublicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userPublicKey format',
      });
    }

    // ============================================================
    // Step 2: Ensure Verifier is Configured
    // ============================================================
    if (!verifierKeypair) {
      return res.status(503).json({
        success: false,
        error: 'Server not properly configured: Verifier keypair missing',
      });
    }

    if (!CHECKIN_PROGRAM_ID) {
      return res.status(503).json({
        success: false,
        error: 'Server not properly configured: Program ID missing',
      });
    }

    // ============================================================
    // Step 3: Validate User Progress (Mock for now)
    // ============================================================
    // TODO: Integrate with OpenBuild API to verify actual course progress
    // Example future implementation:
    // 
    // const progressResponse = await fetch(
    //   `${process.env.OPENBUILD_API_URL}/user/${userPublicKey}/progress`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${process.env.OPENBUILD_API_KEY}`,
    //     },
    //   }
    // );
    // 
    // const progressData = await progressResponse.json();
    // if (!progressData.completedToday) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'User has not completed today\'s learning task',
    //   });
    // }

    console.log(`📚 Mock validation passed for user: ${userPublicKey}`);
    console.log('   TODO: Replace with actual OpenBuild API progress check');

    // ============================================================
    // Step 4: Deserialize and Verify Transaction
    // ============================================================
    let transaction;
    try {
      transaction = deserializeTransaction(serializedTx);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Failed to deserialize transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Security verification - CRITICAL
    const verificationResult = verifyTransaction(transaction, {
      expectedProgramId: new PublicKey(CHECKIN_PROGRAM_ID),
      userPublicKey: new PublicKey(userPublicKey),
      verifierPublicKey: verifierKeypair.publicKey,
    });

    if (!verificationResult.isValid) {
      console.warn(`🚫 Transaction verification failed: ${verificationResult.error}`);
      return res.status(400).json({
        success: false,
        error: `Transaction verification failed: ${verificationResult.error}`,
      });
    }

    console.log('✅ Transaction verification passed');

    // ============================================================
    // Step 5: Co-sign the Transaction
    // ============================================================
    // This is where the magic happens!
    // By adding our signature, we're attesting that:
    // - We verified the user's identity
    // - We confirmed they completed their learning task
    // - The transaction is safe and matches our expected format
    
    try {
      // Partial sign - add verifier's signature
      transaction.partialSign(verifierKeypair);
      console.log('✅ Transaction co-signed by verifier');
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to co-sign transaction',
      });
    }

    // ============================================================
    // Step 6: Return Signed Transaction
    // ============================================================
    const signedTx = serializeTransaction(transaction);

    console.log(`✅ Check-in co-signed for user: ${userPublicKey}`);

    return res.json({
      success: true,
      signedTx,
      message: 'Transaction co-signed successfully. Submit to Solana to complete check-in.',
    });

  } catch (error) {
    console.error('❌ Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during check-in processing',
    });
  }
});

// ============================================================
// Error Handling
// ============================================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// ============================================================
// Server Startup
// ============================================================
async function startServer() {
  console.log('\n🚀 Starting Solana Clock-In Backend Oracle...\n');
  console.log('═'.repeat(60));

  // Initialize Solana connection and verifier
  const initialized = initializeSolana();

  if (!initialized) {
    console.error('\n❌ Failed to initialize. Please check your .env configuration.');
    console.log('\nTo generate a new verifier keypair, run:');
    console.log('  npm run generate-keypair\n');
    process.exit(1);
  }

  console.log('═'.repeat(60));
  console.log('\n📡 API Endpoints:');
  console.log(`   GET  /health        - Health check`);
  console.log(`   GET  /api/verifier  - Get verifier public key`);
  console.log(`   POST /api/check-in  - Co-sign check-in transaction\n`);

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ')}\n`);
  });
}

startServer();
