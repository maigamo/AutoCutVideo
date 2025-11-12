# OpenCut 批量视频处理脚本 - Windows PowerShell 版本
# 此脚本展示如何使用批量处理工具

Write-Host "🎬 OpenCut 批量视频处理 - 示例" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. 创建目录结构
Write-Host "📁 第一步：创建目录结构..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "videos/input" | Out-Null
New-Item -ItemType Directory -Force -Path "videos/output" | Out-Null
New-Item -ItemType Directory -Force -Path "music" | Out-Null

Write-Host "   ✅ 目录创建完成" -ForegroundColor Green
Write-Host ""

# 2. 检查 FFmpeg 安装
Write-Host "🔍 第二步：检查 FFmpeg 安装..." -ForegroundColor Yellow
try {
    $ffmpegVersion = & ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ FFmpeg 已安装: $ffmpegVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 未找到 FFmpeg，请先安装：" -ForegroundColor Red
    Write-Host ""
    Write-Host "   方法 1（推荐）: choco install ffmpeg"
    Write-Host "   方法 2: scoop install ffmpeg"
    Write-Host "   方法 3: 从 https://ffmpeg.org/download.html 下载"
    Write-Host ""
    exit 1
}
Write-Host ""

# 3. 提示用户添加文件
Write-Host "📝 第三步：添加文件" -ForegroundColor Yellow
Write-Host "   请执行以下操作："
Write-Host ""
Write-Host "   1. 将待处理视频放入: videos\input\"
Write-Host "      支持格式: .mp4, .mov, .avi, .mkv, .webm"
Write-Host ""
Write-Host "   2. 将背景音乐放入: music\"
Write-Host "      支持格式: .mp3, .wav, .aac, .m4a"
Write-Host ""

# 4. 检查文件
$videoFiles = Get-ChildItem -Path "videos/input" -Include *.mp4,*.mov,*.avi,*.mkv,*.webm -Recurse -ErrorAction SilentlyContinue
$musicFiles = Get-ChildItem -Path "music" -Include *.mp3,*.wav,*.aac,*.m4a -Recurse -ErrorAction SilentlyContinue

$videoCount = if ($videoFiles) { $videoFiles.Count } else { 0 }
$musicCount = if ($musicFiles) { $musicFiles.Count } else { 0 }

Write-Host "   当前状态："
Write-Host "   - 视频文件: $videoCount 个"
Write-Host "   - 音乐文件: $musicCount 个"
Write-Host ""

if ($videoCount -eq 0 -or $musicCount -eq 0) {
    Write-Host "   ⚠️  请添加文件后再继续" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   准备好后，运行以下命令："
    Write-Host "   node scripts/batch-video-processor.js videos/input videos/output music"
    Write-Host ""
    exit 0
}

# 5. 运行处理
Write-Host "🚀 第四步：开始批量处理" -ForegroundColor Yellow
Write-Host ""
$reply = Read-Host "   发现 $videoCount 个视频和 $musicCount 个音乐，是否开始处理？(y/n)"

if ($reply -eq 'y' -or $reply -eq 'Y') {
    Write-Host ""
    Write-Host "   正在处理..." -ForegroundColor Cyan
    Write-Host ""
    
    node scripts/batch-video-processor.js videos/input videos/output music
    
    Write-Host ""
    Write-Host "✅ 处理完成！" -ForegroundColor Green
    Write-Host "   输出目录: videos\output\"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "   已取消处理" -ForegroundColor Yellow
    Write-Host ""
}

