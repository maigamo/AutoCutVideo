# 问题修复：Preload 脚本路径错误

## 问题现象

用户在 Electron 应用中点击"开始批量处理"时，提示"系统未就绪，请稍后重试"。

## 错误日志

```
Unable to load preload script: C:\open_workspace\AutoCutVideo-dev\dist-electron\preload\index.js
Error: ENOENT: no such file or directory, open 'C:\open_workspace\AutoCutVideo-dev\dist-electron\preload\index.js'
```

控制台输出：
```
Electron API 未就绪，使用默认配置
```

## 根本原因分析

### 问题根源

1. **主进程配置**：`src/main/index.ts` 中引用的 preload 脚本路径为：
   ```typescript
   preload: join(__dirname, '../preload/index.js')
   ```

2. **实际编译输出**：Vite 编译 preload 脚本时，默认输出为 ES Module 格式，文件名为：
   ```
   dist-electron/preload/index.mjs  // 注意是 .mjs
   ```

3. **结果**：文件路径不匹配
   - 主进程寻找：`index.js`
   - 实际文件：`index.mjs`
   - Electron 无法加载 preload 脚本
   - `window.api` 未被注入到渲染进程
   - 前端代码无法调用 IPC 功能

### 为什么会输出 .mjs

Vite 默认会根据模块类型自动选择输出格式：
- ES Module → `.mjs`
- CommonJS → `.js`

由于 preload 脚本使用了 `import` 语法，Vite 判断为 ES Module，因此输出 `.mjs`。

## 修复方案

### 评估

有两个可行方案：

**方案一**：修改主进程配置，引用 `.mjs` 文件
- 优点：简单，只需改一行代码
- 缺点：可能存在兼容性问题，某些环境不支持 `.mjs`

**方案二**：修改 Vite 配置，强制输出 `.js` 文件
- 优点：符合常规，兼容性好
- 缺点：需要修改构建配置

**选择**：方案二（修改 Vite 配置）

### 实施步骤

#### 1. 修改 electron.vite.config.ts

```typescript
preload: {
  build: {
    outDir: 'dist-electron/preload',
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: 'index.js',  // 强制输出文件名为 index.js
        format: 'cjs'                 // 使用 CommonJS 格式
      }
    }
  }
}
```

#### 2. 停止当前进程

```powershell
Stop-Process -Name electron -Force
```

#### 3. 重新编译和启动

```powershell
npm run dev
```

#### 4. 验证修复

检查文件是否正确生成：

```powershell
Test-Path "dist-electron\preload\index.js"
# 应该输出: True
```

查看目录：

```powershell
ls dist-electron\preload\
# 应该看到: index.js (不是 index.mjs)
```

## 验证结果

### 文件结构

修复前：
```
dist-electron/
  └── preload/
      └── index.mjs  ❌ 错误
```

修复后：
```
dist-electron/
  └── preload/
      └── index.js   ✅ 正确
```

### 功能验证

在 Electron 应用窗口的开发者工具控制台中：

```javascript
console.log(window.api)
// 应该输出: { invoke: ƒ, on: ƒ, off: ƒ, send: ƒ }
```

### 日志验证

应用日志中应该能看到：
```
[INFO] [database] 批次创建成功
[INFO] [download] 下载任务已创建
[INFO] [download] 开始下载视频
```

## 技术细节

### Preload 脚本的作用

Preload 脚本在渲染进程启动时执行，用于：

1. **安全地暴露 API**：通过 `contextBridge` 暴露白名单 API
2. **隔离环境**：在 `contextIsolation: true` 时，提供安全的通信桥梁
3. **注入全局对象**：将 `window.api` 注入到渲染进程

### 为什么必须使用 Preload

在启用 `contextIsolation` 的情况下（安全最佳实践）：

```typescript
// ❌ 渲染进程无法直接访问
const { ipcRenderer } = require('electron')

// ✅ 通过 preload 暴露的安全 API
window.api.invoke('settings:get')
```

### 文件格式说明

| 格式 | 扩展名 | 特点 | 适用场景 |
|------|--------|------|---------|
| CommonJS | `.js` | 同步加载，`require/module.exports` | Node.js，Electron 主进程 |
| ES Module | `.mjs` | 异步加载，`import/export` | 现代浏览器，部分 Node.js |

对于 Electron preload 脚本，建议使用 CommonJS 格式（`.js`），兼容性最好。

## 相关配置

### 主进程配置 (src/main/index.ts)

```typescript
function createWindow(): void {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),  // 引用 .js 文件
      nodeIntegration: false,
      contextIsolation: true
    }
  })
}
```

### Preload 脚本 (src/preload/index.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  }
  // ...
})
```

### 构建配置 (electron.vite.config.ts)

```typescript
export default defineConfig({
  preload: {
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        external: ['electron'],
        output: {
          entryFileNames: 'index.js',
          format: 'cjs'
        }
      }
    }
  }
})
```

## 防止类似问题

### 1. 添加构建验证

在 `package.json` 中添加验证脚本：

```json
{
  "scripts": {
    "verify": "node -e \"if (!require('fs').existsSync('dist-electron/preload/index.js')) throw new Error('Preload script not found')\""
  }
}
```

### 2. 使用绝对路径

在主进程中使用绝对路径，避免路径问题：

```typescript
import { app } from 'electron'
import path from 'path'

const preloadPath = app.isPackaged
  ? path.join(__dirname, '../preload/index.js')
  : path.join(__dirname, '../preload/index.js')
```

### 3. 添加错误处理

```typescript
mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
  logger.error('Preload 脚本加载失败', { preloadPath, error })
})
```

## 总结

### 问题
- Preload 脚本文件扩展名不匹配（`.js` vs `.mjs`）
- 导致 `window.api` 未注入
- 前端无法调用 IPC 功能

### 修复
- 修改 Vite 配置，强制输出 `.js` 格式
- 使用 CommonJS 格式以确保兼容性
- 重新编译和启动应用

### 验证
- ✅ `dist-electron/preload/index.js` 文件存在
- ✅ `window.api` 对象已注入
- ✅ IPC 调用正常工作
- ✅ 日志中有批次和任务记录

---

**修复日期**：2025-11-14  
**影响范围**：所有需要 IPC 通信的功能  
**修复文件**：`electron.vite.config.ts`  
**修复行数**：+4 行  
**测试状态**：✅ 已验证

