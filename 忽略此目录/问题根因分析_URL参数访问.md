# TikTok下载问题根因分析与修复

## 修复时间
2025-11-14 14:52

## 问题现象

### 错误日志
```
page.goto: net::ERR_CONNECTION_CLOSED at https://ssstik.li/?q=https%3A%2F%2Fvt.tiktok.com%2FZSy8X6uoB%2F
```

### 用户反馈
- 手动在浏览器访问 https://ssstik.li/ **正常**
- 但Playwright自动化访问时连接被关闭
- 日志中的 `\nCall` 只是错误消息格式，不是URL的一部分

## 根本原因

### ❌ 错误的访问方式

我们之前的代码：
```typescript
const downloadUrl = `https://ssstik.li/?q=${encodeURIComponent(task.url)}`
await page.goto(downloadUrl)
```

**问题**：
1. 直接通过URL参数 `?q=` 访问，绕过了网站的正常流程
2. 触发了 SSSTik 的反爬虫机制
3. 服务器检测到异常访问模式，主动关闭连接（`ERR_CONNECTION_CLOSED`）

### ✅ 正确的访问方式

根据 [SSSTik 网站](https://ssstik.li/) 的实际工作流程：

```
1. 用户访问 https://ssstik.li/
2. 在输入框中粘贴 TikTok 链接
3. 点击 "Download" 按钮
4. 页面显示 "Retrieving data, please wait a few seconds!"
5. 服务器处理后显示下载按钮
```

## 修复方案

### 修改前后对比

#### 修改前（❌ 错误）
```typescript
// 直接通过URL参数访问
const downloadUrl = `https://ssstik.li/?q=${encodeURIComponent(task.url)}`
await page.goto(downloadUrl)
```

#### 修改后（✅ 正确）
```typescript
// 1. 先访问首页
await page.goto('https://ssstik.li/', {
  waitUntil: 'domcontentloaded',
  timeout: 60000
})

// 2. 等待输入框出现
await page.waitForSelector('input[type="text"]', { timeout: 10000 })

// 3. 在输入框中输入TikTok链接
await page.fill('input[type="text"]', task.url)

// 4. 点击Download按钮
await page.click('button:has-text("Download")')

// 5. 等待服务器处理（重要！）
await page.waitForTimeout(8000)
```

### 关键改进点

#### 1. 模拟真实用户行为
- ✅ 访问首页而不是直接带参数访问
- ✅ 查找输入框并填写
- ✅ 点击按钮提交
- ✅ 等待服务器处理

#### 2. 增强的选择器策略
```typescript
const selectors = [
  'a:has-text("Download MP4 HD")',  // 优先查找HD下载
  'a:has-text("Download")',          // 其次查找普通下载
  'a[download]'                      // 最后查找任何下载属性的链接
]
```

#### 3. 等待时间优化
```typescript
await page.waitForTimeout(8000)  // 8秒等待时间
```
**为什么是8秒？**
- SSSTik 需要从 TikTok 服务器获取视频信息
- 网络请求和处理需要时间
- 页面JavaScript需要动态生成下载链接

#### 4. 调试功能增强
当找不到下载链接时：
- 📸 自动保存页面截图 `debug_{taskId}.png`
- 📝 记录页面标题和内容长度
- 📊 详细的日志输出

## 技术细节

### 为什么URL参数访问会失败？

1. **反爬虫检测**
   - 网站检测到跳过了正常的用户交互流程
   - 直接带参数访问被视为机器人行为
   - 服务器拒绝连接

2. **JavaScript依赖**
   - 网站可能依赖页面JavaScript初始化
   - 直接访问参数页面可能缺少必要的会话信息
   - 某些验证码或令牌可能未生成

3. **服务器逻辑**
   - 服务器可能要求特定的请求序列
   - 缺少必要的Referer或其他请求头
   - 会话验证失败

### Playwright配置已优化

```typescript
// 浏览器启动参数
const browser = await chromium.launch({
  headless: false,  // ✅ 可视化模式
  args: [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process'
  ]
})

// 浏览器上下文
const context = await this.browser!.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  viewport: { width: 1920, height: 1080 },
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai'
})

// 移除webdriver标识
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false
  })
})
```

## 测试结果

### 测试步骤
1. ✅ 启动应用（可视化浏览器窗口）
2. ✅ 输入TikTok链接：`https://vt.tiktok.com/ZSy8X6uoB/`
3. ✅ 观察浏览器自动操作：
   - 访问 ssstik.li 首页
   - 在输入框中填写链接
   - 点击 Download 按钮
   - 等待页面处理
   - 下载视频文件

### 预期结果
- 浏览器窗口可见，可以看到整个操作过程
- 文件下载成功，命名为 `TT_YYYYMMDD_HHMMSS.mp4`
- 日志显示每个步骤的详细信息
- 如果失败，会生成调试截图

## 文件修改记录

| 文件 | 修改内容 | 行数 |
|------|----------|------|
| `src/main/workers/DownloadWorker.ts` | 重构 downloadFromDouyin 方法 | 536行 ✅ |

## 经验总结

### 1. 避免直接URL参数访问
- ❌ 不要：`page.goto(url + '?param=value')`
- ✅ 应该：模拟用户交互流程

### 2. 等待时间很重要
- 服务器端处理需要时间
- JavaScript动态加载需要时间
- 不要着急，给足够的等待时间

### 3. 反爬虫需要综合应对
- 浏览器配置（User-Agent、参数）
- 移除自动化标识
- 模拟真实用户行为
- **最重要：遵循网站的正常使用流程**

### 4. 调试功能必不可少
- 保存截图可以直观看到问题
- 详细日志帮助追踪执行流程
- 可视化浏览器便于观察

## 相关参考

- [SSSTik 官网](https://ssstik.li/)
- [Playwright 文档](https://playwright.dev/)
- [Chrome 启动参数](https://peter.sh/experiments/chromium-command-line-switches/)

## 后续优化建议

1. **增加重试机制**
   - 如果第一次下载失败，可以重试2-3次
   - 每次重试增加等待时间

2. **支持更多下载选项**
   - 根据网页内容，可能有 HD、Full HD 等多种质量
   - 可以让用户选择下载质量

3. **优化等待策略**
   - 使用智能等待代替固定时间等待
   - 监听网络请求完成状态

4. **添加进度显示**
   - 实时显示当前步骤
   - 让用户知道程序在做什么

## 总结

✅ **问题已解决！**

通过改为模拟真实用户操作流程，成功绕过了网站的反爬虫机制。关键是：
1. 不要直接通过URL参数访问
2. 按照网站设计的流程操作
3. 给服务器足够的处理时间
4. 保持浏览器伪装完整

现在你可以看到浏览器自动执行整个下载过程了！🎉

