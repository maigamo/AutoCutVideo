#!/bin/bash

# OpenCut 批量视频处理脚本 - 使用示例
# 此脚本展示如何使用批量处理工具

echo "🎬 OpenCut 批量视频处理 - 示例"
echo "================================"
echo ""

# 1. 创建目录结构
echo "📁 第一步：创建目录结构..."
mkdir -p videos/input
mkdir -p videos/output
mkdir -p music

echo "   ✅ 目录创建完成"
echo ""

# 2. 检查 FFmpeg 安装
echo "🔍 第二步：检查 FFmpeg 安装..."
if ! command -v ffmpeg &> /dev/null; then
    echo "   ❌ 未找到 FFmpeg，请先安装："
    echo ""
    echo "   Windows: choco install ffmpeg"
    echo "   Mac:     brew install ffmpeg"
    echo "   Linux:   sudo apt install ffmpeg"
    echo ""
    exit 1
fi

echo "   ✅ FFmpeg 已安装: $(ffmpeg -version | head -n1)"
echo ""

# 3. 提示用户添加文件
echo "📝 第三步：添加文件"
echo "   请执行以下操作："
echo ""
echo "   1. 将待处理视频放入: videos/input/"
echo "      支持格式: .mp4, .mov, .avi, .mkv, .webm"
echo ""
echo "   2. 将背景音乐放入: music/"
echo "      支持格式: .mp3, .wav, .aac, .m4a"
echo ""

# 4. 检查文件
VIDEO_COUNT=$(find videos/input -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.mkv" -o -name "*.webm" \) 2>/dev/null | wc -l)
MUSIC_COUNT=$(find music -type f \( -name "*.mp3" -o -name "*.wav" -o -name "*.aac" -o -name "*.m4a" \) 2>/dev/null | wc -l)

echo "   当前状态："
echo "   - 视频文件: $VIDEO_COUNT 个"
echo "   - 音乐文件: $MUSIC_COUNT 个"
echo ""

if [ "$VIDEO_COUNT" -eq 0 ] || [ "$MUSIC_COUNT" -eq 0 ]; then
    echo "   ⚠️  请添加文件后再继续"
    echo ""
    echo "   准备好后，运行以下命令："
    echo "   node scripts/batch-video-processor.js videos/input videos/output music"
    echo ""
    exit 0
fi

# 5. 运行处理
echo "🚀 第四步：开始批量处理"
echo ""
read -p "   发现 $VIDEO_COUNT 个视频和 $MUSIC_COUNT 个音乐，是否开始处理？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "   正在处理..."
    echo ""
    node scripts/batch-video-processor.js videos/input videos/output music
    
    echo ""
    echo "✅ 处理完成！"
    echo "   输出目录: videos/output/"
    echo ""
else
    echo ""
    echo "   已取消处理"
    echo ""
fi

