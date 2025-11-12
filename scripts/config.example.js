/**
 * 视频处理配置文件示例
 * 复制此文件为 config.js 并根据需要修改参数
 */

export const CONFIG = {
  // ===== 支持的文件格式 =====
  VIDEO_EXTENSIONS: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  AUDIO_EXTENSIONS: ['.mp3', '.wav', '.aac', '.m4a', '.flac'],

  // ===== 视频处理参数 =====
  
  /**
   * 倍速播放速率
   * 1.0 = 正常速度
   * 1.2 = 1.2 倍速（推荐）
   * 1.5 = 1.5 倍速
   * 2.0 = 2 倍速
   */
  SPEED_RATE: 1.2,

  /**
   * 锐化强度
   * 0.0 = 不锐化
   * 0.1 = 轻微锐化 (10%)
   * 0.3 = 中等锐化 (30%)
   * 0.5 = 强烈锐化 (50%)
   */
  SHARPEN_AMOUNT: 0.1,

  /**
   * 是否左右翻转
   * true = 镜像翻转
   * false = 不翻转
   */
  ENABLE_FLIP: true,

  /**
   * 输出质量预设
   * 'ultra' = 超高质量
   * 'high' = 高质量（推荐）
   * 'medium' = 中等质量
   * 'low' = 低质量（文件小）
   */
  OUTPUT_QUALITY: 'high',

  // ===== FFmpeg 编码参数 =====

  /**
   * 视频编码器
   * 'libx264' = H.264 编码（最佳兼容性，推荐）
   * 'libx265' = H.265/HEVC 编码（更小文件，部分设备不支持）
   * 'libvpx-vp9' = VP9 编码（WebM）
   */
  VIDEO_CODEC: 'libx264',

  /**
   * 音频编码器
   * 'aac' = AAC 编码（推荐）
   * 'libmp3lame' = MP3 编码
   * 'libopus' = Opus 编码
   */
  AUDIO_CODEC: 'aac',

  /**
   * 视频码率
   * '8000k' = 8 Mbps（高质量）
   * '5000k' = 5 Mbps（中等质量，推荐）
   * '3000k' = 3 Mbps（低质量）
   */
  VIDEO_BITRATE: '8000k',

  /**
   * 音频码率
   * '320k' = 320 kbps（最高质量）
   * '192k' = 192 kbps（高质量，推荐）
   * '128k' = 128 kbps（标准质量）
   */
  AUDIO_BITRATE: '192k',

  /**
   * CRF 质量参数（仅用于 x264/x265）
   * 值越小质量越好，文件越大
   * 
   * '0' = 无损（文件巨大）
   * '18' = 视觉无损（高质量，推荐专业用途）
   * '23' = 标准质量（推荐日常使用）
   * '28' = 低质量
   * '51' = 最低质量
   */
  CRF: '18',

  /**
   * 编码预设（影响编码速度和压缩效率）
   * 
   * 'ultrafast' = 最快编码（质量差，文件大）
   * 'superfast' = 超快
   * 'veryfast' = 很快
   * 'faster' = 较快
   * 'fast' = 快
   * 'medium' = 中等（推荐日常使用）
   * 'slow' = 慢（推荐高质量）
   * 'slower' = 很慢（更好质量）
   * 'veryslow' = 极慢（最佳质量）
   * 'placebo' = 极限慢（不推荐，收益极小）
   */
  PRESET: 'slow',

  // ===== 音频参数 =====

  /**
   * 音频采样率
   * '48000' = 48 kHz（推荐，专业标准）
   * '44100' = 44.1 kHz（CD 质量）
   */
  AUDIO_SAMPLE_RATE: '48000',

  /**
   * 音频音量调整
   * 1.0 = 原始音量
   * 0.8 = 降低 20%
   * 1.2 = 提高 20%
   */
  MUSIC_VOLUME: 1.0,

  // ===== 其他设置 =====

  /**
   * 像素格式
   * 'yuv420p' = 最佳兼容性（推荐）
   */
  PIXEL_FORMAT: 'yuv420p',

  /**
   * 是否优化网络播放
   * true = 启用 faststart（推荐）
   * false = 不优化
   */
  ENABLE_FASTSTART: true,

  /**
   * 是否覆盖已存在的输出文件
   * true = 覆盖
   * false = 跳过
   */
  OVERWRITE_OUTPUT: true,

  /**
   * 并发处理数量
   * 1 = 逐个处理（推荐，稳定）
   * 2+ = 同时处理多个（需要更强的性能）
   */
  CONCURRENT_JOBS: 1,

  /**
   * 是否显示详细的 FFmpeg 输出
   * true = 显示所有信息（调试用）
   * false = 只显示进度（推荐）
   */
  VERBOSE: false,
};

// ===== 质量预设 =====

/**
 * 根据质量预设获取优化的参数
 */
export function getQualityPreset(quality) {
  const presets = {
    ultra: {
      CRF: '16',
      VIDEO_BITRATE: '12000k',
      PRESET: 'slower',
      AUDIO_BITRATE: '320k',
    },
    high: {
      CRF: '18',
      VIDEO_BITRATE: '8000k',
      PRESET: 'slow',
      AUDIO_BITRATE: '192k',
    },
    medium: {
      CRF: '23',
      VIDEO_BITRATE: '5000k',
      PRESET: 'medium',
      AUDIO_BITRATE: '128k',
    },
    low: {
      CRF: '28',
      VIDEO_BITRATE: '3000k',
      PRESET: 'fast',
      AUDIO_BITRATE: '96k',
    },
  };

  return presets[quality] || presets.high;
}

// ===== 使用示例 =====

/*
// 在你的脚本中导入配置：
import { CONFIG, getQualityPreset } from './config.js';

// 使用默认配置
console.log(CONFIG.SPEED_RATE);

// 或应用质量预设
const qualitySettings = getQualityPreset('medium');
const finalConfig = { ...CONFIG, ...qualitySettings };
*/

