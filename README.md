# AutoCutVideo - 自动化视频批量处理工具

🎬 基于 FFmpeg 的专业视频批量处理工具，支持倍速、翻转、锐化、背景音乐替换等功能。

## ✨ 功能特性

- ⚡ **1.2倍速处理** - 加快视频播放速度
- 🔄 **左右翻转** - 镜像翻转视频画面
- ✨ **智能锐化** - 10% 锐化增强画面清晰度
- 🎵 **背景音乐** - 原音频静音，随机添加背景音乐并自动裁剪
- 🎯 **高质量导出** - H.264 编码，CRF 18 高质量输出
- 📦 **批量处理** - 一次处理整个文件夹的视频
- 🎲 **随机音乐** - 从音乐库随机选择背景音乐

## 📋 系统要求

### 必需软件

1. **Node.js** (>= 18.0.0)
   - 下载地址: https://nodejs.org/
   - 验证安装: `node --version`

2. **FFmpeg** (含 ffprobe)
   - 下载地址: https://ffmpeg.org/download.html
   - Windows 用户推荐: https://www.gyan.dev/ffmpeg/builds/
   - 验证安装: `ffmpeg -version` 和 `ffprobe -version`

### 安装 FFmpeg (Windows)

```powershell
# 使用 Chocolatey (推荐)
choco install ffmpeg

# 或手动安装
# 1. 从 https://www.gyan.dev/ffmpeg/builds/ 下载 ffmpeg-release-full.7z
# 2. 解压到 C:\ffmpeg
# 3. 将 C:\ffmpeg\bin 添加到系统 PATH 环境变量
```

### 安装 FFmpeg (macOS)

```bash
# 使用 Homebrew
brew install ffmpeg
```

### 安装 FFmpeg (Linux)

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 克隆或下载项目后
npm install
```

### 2. 准备文件

```
AutoCutVideo/
├── videos/
│   ├── input/          # 放置要处理的视频文件
│   └── output/         # 处理后的视频输出目录（自动创建）
├── music/              # 放置背景音乐文件
└── scripts/
    └── batch-video-processor.js
```

### 3. 运行处理

```bash
# 基本用法
node scripts/batch-video-processor.js videos/input videos/output music

# 使用 npm scripts
npm run process videos/input videos/output music
```

### Windows PowerShell 示例

```powershell
# 进入项目目录
cd C:\cursor_workspace\AutoCutVideo

# 运行批量处理
node scripts/batch-video-processor.js videos/input videos/output music
```

### 使用示例脚本

```powershell
# Windows
.\scripts\example-usage.ps1

