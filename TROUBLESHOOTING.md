# AutoCutVideo 故障排除指南

## 🔧 常见问题及解决方案

### 问题1: ERR_DLOPEN_FAILED - better-sqlite3 编译错误

#### 错误信息
```
Error: The module '...\better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 128. This version of Node.js requires
NODE_MODULE_VERSION 108.
```

#### 原因
`better-sqlite3` 是原生C++模块，需要针对当前Node.js版本重新编译。

#### 解决方案

**方法1: 使用修复脚本（推荐）**
```powershell
# 执行修复脚本（自动处理编码+编译+启动）
.\fix-and-run.ps1
```

**方法2: 手动执行**
```powershell
# 1. 设置UTF-8编码（解决中文乱码）
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001

# 2. 重新编译 better-sqlite3
npm rebuild better-sqlite3

# 3. 初始化数据库（首次运行）
npm run db:init

# 4. 启动开发服务器
npm run dev
```

**方法3: 完全重新安装**
```powershell
# 删除 node_modules 和重新安装
Remove-Item -Recurse -Force node_modules
npm install
```

#### 如果仍然失败

可能缺少C++编译工具，需要安装：

```powershell
# 以管理员身份运行PowerShell
npm install --global windows-build-tools

# 或者手动安装 Visual Studio Build Tools
# 下载地址: https://visualstudio.microsoft.com/downloads/
# 选择 "Desktop development with C++"
```

---

### 问题2: 中文乱码

#### 错误信息
```
[ERROR] [main] 搴旂敤鍚姩澶辫触
[INFO] [main] 鏁版嵁搴撹繛鎺ュ凡鍏抽棴
```

#### 原因
PowerShell 默认使用 GBK 编码，而日志输出使用 UTF-8。

#### 解决方案

**临时方案（当前会话）**
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001
```

**永久方案（修改PowerShell配置）**
```powershell
# 编辑 PowerShell 配置文件
notepad $PROFILE

# 添加以下内容：
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

**使用修复脚本（推荐）**
```powershell
.\fix-and-run.ps1  # 脚本会自动设置编码
```

---

### 问题3: 端口10031被占用

#### 错误信息
```
Error: listen EADDRINUSE: address already in use :::10031
```

#### 解决方案

**查找占用进程**
```powershell
netstat -ano | findstr :10031
```

**结束占用进程**
```powershell
# 假设进程ID为 12345
Stop-Process -Id 12345 -Force
```

**或修改端口**

编辑 `electron.vite.config.ts`，将端口改为其他值：
```typescript
server: {
  port: 10032,  // 改成其他端口
  strictPort: true,
  host: '0.0.0.0'
}
```

---

### 问题4: 缺少依赖

#### 错误信息
```
Error: Cannot find module 'vue-router'
Error: Cannot find module '@element-plus/icons-vue'
```

#### 解决方案
```powershell
npm install
```

如果特定依赖缺失：
```powershell
npm install vue-router@4.4.5 @element-plus/icons-vue@2.3.1
```

---

### 问题5: 数据库文件损坏

#### 错误信息
```
database disk image is malformed
```

#### 解决方案

**重置数据库**
```powershell
npm run db:reset  # 清空数据
npm run db:init   # 重新初始化
```

**或者删除数据库文件**
```powershell
Remove-Item data\app.db -Force
npm run db:init
```

---

## 🚀 快速启动指南

### 首次启动

```powershell
# 1. 安装依赖
npm install

# 2. 执行修复脚本（自动处理所有问题）
.\fix-and-run.ps1
```

### 日常开发

```powershell
# 方式1: 使用修复脚本（推荐）
.\fix-and-run.ps1

# 方式2: 直接启动（如果环境已配置好）
npm run dev
```

---

## 📋 环境检查清单

运行前请确认：

- [x] Node.js 版本为 18.20.5
  ```powershell
  node --version  # 应显示 v18.20.5
  ```

- [x] 已安装所有依赖
  ```powershell
  npm install
  ```

- [x] better-sqlite3 已编译
  ```powershell
  npm rebuild better-sqlite3
  ```

- [x] 数据库已初始化
  ```powershell
  npm run db:init
  ```

- [x] 端口10031未被占用
  ```powershell
  netstat -ano | findstr :10031  # 应该没有输出
  ```

---

## 🔍 调试技巧

### 查看详细日志

日志文件位置：
- Windows: `%APPDATA%\autocutvideo-electron\logs\`
- 包含两种日志：
  - `app-YYYY-MM-DD.log` - 所有日志
  - `error-YYYY-MM-DD.log` - 仅错误日志

### 清理构建缓存

```powershell
# 清理所有构建产物
Remove-Item -Recurse -Force dist-electron, out, .vite

# 重新构建
npm run dev
```

### 重置所有配置

```powershell
# 清理用户数据目录
Remove-Item -Recurse -Force $env:APPDATA\autocutvideo-electron

# 重新初始化
npm run db:init
npm run dev
```

---

## 📞 获取帮助

如果以上方案都无法解决问题，请：

1. 查看日志文件获取详细错误信息
2. 检查 Node.js 版本是否为 18.20.5
3. 确认已安装 Windows Build Tools
4. 提供完整的错误堆栈信息

---

**文档维护**: AutoCutVideo 开发团队  
**最后更新**: 2025-11-13  
**版本**: v1.0.0

