/**
 * Blueshift Challenge Task Definitions
 * -------------------------------------
 * Defines the 6 challenge tasks from learn.blueshift.gg
 * with their NFT collection addresses and related resources.
 * * Tasks 1-4 are REQUIRED for "QUALIFIED" status.
 */

export type TaskCategory = 'TypeScript' | 'Anchor' | 'Rust';

export interface TaskLink {
  label: string;
  url: string;
}

export interface TaskDefinition {
  id: number;
  name: string;
  category: TaskCategory;
  collectionAddress: string;
  challengeUrl: string;
  videoTutorials: TaskLink[];
  codeRepos: TaskLink[];
  articleUrl?: string;
  required: boolean;
}

/**
 * Category color mapping for UI badges
 */
export const categoryColors: Record<TaskCategory, { bg: string; text: string; border: string }> = {
  TypeScript: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  Anchor: {
    bg: 'bg-white/5',
    text: 'text-gray-300',
    border: 'border-gray-600',
  },
  Rust: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
};

/**
 * The 6 Blueshift challenge tasks
 */
export const BLUESHIFT_TASKS: TaskDefinition[] = [
  {
    id: 1,
    name: 'Mint an SPL Token',
    category: 'TypeScript',
    collectionAddress: '2NVDhSXZck9AX2aUdPSxMemLN2wtqEd5sNEcwuZVCbHW',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/typescript-mint-an-spl-token',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV1evzGBsEqW/' },
    ],
    codeRepos: [
      { label: 'GitHub 参考代码', url: 'https://github.com/Tools-touch/Task-/' },
    ],
    required: true,
  },
  {
    id: 2,
    name: 'Anchor Vault',
    category: 'Anchor',
    collectionAddress: '53tiK9zY67DuyA1tgQ6rfNgixMB1LiCP9D67RgfbCrpz',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/anchor-vault',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV1eRzpBHEeh/' },
    ],
    codeRepos: [
      { label: 'daog1/blueshift_anchor_vault', url: 'https://github.com/daog1/blueshift_anchor_vault' },
      { label: 'solana-foundation/solana-dev-skill', url: 'https://github.com/solana-foundation/solana-dev-skill' },
    ],
    required: true,
  },
  {
    id: 3,
    name: 'Anchor Escrow',
    category: 'Anchor',
    collectionAddress: '2E5K7FxDWGXkbRpFEAkhR8yQwiUBGggVyng2vaAhah5L',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/anchor-escrow',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV1E5zSBeEuL/' },
    ],
    codeRepos: [
      { label: 'GitHub 参考代码', url: 'https://github.com/Tools-touch/Task-/' },
    ],
    required: true,
  },
  {
    id: 4,
    name: 'Pinocchio Vault',
    category: 'Rust',
    collectionAddress: 'AL38QM96SDu4Jpx7UGcTcaLtwvWPVgRUzg9PqC787djK',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/pinocchio-vault',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV1iA6iBtEka/' },
      { label: '视频号教程', url: 'https://weixin.qq.com/sph/AFj4cLUoA' },
    ],
    codeRepos: [
      { label: 'qiaopengjun5162/pinocchio_vault', url: 'https://github.com/qiaopengjun5162/pinocchio_vault' },
    ],
    articleUrl: 'https://mp.weixin.qq.com/s/u9u4uXawENY07PXsFgMtrQ',
    required: true,
  },
  {
    id: 5,
    name: 'Pinocchio Escrow',
    category: 'Rust',
    collectionAddress: 'HTXVJ8DD6eSxkVyDwgddxGw8cC8j6kXda3BUipA43Wvs',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/pinocchio-escrow',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV1iA6iBtE1b/' },
      { label: '视频号教程', url: 'https://weixin.qq.com/sph/AL1owj9ES' },
    ],
    codeRepos: [
      { label: 'Likeben-boy/blueshift_escrow_study', url: 'https://github.com/Likeben-boy/blueshift_escrow_study' },
    ],
    required: false,
  },
  {
    id: 6,
    name: 'Pinocchio AMM',
    category: 'Rust',
    collectionAddress: '9Lz67dYmMG8JzkkvfWQuVgGR12JdjV54p9e8TViKiqQz',
    challengeUrl: 'https://learn.blueshift.gg/zh-CN/challenges/pinocchio-amm',
    videoTutorials: [
      { label: 'B站视频教程', url: 'https://www.bilibili.com/video/BV19sfDB5EHt/' },
      { label: '视频号教程', url: 'https://weixin.qq.com/sph/AQI0bnFfb' },
    ],
    codeRepos: [
      { label: 'qiaopengjun5162/solana-pinocchio-amm-workshop', url: 'https://github.com/qiaopengjun5162/solana-pinocchio-amm-workshop' },
    ],
    required: false,
  },
];

/** Number of required tasks (Tasks 1-4) */
export const REQUIRED_TASK_COUNT = BLUESHIFT_TASKS.filter(t => t.required).length;
