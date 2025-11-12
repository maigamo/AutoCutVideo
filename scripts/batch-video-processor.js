#!/usr/bin/env node

/**
 * OpenCut 批量视频自动化处理脚本
 * 
 * 功能：
 * - 1.2 倍速处理
 * - 左右翻转
 * - 锐化 10%
 * - 原音频静音
 * - 随机添加背景音乐并自动裁剪
 * - 高质量导出
 * 
 * 使用方法：
 *   node batch-video-processor.js <输入目录> <输出目录> <背景音乐目录>
 * 
 * 示例：
 *   node batch-video-processor.js ./input ./output ./music
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  // 支持的视频格式
  VIDEO_EXTENSIONS: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  // 支持的音频格式
  AUDIO_EXTENSIONS: ['.mp3', '.wav', '.aac', '.m4a', '.flac'],
  // 视频处理参数
  SPEED_RATE: 1.2,              // 倍速
  SHARPEN_AMOUNT: 0.1,          // 锐化强度（10%）
  OUTPUT_QUALITY: 'high',       // 输出质量
  // FFmpeg 编码参数
  VIDEO_CODEC: 'libx264',       // H.264 编码器
  AUDIO_CODEC: 'aac',           // AAC 音频编码器
  VIDEO_BITRATE: '8000k',       // 高质量视频码率
  AUDIO_BITRATE: '192k',        // 高质量音频码率
  CRF: '18',                    // 质量参数（18 = 高质量，23 = 默认）
  PRESET: 'slow',               // 编码速度（slow = 更好的压缩）
};

/**
 * 获取视频时长（秒）
 */
async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', videoPath,
      '-show_entries', 'format=duration',
      '-v', 'quiet',
      '-of', 'csv=p=0'
    ];

    const ffprobe = spawn('ffprobe', args);
    let output = '';

    ffprobe.stdout.on('data', (data) => {
      output += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code === 0) {
        const duration = Number.parseFloat(output.trim());
        resolve(duration);
      } else {
        reject(new Error(`ffprobe failed with code ${code}`));
      }
    });

    ffprobe.on('error', (err) => {
      reject(new Error(`ffprobe error: ${err.message}`));
    });
  });
}

/**
 * 随机选择背景音乐
 */
async function getRandomMusic(musicDir) {
  const files = await fs.readdir(musicDir);
  const musicFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.AUDIO_EXTENSIONS.includes(ext);
  });

  if (musicFiles.length === 0) {
    throw new Error(`没有在 ${musicDir} 中找到音乐文件`);
  }

  const randomFile = musicFiles[Math.floor(Math.random() * musicFiles.length)];
  return path.join(musicDir, randomFile);
}

/**
 * 处理单个视频
 */
async function processVideo({ inputPath, outputPath, musicPath }) {
  console.log(`\n📹 处理视频: ${path.basename(inputPath)}`);
  console.log(`🎵 使用音乐: ${path.basename(musicPath)}`);

  // 1. 获取视频时长
  console.log('⏱️  获取视频时长...');
  const videoDuration = await getVideoDuration(inputPath);
  const adjustedDuration = videoDuration / CONFIG.SPEED_RATE; // 1.2 倍速后的时长
  console.log(`   原始时长: ${videoDuration.toFixed(2)}s → 调整后: ${adjustedDuration.toFixed(2)}s`);

  // 2. 构建 FFmpeg 命令
  const args = [
    // 输入文件
    '-i', inputPath,           // 视频输入
    '-i', musicPath,           // 音乐输入
    
    // 视频处理滤镜
    '-filter_complex', [
      // 1.2 倍速
      `[0:v]setpts=PTS/${CONFIG.SPEED_RATE}`,
      // 左右翻转
      'hflip',
      // 锐化 10%（使用 unsharp 滤镜）
      `unsharp=5:5:${CONFIG.SHARPEN_AMOUNT}:5:5:0`,
    ].join(',') + '[v]',
    
    // 音频处理
    '-map', '[v]',                              // 使用处理后的视频
    '-map', '1:a',                              // 使用音乐音频（忽略原视频音频 = 静音）
    
    // 裁剪音频到视频长度
    '-t', adjustedDuration.toString(),
    
    // 编码设置（高质量）
    '-c:v', CONFIG.VIDEO_CODEC,
    '-preset', CONFIG.PRESET,
    '-crf', CONFIG.CRF,
    '-b:v', CONFIG.VIDEO_BITRATE,
    
    '-c:a', CONFIG.AUDIO_CODEC,
    '-b:a', CONFIG.AUDIO_BITRATE,
    '-ar', '48000',                             // 采样率 48kHz
    
    // 其他设置
    '-pix_fmt', 'yuv420p',                      // 兼容性像素格式
    '-movflags', '+faststart',                  // 优化网络播放
    '-y',                                       // 覆盖输出文件
    
    outputPath
  ];

  console.log('🔄 开始处理...');
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    
    let errorOutput = '';
    
    // 捕获进度信息
    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;
      
      // 提取进度信息（可选）
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        const [, hours, minutes, seconds] = timeMatch;
        const currentTime = Number.parseInt(hours) * 3600 + 
                          Number.parseInt(minutes) * 60 + 
                          Number.parseInt(seconds);
        const progress = ((currentTime / adjustedDuration) * 100).toFixed(1);
        process.stdout.write(`\r   进度: ${progress}%`);
      }
    });
    
    ffmpeg.on('close', (code) => {
      process.stdout.write('\r');
      if (code === 0) {
        console.log('✅ 处理完成！');
        resolve();
      } else {
        console.error(`\n❌ FFmpeg 失败 (code ${code})`);
        console.error('错误输出:', errorOutput.slice(-500)); // 显示最后 500 字符
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      reject(new Error(`FFmpeg 启动失败: ${err.message}`));
    });
  });
}

