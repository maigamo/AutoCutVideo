# 更新日志

所有重要的项目变更都会记录在此文件中。

## [0.3.0] - 2025-11-13

### 新增 - Electron桌面应用基础架构（阶段1-5完成）

#### ✨ 核心功能
- **Electron桌面应用框架**
  - 主进程架构完整（窗口管理、生命周期）
  - 渲染进程架构（Vue 3 + Element Plus + Pinia）
  - Preload安全API暴露
  - IPC双向通信机制

- **数据库系统**
  - SQLite数据库（better-sqlite3）
  - 完整的表结构（批次任务、任务、视频、音频素材）
  - DatabaseService CRUD封装
  - 数据库管理脚本（init/migrate/reset/repair）

- **服务层**
  - ConfigService配置管理（electron-store）
  - EventBus事件总线（主进程⇄渲染进程）
  - Logger日志系统（winston按日轮转）

- **IPC通信模块**
  - database.ipc - 数据库查询和统计
  - file.ipc - 文件对话框、删除、信息获取
  - settings.ipc - 配置读取和保存
  - system.ipc - 系统信息、外部链接
  - window.ipc - 窗口控制
  - download.ipc - 下载功能（占位符）
  - edit.ipc - 剪辑功能（占位符）
  - export.ipc - 导出功能（占位符）

- **UI框架**
  - Vue Router路由系统（4个页面）
  - Pinia状态管理（task/video/settings）
  - Element Plus组件库
  - 响应式侧边栏布局
  - 全局样式系统（SCSS）

#### 📦 项目结构
```
src/
├── main/           # 主进程
│   ├── database/   # 数据库层
│   ├── services/   # 服务层
│   ├── ipc/        # IPC处理器
│   └── utils/      # 工具类
├── preload/        # Preload脚本
└── renderer/       # 渲染进程
    └── src/
        ├── router/     # 路由
        ├── stores/     # 状态管理
        ├── views/      # 页面组件
        └── styles/     # 样式文件
```

#### 🎨 用户界面
- 批量输入页面（占位符）
- 视频管理页面（占位符）
- 导出下载页面（占位符）
- 设置页面（占位符）

#### 🛠️ 开发工具
- `npm run dev` - 开发模式
- `npm run build` - 构建生产版本
- `npm run rebuild` - 重新编译better-sqlite3
- `npm run db:init` - 初始化数据库
- `npm run db:migrate` - 数据库迁移
- `npm run db:reset` - 清空数据库
- `npm run db:repair` - 修复数据库
- `启动项目.ps1` - 一键启动脚本

### 修复
- 🐛 better-sqlite3编译问题（重新编译以匹配Electron Node ABI版本）
- 🐛 数据库初始化脚本（在Electron环境中自动初始化）

### 优化
- ⚡ 代码质量
  - 所有文件≤600行（最大文件155行）
  - ESLint检查通过
  - TypeScript类型完整
  - 代码格式统一

- 🎯 架构设计
  - 模块化设计，职责单一
  - IPC通信规范化
  - 事件驱动架构
  - 配置持久化

### 技术栈
- **前端**: Vue 3.5.12 + Element Plus 2.8.8 + Pinia 2.2.6
- **构建**: Vite 5.4.11 + electron-vite 2.3.0
- **框架**: Electron 32.2.7 (Node.js 18.20.5)
- **数据库**: SQLite (better-sqlite3 11.7.0)
- **日志**: winston 3.17.0
- **配置**: electron-store 10.0.0

### 测试验证
- ✅ Electron应用正常启动
- ✅ 主窗口正确显示（标题：AutoCutVideo - 自动剪辑工具）
- ✅ 数据库正常初始化
- ✅ 侧边栏导航正常
- ✅ 路由切换正常
- ✅ 无运行时错误

### 下一步计划
按照DEVELOPMENT_PHASES2.md实现阶段6-10：
- 阶段6: 下载功能（Playwright自动化下载）
- 阶段7: 剪辑功能（FFmpeg视频处理）
- 阶段8: 导出功能（批量导出、ZIP压缩）
- 阶段9: UI完善（完整页面实现）
- 阶段10: 测试优化（功能测试、性能优化）

---

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

