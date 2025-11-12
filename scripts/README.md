# OpenCut 脚本工具

本目录包含 OpenCut 项目的自动化脚本工具。

---

## 📂 脚本列表

### 1. batch-video-processor.js

**批量视频自动化处理脚本**

**功能**：
- 批量处理视频文件
- 1.2 倍速 + 左右翻转 + 锐化
- 自动添加随机背景音乐
- 高质量导出

**使用方法**：

```bash
# 方法 1：直接运行
node scripts/batch-video-processor.js <输入目录> <输出目录> <音乐目录>

# 方法 2：使用 npm 脚本
npm run batch-process -- <输入目录> <输出目录> <音乐目录>
```

**示例**：

```bash
# 创建测试目录结构
mkdir -p videos/input videos/output music

# 放入视频和音乐文件，然后运行
node scripts/batch-video-processor.js videos/input videos/output music
```

**详细文档**：[批量视频处理指南](../docs/批量视频处理指南.md)

---

## 🔧 前置要求

### 必需软件

1. **Node.js** 22.0+
2. **FFmpeg** 和 **FFprobe**

### 安装 FFmpeg

#### Windows
```powershell
# 使用 Chocolatey
choco install ffmpeg

# 或使用 Scoop
scoop install ffmpeg
```

#### Mac
```bash
brew install ffmpeg
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

### 验证安装

```bash
ffmpeg -version
ffprobe -version
node --version
```

---

## 📖 快速开始

### 1. 准备文件结构

```
OpenCut/
├── videos/
│   ├── input/       # 待处理视频
│   └── output/      # 输出目录
└── music/           # 背景音乐库
```

### 2. 添加文件

- 将待处理视频放入 `videos/input/`
- 将背景音乐放入 `music/`

### 3. 运行脚本

```bash
node scripts/batch-video-processor.js videos/input videos/output music
```

### 4. 查看结果

处理完成的视频会保存在 `videos/output/` 目录，命名格式：

```
原文件名_2025-11-09T14-30-25.mp4
```

---

## ⚙️ 配置选项

### 修改处理参数

编辑 `batch-video-processor.js` 中的 `CONFIG` 对象：

```javascript
const CONFIG = {
  SPEED_RATE: 1.2,        // 倍速（1.2 = 1.2倍速）
  SHARPEN_AMOUNT: 0.1,    // 锐化强度（0.1 = 10%）
  CRF: '18',              // 质量（18 = 高质量，23 = 默认）
  VIDEO_BITRATE: '8000k', // 视频码率
  AUDIO_BITRATE: '192k',  // 音频码率
  PRESET: 'slow',         // 编码速度（slow/medium/fast）
};
```

---

## 🎨 自定义特效

### 添加更多滤镜

在 `filter_complex` 参数中添加 FFmpeg 滤镜：

```javascript
'-filter_complex', [
  `[0:v]setpts=PTS/${CONFIG.SPEED_RATE}`,
  'hflip',
  `unsharp=5:5:${CONFIG.SHARPEN_AMOUNT}:5:5:0`,
  
  // 添加自定义特效
  'eq=contrast=1.1',              // 对比度 +10%
  'hue=s=1.2',                    // 饱和度 +20%
  'fade=t=in:st=0:d=1',           // 淡入 1 秒
].join(',') + '[v]',
```

### 常用滤镜速查

```javascript
// 颜色调整
'eq=contrast=1.1'                    // 对比度
'eq=brightness=0.1'                  // 亮度
'hue=s=1.2'                          // 饱和度

// 特效
'unsharp=5:5:1.0:5:5:0'             // 锐化
'boxblur=2:1'                        // 模糊
'noise=alls=20:allf=t'               // 噪点

// 变换
'vflip'                              // 垂直翻转
'rotate=PI/4'                        // 旋转
'scale=1920:1080'                    // 缩放

// 淡入淡出
'fade=t=in:st=0:d=1'                // 淡入
'fade=t=out:st=9:d=1'               // 淡出
```

---

## 🚀 性能优化

### 使用硬件加速

#### NVIDIA GPU
```javascript
VIDEO_CODEC: 'h264_nvenc',
PRESET: 'p4',
```

#### Intel Quick Sync
```javascript
VIDEO_CODEC: 'h264_qsv',
```

#### Apple M1/M2
```javascript
VIDEO_CODEC: 'h264_videotoolbox',
```

### 并行处理

处理大量文件时，可以修改脚本支持并行处理（需要足够的系统资源）。

---

## 🐛 故障排查

### 常见问题

1. **找不到 FFmpeg**
   - 确认已安装：`ffmpeg -version`
   - 确认在系统 PATH 中

2. **处理速度慢**
   - 修改 `PRESET: 'medium'` 或 `'fast'`
   - 使用硬件加速

3. **输出文件太大**
   - 提高 `CRF` 值（如 `'23'` 或 `'28'`）
   - 降低 `VIDEO_BITRATE`

4. **音频不同步**
   - 检查音乐文件格式
   - 使用 MP3 格式的音乐

---

## 📚 相关文档

- [批量视频处理指南](../docs/批量视频处理指南.md) - 完整使用手册
- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)
- [FFmpeg 滤镜手册](https://ffmpeg.org/ffmpeg-filters.html)

---

## 🤝 贡献

欢迎提交新的脚本工具！

**规范**：
- 使用 Node.js 编写
- 添加详细的注释
- 提供使用示例
- 更新本 README

---

**最后更新**: 2025-11-09

