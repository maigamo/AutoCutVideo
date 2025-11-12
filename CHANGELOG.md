# 更新日志

所有重要的项目变更都会记录在此文件中。

## [1.0.0] - 2025-11-09

### 新增
- ✨ 完整的批量视频处理功能
  - 1.2倍速处理
  - 左右镜像翻转
  - 10% 智能锐化
  - 背景音乐随机替换
  - 高质量视频导出 (H.264, CRF 18)
  
- 📦 项目结构完善
  - `package.json` 配置文件（启用 ES Module）
  - 完整的 README.md 使用文档
  - INSTALL.md 安装指南
  - .gitignore 配置

- 🛠️ 实用工具脚本
  - `check-environment.js` - 环境检查工具
  - `batch-video-processor.js` - 批量处理主脚本
  - `config.example.js` - 配置文件示例
  - `example-usage.ps1` - PowerShell 示例脚本
  - `example-usage.sh` - Bash 示例脚本

- 📖 详细文档
  - [批量视频处理指南.md](docs/批量视频处理指南.md)
  - [脚本 README](scripts/README.md)

### 修复
- 🐛 修复 ES Module 导入错误
  - 在 package.json 中添加 `"type": "module"`
  - 解决 "Cannot use import statement outside a module" 错误

### 优化
- ⚡ FFmpeg 参数优化
  - 使用 faststart 优化网络播放
  - 采用 slow 预设提高压缩效率
  - CRF 18 保证高画质

- 🎯 代码质量提升
  - 完善错误处理机制
  - 添加详细的进度显示
  - 实时显示处理状态

### 技术细节
- Node.js >= 18.0.0 要求
- ES Module 语法支持
- 支持 Windows/macOS/Linux 跨平台
- FFmpeg 依赖自动检测

---

## 版本说明

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

## 计划功能

### [1.1.0] - 计划中
- [ ] GUI 图形界面
- [ ] 进度条优化
- [ ] 批量配置文件支持
- [ ] 视频预览功能
- [ ] 更多滤镜选项

### [1.2.0] - 规划中
- [ ] 云端处理支持
- [ ] 多语言界面
- [ ] 插件系统
- [ ] 自定义滤镜链
- [ ] 批量水印添加

### 未来功能
- [ ] AI 自动剪辑
- [ ] 智能场景检测
- [ ] 自动字幕生成
- [ ] 视频质量分析
- [ ] 批量压缩优化

---

## 贡献

欢迎提交 Issue 和 Pull Request！

如果你有好的想法或发现了 bug，请：
1. 在 Issues 中提出
2. Fork 项目并创建分支
3. 提交 Pull Request

---

**感谢使用 AutoCutVideo！** 🎉