/**
 * 生成输出文件名
 */
function generateOutputFilename(inputPath) {
  const parsed = path.parse(inputPath);
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\./g, '-')
    .slice(0, 19); // YYYY-MM-DDTHH-MM-SS
  
  return `${parsed.name}_${timestamp}.mp4`;
}

/**
 * 批量处理视频
 */
async function batchProcess({ inputDir, outputDir, musicDir }) {
  console.log('🚀 OpenCut 批量视频处理器\n');
  console.log('配置:');
  console.log(`  输入目录: ${inputDir}`);
  console.log(`  输出目录: ${outputDir}`);
  console.log(`  音乐目录: ${musicDir}`);
  console.log(`  倍速: ${CONFIG.SPEED_RATE}x`);
  console.log(`  锐化: ${(CONFIG.SHARPEN_AMOUNT * 100).toFixed(0)}%`);
  console.log(`  质量: CRF=${CONFIG.CRF}, 码率=${CONFIG.VIDEO_BITRATE}\n`);

  // 1. 检查目录
  try {
    await fs.access(inputDir);
    await fs.access(musicDir);
  } catch (err) {
    throw new Error(`目录不存在: ${err.message}`);
  }

  // 2. 创建输出目录
  await fs.mkdir(outputDir, { recursive: true });

  // 3. 获取所有视频文件
  const files = await fs.readdir(inputDir);
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.VIDEO_EXTENSIONS.includes(ext);
  });

  if (videoFiles.length === 0) {
    throw new Error(`在 ${inputDir} 中没有找到视频文件`);
  }

  console.log(`📁 找到 ${videoFiles.length} 个视频文件\n`);

  // 4. 处理每个视频
  const results = {
    success: [],
    failed: [],
  };

  for (let i = 0; i < videoFiles.length; i++) {
    const videoFile = videoFiles[i];
    const inputPath = path.join(inputDir, videoFile);
    const outputFilename = generateOutputFilename(inputPath);
    const outputPath = path.join(outputDir, outputFilename);
    
    console.log(`\n[${i + 1}/${videoFiles.length}] 处理: ${videoFile}`);
    
    try {
      // 随机选择音乐
      const musicPath = await getRandomMusic(musicDir);
      
      // 处理视频
      await processVideo({ inputPath, outputPath, musicPath });
      
      results.success.push({
        input: videoFile,
        output: outputFilename,
      });
    } catch (err) {
      console.error(`❌ 处理失败: ${err.message}`);
      results.failed.push({
        input: videoFile,
        error: err.message,
      });
    }
  }

  // 5. 输出汇总
  console.log('\n' + '='.repeat(60));
  console.log('📊 处理汇总');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${results.success.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  
  if (results.success.length > 0) {
    console.log('\n✅ 成功的文件:');
    for (const item of results.success) {
      console.log(`   ${item.input} → ${item.output}`);
    }
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ 失败的文件:');
    for (const item of results.failed) {
      console.log(`   ${item.input}: ${item.error}`);
    }
  }
  
  console.log('\n🎉 批量处理完成！');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('用法: node batch-video-processor.js <输入目录> <输出目录> <背景音乐目录>');
    console.error('\n示例:');
    console.error('  node batch-video-processor.js ./videos/input ./videos/output ./music');
    process.exit(1);
  }

  const [inputDir, outputDir, musicDir] = args;

  try {
    await batchProcess({ inputDir, outputDir, musicDir });
  } catch (err) {
    console.error('\n💥 错误:', err.message);
    process.exit(1);
  }
}

// 运行
main().catch(console.error);

