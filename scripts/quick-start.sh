#!/bin/bash

# AutoCutVideo 快速启动脚本
# 适用于 macOS 和 Linux

set -e

# 默认参数
INPUT_DIR="videos/input"
OUTPUT_DIR="videos/output"
MUSIC_DIR="music"
CHECK_ONLY=false
SHOW_HELP=false

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印彩色输出
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# 显示帮助信息
show_help() {
    print_color "$CYAN" "\n🎬 AutoCutVideo 快速启动脚本\n"
    echo "用法:"
    echo "  ./scripts/quick-start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  -i, --input <路径>    指定输入视频目录 (默认: videos/input)"
    echo "  -o, --output <路径>   指定输出视频目录 (默认: videos/output)"
    echo "  -m, --music <路径>    指定背景音乐目录 (默认: music)"
    echo "  -c, --check           只进行环境检查，不处理视频"
    echo "  -h, --help            显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/quick-start.sh"
    echo "  ./scripts/quick-start.sh --check"
    echo "  ./scripts/quick-start.sh -i custom/input -m custom/music"
    echo ""
}

# 显示横幅
show_banner() {
    print_color "$CYAN" "\n╔════════════════════════════════════════╗"
    print_color "$CYAN" "║     AutoCutVideo 批量视频处理工具     ║"
    print_color "$CYAN" "║        专业视频自动化处理方案          ║"
    print_color "$CYAN" "╚════════════════════════════════════════╝\n"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--input)
            INPUT_DIR="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -m|--music)
            MUSIC_DIR="$2"
            shift 2
            ;;
        -c|--check)
            CHECK_ONLY=true
            shift
            ;;
        -h|--help)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 显示帮助
if [ "$SHOW_HELP" = true ]; then
    show_help
    exit 0
fi

show_banner

# 只进行环境检查
if [ "$CHECK_ONLY" = true ]; then
    print_color "$YELLOW" "🔍 执行环境检查..."
    npm run check
    exit $?
fi

# 检查目录
print_color "$YELLOW" "📁 检查目录..."

if [ ! -d "$INPUT_DIR" ]; then
    print_color "$RED" "❌ 输入目录不存在: $INPUT_DIR"
    echo -e "\n请创建目录并添加视频文件："
    echo "  mkdir -p $INPUT_DIR"
    echo ""
    exit 1
fi

if [ ! -d "$MUSIC_DIR" ]; then
    print_color "$RED" "❌ 音乐目录不存在: $MUSIC_DIR"
    echo -e "\n请创建目录并添加音乐文件："
    echo "  mkdir -p $MUSIC_DIR"
    echo ""
    exit 1
fi

# 统计文件
VIDEO_COUNT=$(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" -o -iname "*.webm" \) 2>/dev/null | wc -l | tr -d ' ')
MUSIC_COUNT=$(find "$MUSIC_DIR" -maxdepth 1 -type f \( -iname "*.mp3" -o -iname "*.wav" -o -iname "*.aac" -o -iname "*.m4a" -o -iname "*.flac" \) 2>/dev/null | wc -l | tr -d ' ')

print_color "$GREEN" "   ✅ 输入目录: $INPUT_DIR"
print_color "$GREEN" "   ✅ 输出目录: $OUTPUT_DIR"
print_color "$GREEN" "   ✅ 音乐目录: $MUSIC_DIR"
echo ""

# 检查文件数量
if [ "$VIDEO_COUNT" -eq 0 ]; then
    print_color "$YELLOW" "⚠️  未找到视频文件"
    echo -e "\n请将视频文件放入: $INPUT_DIR"
    echo "支持的格式: .mp4, .mov, .avi, .mkv, .webm"
    echo ""
    exit 1
fi

if [ "$MUSIC_COUNT" -eq 0 ]; then
    print_color "$YELLOW" "⚠️  未找到音乐文件"
    echo -e "\n请将音乐文件放入: $MUSIC_DIR"
    echo "支持的格式: .mp3, .wav, .aac, .m4a, .flac"
    echo ""
    exit 1
fi

# 显示文件统计
print_color "$CYAN" "📊 文件统计"
echo "   视频文件: $VIDEO_COUNT 个"
echo "   音乐文件: $MUSIC_COUNT 个"
echo ""

# 显示处理参数
print_color "$CYAN" "⚙️  处理参数"
echo "   - 倍速: 1.2x"
echo "   - 翻转: 左右镜像"
echo "   - 锐化: 10%"
echo "   - 音频: 背景音乐替换"
echo "   - 质量: 高质量 (CRF 18)"
echo ""

# 确认开始
print_color "$GREEN" "🚀 准备开始处理"
read -p "   是否继续? (Y/n): " confirm
confirm=${confirm:-Y}

if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo ""
    print_color "$CYAN" "⏳ 开始批量处理...\n"
    
    # 执行处理
    node scripts/batch-video-processor.js "$INPUT_DIR" "$OUTPUT_DIR" "$MUSIC_DIR"
    
    if [ $? -eq 0 ]; then
        echo ""
        print_color "$GREEN" "✅ 处理完成！"
        print_color "$GREEN" "   输出目录: $OUTPUT_DIR\n"
        
        # 打开输出目录 (仅 macOS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            read -p "   是否打开输出目录? (Y/n): " open_dir
            open_dir=${open_dir:-Y}
            if [[ "$open_dir" =~ ^[Yy]$ ]]; then
                open "$OUTPUT_DIR"
            fi
        fi
    else
        echo ""
        print_color "$RED" "❌ 处理过程中出现错误"
        echo "   请检查上面的错误信息"
        echo ""
        exit 1
    fi
else
    echo ""
    print_color "$YELLOW" "   已取消处理"
    echo ""
    exit 0
fi

