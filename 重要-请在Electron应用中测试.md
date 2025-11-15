# ⚠️ 重要：请在 Electron 应用中测试

## 问题原因

您遇到的错误 `Cannot read properties of undefined (reading 'invoke')` 是因为在**浏览器**中访问了应用，而不是在 **Electron 应用窗口**中。

## 正确的测试方法

### 第一步：停止所有进程

```powershell
Stop-Process -Name electron -Force
```

### 第二步：启动 Electron 应用

```powershell
.\启动项目.ps1
```

**等待几秒钟**，会弹出一个应用窗口（不是浏览器标签页）。

### 第三步：在应用窗口中测试

在**弹出的应用窗口**（不是浏览器）中：

1. 点击左侧菜单"批量输入"
2. 输入 TikTok 链接：`https://vt.tiktok.com/ZSy8X6uoB/`
3. 点击"开始批量处理"按钮

### 第四步：验证

按 F12 打开开发者工具，在 Console 中输入：

```javascript
console.log(window.api)
```

**正确结果**：
```javascript
{ invoke: ƒ, on: ƒ, off: ƒ, send: ƒ }
```

**错误结果**：
```javascript
undefined
```

如果是 `undefined`，说明您仍然在浏览器中，而不是 Electron 应用。

## 如何区分 Electron 应用和浏览器

### Electron 应用窗口的特征

✅ **窗口标题栏**显示应用名称
✅ **窗口大小**是固定的（1200x800）
✅ **没有浏览器地址栏**
✅ **开发者工具**在窗口内部
✅ **控制台中** `window.api` 是对象

### 浏览器窗口的特征

❌ **有浏览器地址栏**（显示 http://localhost:10031）
❌ **可以看到浏览器的书签栏**
❌ **窗口标题**显示"localhost:10031"
❌ **控制台中** `window.api` 是 undefined

## 常见问题

### Q: 为什么会打开浏览器？

A: 如果您手动在浏览器中输入了 `http://localhost:10031`，那就会在浏览器中打开。正确的方法是运行 `.\启动项目.ps1` 脚本。

### Q: 启动脚本后同时打开了应用和浏览器？

A: 关闭浏览器标签页，只使用 Electron 应用窗口。

### Q: 如何确认我在 Electron 应用中？

A: 
1. 看窗口是否有地址栏（有 = 浏览器，没有 = Electron）
2. 按 F12 打开控制台，输入 `console.log(window.api)`
3. 如果输出对象，就是 Electron 应用

## 完整测试流程

```powershell
# 1. 停止所有 Electron 进程
Stop-Process -Name electron -Force

# 2. 等待 2 秒
Start-Sleep -Seconds 2

# 3. 启动 Electron 应用
.\启动项目.ps1

# 4. 等待应用窗口弹出（大约 5-10 秒）
```

然后在**弹出的应用窗口**（不是浏览器）中：

1. ✅ 打开"批量输入"页面
2. ✅ 应该看到"已加载预设配置"的提示
3. ✅ 输入视频链接
4. ✅ 点击"开始批量处理"
5. ✅ 查看提示信息和日志

## 预期结果

### 成功的情况

**界面提示**：
```
✓ 已加载预设配置
✓ 成功启动 1 个下载任务
```

**日志记录**（`logs/app-2025-11-14.log`）：
```
[INFO] [database] 批次创建成功
[INFO] [download] 下载任务已创建
[INFO] [download] 开始下载视频
```

### 失败的情况

**错误提示**：
```
✗ 批量处理失败: Cannot read properties of undefined (reading 'invoke')
```

**原因**：您在浏览器中测试，而不是 Electron 应用。

**解决**：关闭浏览器，重新运行 `.\启动项目.ps1`，使用弹出的应用窗口。

## 架构说明图

```
❌ 错误方式：
Chrome/Edge 浏览器
  ↓
访问 http://localhost:10031
  ↓
没有 window.api（因为不是 Electron 环境）
  ↓
报错：Cannot read properties of undefined


✅ 正确方式：
运行 .\启动项目.ps1
  ↓
Electron 应用窗口弹出
  ↓
Preload 脚本注入 window.api
  ↓
可以正常调用 IPC 功能
  ↓
下载任务正常执行
```

## 截图说明

### ❌ 错误：在浏览器中
- 可以看到地址栏
- URL 显示：http://localhost:10031
- 标题显示：localhost:10031 - Google Chrome
- `window.api` 是 undefined

### ✅ 正确：在 Electron 应用中
- 没有地址栏
- 窗口标题：AutoCutVideo
- 开发者工具在应用窗口内
- `window.api` 是对象 `{ invoke: ƒ, ... }`

## 验证清单

请确认以下所有项目：

- [ ] 运行了 `.\启动项目.ps1` 脚本
- [ ] 等待了应用窗口弹出（不是浏览器标签）
- [ ] 窗口**没有地址栏**
- [ ] 按 F12，控制台中 `window.api` 不是 undefined
- [ ] 看到"已加载预设配置"的成功提示
- [ ] 输入链接后点击"开始批量处理"
- [ ] 查看 logs/app-2025-11-14.log 有批次和任务的日志

## 需要帮助？

如果按照以上步骤操作后仍然出错，请提供：

1. **截图**：显示窗口标题栏和地址栏（如果有）
2. **控制台输出**：`console.log(window.api)` 的结果
3. **日志内容**：`logs/app-2025-11-14.log` 的最后 50 行
4. **错误信息**：完整的错误堆栈

---

**关键提醒**：
- 🚫 **不要**在浏览器中打开 http://localhost:10031
- ✅ **一定要**运行 `.\启动项目.ps1` 并使用弹出的应用窗口
- ✅ **确保**窗口没有地址栏

**最后更新**: 2025-11-14

