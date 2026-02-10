# Solana Clock-In Backend Oracle

> 🔐 安全的后端协签服务，用于验证用户学习进度并协签 Check-In 交易

## 架构概述

此后端实现了 **Co-signing（协签）** 安全模式：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   用户完成   │     │  前端创建   │     │  后端验证   │     │  用户提交   │
│   学习任务   │ ──▶ │  部分交易   │ ──▶ │  并协签     │ ──▶ │  到 Solana  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 为什么需要协签？

没有协签，用户可以：
- 直接调用智能合约，跳过学习
- 获得奖励而不真正学习

有了协签：
- 智能合约**需要**验证者签名
- 只有后端有验证者私钥
- 后端只在验证用户进度后签名
- 作弊变得不可能

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 生成验证者钱包

```bash
npm run generate-keypair
```

这会生成一个新的 Solana 密钥对，用于协签交易。

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 从 generate-keypair 命令输出复制
VERIFIER_PRIVATE_KEY=your_base58_private_key_here

# 你的 Check-In 智能合约 Program ID
CHECKIN_PROGRAM_ID=your_program_id_here

# Solana RPC
SOLANA_RPC_URL=https://api.devnet.solana.com

# 允许的前端源
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm run build
npm start
```

## API 端点

### `GET /health`
健康检查

**响应：**
```json
{
  "status": "ok",
  "verifierConfigured": true,
  "programIdConfigured": true,
  "timestamp": "2026-01-21T10:00:00.000Z"
}
```

### `GET /api/verifier`
获取验证者公钥

**响应：**
```json
{
  "success": true,
  "verifierPublicKey": "VerifierPubkey..."
}
```

### `POST /api/check-in`
协签 Check-In 交易

**请求体：**
```json
{
  "userPublicKey": "用户钱包地址",
  "serializedTx": "Base64编码的部分签名交易"
}
```

**成功响应：**
```json
{
  "success": true,
  "signedTx": "Base64编码的完整签名交易",
  "message": "Transaction co-signed successfully..."
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 安全特性

### 交易验证

后端在签名前会验证：

1. **Program ID 检查** - 确保交易调用正确的程序
2. **用户签名检查** - 确保用户已签名
3. **验证者账户检查** - 确保验证者被正确包含
4. **可写性检查** - 防止验证者账户被修改（防止资金盗取）
5. **指令数量限制** - 防止捆绑恶意指令
6. **程序白名单** - 只允许调用已知程序

### 最佳实践

- ✅ 私钥存储在环境变量中
- ✅ CORS 限制允许的源
- ✅ 交易验证防止恶意请求
- ✅ 验证者账户设为只读
- ❌ 不要将私钥提交到版本控制
- ❌ 不要在日志中打印私钥

## 前端集成示例

```typescript
// 1. 获取验证者公钥
const verifierResponse = await fetch('http://localhost:3001/api/verifier');
const { verifierPublicKey } = await verifierResponse.json();

// 2. 创建交易（包含验证者作为签名者）
const transaction = new Transaction();
transaction.add(
  new TransactionInstruction({
    programId: CHECKIN_PROGRAM_ID,
    keys: [
      { pubkey: userWallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: new PublicKey(verifierPublicKey), isSigner: true, isWritable: false },
      // ... 其他账户
    ],
    data: Buffer.from([/* instruction data */]),
  })
);

// 3. 用户签名
transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
transaction.feePayer = userWallet.publicKey;
const signedByUser = await userWallet.signTransaction(transaction);

// 4. 发送到后端协签
const response = await fetch('http://localhost:3001/api/check-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userPublicKey: userWallet.publicKey.toBase58(),
    serializedTx: signedByUser.serialize({ requireAllSignatures: false }).toString('base64'),
  }),
});

const { signedTx } = await response.json();

// 5. 提交到 Solana
const fullySignedTx = Transaction.from(Buffer.from(signedTx, 'base64'));
const txId = await connection.sendRawTransaction(fullySignedTx.serialize());
```

## TODO

- [ ] 集成 OpenBuild API 验证实际学习进度
- [ ] 添加速率限制
- [ ] 添加请求日志和监控
- [ ] 添加 Redis 缓存用户进度
- [ ] 添加 Prometheus 指标

## 许可证

MIT
