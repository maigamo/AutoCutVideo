# 问题分析：window.api 未定义

## 错误信息

```
Cannot read properties of undefined (reading 'invoke')
```

## 根本原因

### 问题一：在浏览器中直接访问

如果您在浏览器中直接打开 `http://localhost:10031`，会遇到此错误，因为：

1. **Electron 的 contextBridge** 只在 Electron 应用环境中生效
2. **浏览器环境**无法访问 Electron 的 preload 脚本
3. `window.api` 只会在 Electron 的渲染进程中被注入

### 问题二：Preload 脚本未正确加载

在 Electron 应用中，如果 preload 脚本路径不正确或未正确编译，也会导致此问题。

## 已实施的修复

### 1. 添加防御性检查

在 `BatchInput.vue` 中添加了 API 可用性检查：

```typescript
const loadPreset = async () => {
  try {
    // 检查 API 是否可用
    if (!window.api) {
      console.warn('Electron API 未就绪，使用默认配置')
      return
    }
    
    const result = await window.api.invoke('settings:get')
    // ...
  } catch (error) {
    console.error('加载预设配置失败:', error)
    ElMessage.warning('加载预设配置失败，使用默认配置')
  }
}

const startProcess = async () => {
  // 检查 API 是否可用
  if (!window.api) {
    ElMessage.error('系统未就绪，请稍后重试')
    return
  }
  // ...
}
```

### 2. 验证 Preload 脚本

确认 `src/preload/index.ts` 正确配置：

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  },
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  }
})
```

### 3. 确认主进程配置

在 `src/main/index.ts` 中确认 preload 脚本正确引用：

```typescript
function createWindow(): void {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
}
```

## 测试步骤

### 步骤 1: 停止所有进程

```powershell
Stop-Process -Name electron -Force
```

### 步骤 2: 重新启动应用

```powershell
.\启动项目.ps1
```

### 步骤 3: 在 Electron 窗口中测试

**重要**: 必须在 Electron 应用窗口中测试，而不是浏览器！

1. 等待应用完全启动（看到主界面）
2. 按 F12 打开开发者工具
3. 在 Console 中检查：

```javascript
console.log(window.api)
// 应该输出: { invoke: ƒ, on: ƒ, off: ƒ, send: ƒ }
```

4. 输入 TikTok 链接并点击"开始批量处理"

### 步骤 4: 查看日志

```powershell
# 查看应用日志
Get-Content logs\app-2025-11-14.log -Wait -Tail 50

# 查看下载日志
Get-Content logs\download-2025-11-14.log -Wait -Tail 50
```

## 预期结果

### 成功的表现

1. **控制台输出**：
   ```
   开始处理视频链接: ['https://vt.tiktok.com/ZSy8X6uoB/']
   ```

2. **日志记录**（`logs/app-2025-11-14.log`）：
   ```
   [INFO] [database] 批次创建成功
   [INFO] [download] 下载任务已创建
   [INFO] [download] 开始下载视频
   ```

3. **用户界面**：
   - 显示"成功启动 1 个下载任务"
   - 输入框自动清空

### 失败的表现

1. **仍然报错 `window.api is undefined`**
   - 说明您在浏览器中访问，而不是 Electron 应用
   - 解决：关闭浏览器窗口，使用 Electron 应用窗口

2. **报错 `系统未就绪`**
   - Preload 脚本未加载
   - 解决：重新编译并启动项目

## 环境验证清单

- [ ] 使用 Electron 应用窗口（不是浏览器）
- [ ] 项目已完全重新启动
- [ ] 开发者工具中 `window.api` 不是 undefined
- [ ] 日志文件中有 IPC 处理器注册的记录
- [ ] 没有编译错误或警告

## 常见错误场景

### 场景 1: 在浏览器中测试

❌ **错误做法**：
```
在 Chrome/Edge 浏览器中打开 http://localhost:10031
```

✅ **正确做法**：
```powershell
# 运行启动脚本
.\启动项目.ps1

# 在弹出的 Electron 窗口中操作
```

### 场景 2: 代码未重新编译

❌ **错误做法**：
```
修改代码后直接刷新页面
```

✅ **正确做法**：
```powershell
# 主进程和 preload 代码修改后需要重启
Stop-Process -Name electron -Force
.\启动项目.ps1
```

### 场景 3: 端口被占用

如果看到错误 `Port 10031 is already in use`：

```powershell
# 查找占用端口的进程
netstat -ano | findstr :10031

# 结束该进程（替换 PID）
taskkill /PID <PID> /F
```

## 调试命令

```powershell
# 1. 查看 Electron 进程
Get-Process | Where-Object {$_.ProcessName -like "*electron*"}

# 2. 停止所有 Electron 进程
Stop-Process -Name electron -Force

# 3. 查看最新日志（实时）
Get-Content logs\app-2025-11-14.log -Wait -Tail 50

# 4. 查看完整日志
Get-Content logs\app-2025-11-14.log

# 5. 检查端口占用
netstat -ano | findstr :10031
```

## 总结

**核心要点**：
1. 必须在 Electron 应用中测试，不能在浏览器中
2. 代码已添加防御性检查，会提示"系统未就绪"
3. 修改主进程或 preload 代码后必须重启应用
4. 查看日志确认功能是否正常执行

---

**最后更新**: 2025-11-14  
**状态**: 已修复并添加防御性检查

