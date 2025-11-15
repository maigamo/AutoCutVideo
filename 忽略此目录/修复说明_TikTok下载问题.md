# TikTok/抖音下载功能修复说明

## 修复日期
2025-11-14

## 问题分析

### 错误日志
```
page.goto: net::ERR_CONNECTION_CLOSED at https://ssstik.li/
```

### 错误原因分析

1. **网络连接被拒绝**
   - `ERR_CONNECTION_CLOSED` 表示连接被服务器主动关闭
   - 可能原因：反爬虫检测、自动化标识被识别

2. **自动化浏览器特征**
   - Playwright默认会设置 `navigator.webdriver = true`
   - 网站可以通过检测这个标识来阻止自动化访问
   - headless模式虽然已设置为false，但仍需要更多反检测措施

3. **页面加载策略问题**
   - 默认等待 `load` 事件可能超时
   - 某些资源加载慢会导致整个页面加载失败

## 修复方案

### 1. 浏览器启动参数优化

```typescript
this.browser = await chromium.launch({
  headless: false, // ✓ 可视化模式
  downloadsPath: configService.getActualPath('downloadDir'),
  args: [
    '--disable-blink-features=AutomationControlled', // 禁用自动化控制标识
    '--disable-dev-shm-usage', // 解决共享内存问题
    '--no-sandbox', // 禁用沙箱模式
    '--disable-setuid-sandbox',
    '--disable-web-security', // 禁用web安全策略
    '--disable-features=IsolateOrigins,site-per-process'
  ]
})
```

**作用**：
- 移除浏览器的自动化特征标识
- 提高兼容性和稳定性
- 绕过某些安全限制

### 2. 浏览器上下文配置

```typescript
const context = await this.browser!.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  viewport: { width: 1920, height: 1080 },
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai'
})
```

**作用**：
- 使用真实的浏览器User-Agent
- 设置中国地区和时区，更符合访问特征
- 标准分辨率，避免异常检测

### 3. 移除WebDriver标识

```typescript
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false
  })
})
```

**作用**：
- 覆盖 `navigator.webdriver` 属性
- 让网站无法检测到这是自动化浏览器

### 4. 页面加载策略调整

```typescript
await page.goto(downloadUrl, {
  waitUntil: 'domcontentloaded', // 只等待DOM加载完成
  timeout: 60000 // 超时时间60秒
})
```

**作用**：
- `domcontentloaded` 比 `load` 更快，不等待所有资源加载
- 增加超时时间，避免网络慢导致失败

### 5. 重试机制

```typescript
try {
  await page.goto(downloadUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
} catch (gotoError) {
  // 重试一次
  await page.waitForTimeout(3000)
  await page.goto(downloadUrl, { waitUntil: 'networkidle', timeout: 60000 })
}
```

**作用**：
- 首次失败后等待3秒重试
- 第二次使用 `networkidle` 策略，等待网络空闲

### 6. 增强的调试功能

当找不到下载链接时：
- 记录页面标题和内容长度
- 自动保存页面截图到 `debug_{taskId}.png`
- 在日志中记录详细信息

```typescript
const screenshotPath = path.join(path.dirname(task.savePath), `debug_${task.id}.png`)
await page.screenshot({ path: screenshotPath, fullPage: true })
```

## 修改文件

- **文件路径**：`src/main/workers/DownloadWorker.ts`
- **修改行数**：497行（符合<600行要求）
- **修改方法**：
  - `initialize()` - 添加浏览器启动参数
  - `downloadFromDouyin()` - 完全重写，添加反检测和重试机制

## 测试建议

1. **启动项目**
   ```powershell
   npm run dev
   ```

2. **测试TikTok链接**
   - 在应用中添加测试链接：`https://vt.tiktok.com/ZSy8X6uoB/`
   - 观察浏览器窗口（现在是可视化的）
   - 检查是否能正常加载页面

3. **查看日志**
   ```powershell
   Get-Content .\logs\download-2025-11-14.log -Tail 50 -Wait -Encoding UTF8
   ```

4. **检查下载文件**
   - 查看下载目录是否有生成的文件
   - 文件名格式：`TT_YYYYMMDD_HHMMSS.mp4`

5. **如果仍然失败**
   - 检查 `debug_*.png` 截图文件
   - 查看截图中页面显示的内容
   - 可能需要手动在浏览器中测试 ssstik.li 是否可访问

## 可能的后续问题

### 如果网络无法访问 ssstik.li

**解决方案1：使用代理**
```typescript
const context = await this.browser!.newContext({
  proxy: {
    server: 'http://your-proxy:port'
  }
})
```

**解决方案2：更换下载服务**
- 使用国内可访问的服务
- 或使用其他TikTok下载API

### 如果需要更完整的反检测

可以添加更多指纹伪装：
```typescript
await page.addInitScript(() => {
  // 伪装Chrome插件
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5]
  })
  
  // 伪装语言
  Object.defineProperty(navigator, 'languages', {
    get: () => ['zh-CN', 'zh', 'en']
  })
})
```

## 总结

通过以上修复：
1. ✓ 浏览器设置为可视化模式（headless: false）
2. ✓ 添加完整的反检测机制
3. ✓ 优化页面加载策略
4. ✓ 添加重试机制
5. ✓ 增强调试功能（截图、详细日志）
6. ✓ 文件自动命名（TT_日期时间.mp4）
7. ✓ 代码行数符合规范（497行 < 600行）

现在可以启动项目进行测试！