# macOS/Linux
bash scripts/example-usage.sh
```

## 📁 支持的格式

### 视频格式
- `.mp4`
- `.mov`
- `.avi`
- `.mkv`
- `.webm`

### 音频格式
- `.mp3`
- `.wav`
- `.aac`
- `.m4a`
- `.flac`

## ⚙️ 处理参数说明

当前配置（可在 `scripts/batch-video-processor.js` 中修改）：

```javascript
const CONFIG = {
  SPEED_RATE: 1.2,              // 播放速度（1.2 = 1.2倍速）
  SHARPEN_AMOUNT: 0.1,          // 锐化强度（0.1 = 10%）
  VIDEO_CODEC: 'libx264',       // 视频编码器
  AUDIO_CODEC: 'aac',           // 音频编码器
  VIDEO_BITRATE: '8000k',       // 视频码率（8Mbps）
  AUDIO_BITRATE: '192k',        // 音频码率（192kbps）
  CRF: '18',                    // 质量参数（18 = 高质量）
  PRESET: 'slow',               // 编码预设（slow = 高质量压缩）
};
```

### 参数调整建议

- **CRF 值** (画质)
  - `18` = 高质量（文件较大）
  - `23` = 标准质量（推荐）
  - `28` = 低质量（文件较小）

- **PRESET** (编码速度)
  - `ultrafast` = 最快（质量较低）
  - `fast` = 快速
  - `medium` = 中等（推荐）
  - `slow` = 慢速（质量较高）
  - `veryslow` = 极慢（最高质量）

## 📊 处理流程

```
输入视频 → 1.2倍速 → 左右翻转 → 锐化10% → 静音原音频 → 添加背景音乐 → 高质量导出
```

### FFmpeg 处理链

1. **视频处理**
   - `setpts=PTS/1.2` - 1.2倍速
   - `hflip` - 水平翻转
   - `unsharp=5:5:0.1:5:5:0` - 锐化滤镜

2. **音频处理**
   - 忽略原视频音轨
   - 使用随机选择的背景音乐
   - 自动裁剪音乐到视频长度

3. **编码输出**
   - H.264 编码 (最佳兼容性)
   - AAC 音频 (48kHz)
   - MP4 容器 (faststart 优化)

## 💡 使用技巧

### 1. 批量处理多个文件夹

```powershell
# 处理多个不同的输入文件夹
node scripts/batch-video-processor.js videos/folder1 videos/output1 music
node scripts/batch-video-processor.js videos/folder2 videos/output2 music
```

### 2. 查看处理进度

脚本会实时显示：
- 当前处理的文件名
- 使用的背景音乐
- 处理进度百分比
- 成功/失败统计

### 3. 输出文件命名

输出文件自动添加时间戳，避免覆盖：
```
原文件: video.mp4
输出: video_2025-11-09T14-30-45.mp4
```

### 4. 错误处理

- 单个视频处理失败不会中断整个批处理
- 最后会显示详细的成功/失败报告
- 失败的文件会显示错误原因

## 🔧 故障排除

### 问题 1: `Cannot use import statement outside a module`

**原因**: 缺少 `package.json` 或未设置 `"type": "module"`

**解决**:
```bash
# 确保项目根目录有 package.json，且包含：
# "type": "module"
```

### 问题 2: `ffmpeg/ffprobe not found`

**原因**: FFmpeg 未安装或未添加到 PATH

**解决**:
```powershell
# 验证安装
ffmpeg -version
ffprobe -version

# 如果失败，重新安装 FFmpeg 并添加到 PATH
```

### 问题 3: 处理速度慢

**原因**: 使用了 `slow` 或 `veryslow` 预设

**解决**: 修改 CONFIG.PRESET 为 `medium` 或 `fast`

### 问题 4: 输出文件太大

**原因**: CRF 值太低或码率太高

**解决**: 调整参数
```javascript
CRF: '23',              // 从 18 改为 23
VIDEO_BITRATE: '4000k', // 从 8000k 改为 4000k
```

### 问题 5: 音乐目录为空

**原因**: music 文件夹中没有支持的音频文件

**解决**:
```powershell
# 检查 music 目录
dir music

# 确保有 .mp3, .wav, .aac, .m4a 或 .flac 文件
```

## 📝 自定义处理参数

编辑 `scripts/batch-video-processor.js` 中的 CONFIG 对象：

```javascript
const CONFIG = {
  // 修改倍速（例如改为 1.5 倍速）
  SPEED_RATE: 1.5,
  
  // 修改锐化强度（例如改为 20%）
  SHARPEN_AMOUNT: 0.2,
  
  // 修改输出质量（平衡质量和文件大小）
  CRF: '23',
  VIDEO_BITRATE: '5000k',
  PRESET: 'medium',
};
```

## 📖 详细文档

更多详细信息请查看：
- [批量视频处理指南](docs/批量视频处理指南.md)
- [脚本说明](scripts/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)
- [FFmpeg 滤镜文档](https://ffmpeg.org/ffmpeg-filters.html)
- [Node.js 官网](https://nodejs.org/)

## ⚠️ 注意事项

1. **版权**: 请确保你有权处理和修改这些视频文件
2. **磁盘空间**: 高质量输出会占用大量磁盘空间
3. **处理时间**: 使用 `slow` 预设时处理速度较慢，请耐心等待
4. **备份**: 建议在处理前备份原始视频文件

## 📞 支持

如遇问题，请：
1. 查看本 README 的故障排除部分
2. 检查 FFmpeg 和 Node.js 是否正确安装
3. 查看终端输出的错误信息
4. 提交 Issue 并附上详细的错误日志

---

🎉 祝你使用愉快！

