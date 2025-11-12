#!/usr/bin/env node

/**
 * 环境检查脚本
 * 检查所有必需的依赖和配置
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, args = ['--version']) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { shell: true });
    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output.trim().split('\n')[0], // 只显示第一行
      });
    });

    proc.on('error', () => {
      resolve({ success: false, output: '' });
    });
  });
}

async function checkDirectory(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function countFiles(dirPath, extensions) {
  try {
    const files = await fs.readdir(dirPath);
    const matchingFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
    return matchingFiles.length;
  } catch {
    return 0;
  }
}

async function main() {
  log('\n🔍 AutoCutVideo 环境检查\n', 'cyan');
  log('='.repeat(60), 'cyan');
  log('');

  let allPassed = true;

  // 1. 检查 Node.js 版本
  log('📦 Node.js', 'bold');
  const nodeVersion = process.version;
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`   ✅ 版本: ${nodeVersion}`, 'green');
  } else {
    log(`   ❌ 版本过低: ${nodeVersion} (需要 >= 18.0.0)`, 'red');
    allPassed = false;
  }
  log('');

  // 2. 检查 FFmpeg
  log('🎬 FFmpeg', 'bold');
  const ffmpegResult = await checkCommand('ffmpeg', ['-version']);
  if (ffmpegResult.success) {
    log(`   ✅ 已安装: ${ffmpegResult.output}`, 'green');
  } else {
    log('   ❌ 未安装或未添加到 PATH', 'red');
    log('   安装方法:', 'yellow');
    log('     Windows: choco install ffmpeg', 'yellow');
    log('     macOS:   brew install ffmpeg', 'yellow');
    log('     Linux:   sudo apt install ffmpeg', 'yellow');
    allPassed = false;
  }
  log('');

  // 3. 检查 FFprobe
  log('🔍 FFprobe', 'bold');
  const ffprobeResult = await checkCommand('ffprobe', ['-version']);
  if (ffprobeResult.success) {
    log(`   ✅ 已安装: ${ffprobeResult.output}`, 'green');
  } else {
    log('   ❌ 未安装或未添加到 PATH', 'red');
    allPassed = false;
  }
  log('');

  // 4. 检查目录结构
  log('📁 目录结构', 'bold');
  
  const projectRoot = path.join(__dirname, '..');
  const requiredDirs = [
    { path: 'videos/input', required: true },
    { path: 'videos/output', required: false },
    { path: 'music', required: true },
    { path: 'scripts', required: true },
  ];

  for (const dir of requiredDirs) {
    const fullPath = path.join(projectRoot, dir.path);
    const exists = await checkDirectory(fullPath);
    
    if (exists) {
      log(`   ✅ ${dir.path}`, 'green');
    } else if (dir.required) {
      log(`   ❌ ${dir.path} (不存在)`, 'red');
      allPassed = false;
    } else {
      log(`   ⚠️  ${dir.path} (不存在，将自动创建)`, 'yellow');
    }
  }
  log('');

  // 5. 检查文件
  log('📄 文件检查', 'bold');
  
  const inputDir = path.join(projectRoot, 'videos', 'input');
  const musicDir = path.join(projectRoot, 'music');
  
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a', '.flac'];
  
  const videoCount = await countFiles(inputDir, videoExtensions);
  const musicCount = await countFiles(musicDir, audioExtensions);
  
  if (videoCount > 0) {
    log(`   ✅ 输入视频: ${videoCount} 个`, 'green');
  } else {
    log(`   ⚠️  输入视频: 0 个 (请添加视频到 videos/input)`, 'yellow');
  }
  
  if (musicCount > 0) {
    log(`   ✅ 背景音乐: ${musicCount} 个`, 'green');
  } else {
    log(`   ⚠️  背景音乐: 0 个 (请添加音乐到 music)`, 'yellow');
  }
  log('');

  // 6. 总结
  log('='.repeat(60), 'cyan');
  log('');
  
  if (allPassed) {
    log('✅ 环境检查通过！可以开始使用', 'green');
    log('');
    log('运行以下命令开始处理:', 'cyan');
    log('  node scripts/batch-video-processor.js videos/input videos/output music');
    log('');
  } else {
    log('❌ 环境检查失败，请先解决上述问题', 'red');
    log('');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('检查失败:', err.message);
  process.exit(1);
});

