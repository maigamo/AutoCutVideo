# TikTok下载功能 - 最终修复方案

## 修复时间
2025-11-14 15:00

## 问题根源

### 错误的实现方式

#### 1. 错误的选择器
```typescript
❌ await page.fill('input[type="text"]', task.url)
```
**问题**：
- 使用CSS选择器可能匹配到错误的元素
- 网页上可能有多个 `input[type="text"]`
- 没有自动等待机制

#### 2. 缺少角色定位
```typescript
❌ await page.click('button:has-text("Download")')
```
**问题**：
- `:has-text()` 不是标准的Playwright API
- 可能匹配到页面上的其他按钮
- 不够精确

### ✅ 正确的实现方式（参考代码）

根据你提供的正确参考代码：

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://ssstik.li/');
  
  // ✅ 使用 getByRole 精确定位
  await page.getByRole('textbox', { name: 'Search' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('https://vt.tiktok.com/ZSy8X6uoB/');
  await page.getByRole('button', { name: 'Download' }).click();
  await page.getByRole('link', { name: 'Download MP4 HD' }).click();
  
  await context.close();
  await browser.close();
})();
```

## 最终修复实现

### 完整代码流程

```typescript
// 1. 访问首页
await page.goto('https://ssstik.li/', {
  waitUntil: 'domcontentloaded',
  timeout: 90000  // 90秒超时
})

// 2. 使用getByRole查找Search输入框（自动等待）
const searchBox = page.getByRole('textbox', { name: 'Search' })

// 3. 点击输入框
await searchBox.click({ timeout: 30000 })

// 4. 填写TikTok链接
await searchBox.fill(task.url, { timeout: 30000 })

// 5. 点击Download按钮（自动等待）
await page.getByRole('button', { name: 'Download' }).click({ timeout: 30000 })

// 6. 等待下载链接出现（自动等待）
const downloadLink = page.getByRole('link', { name: 'Download MP4 HD' })
await downloadLink.waitFor({ state: 'visible', timeout: 60000 })

// 7. 点击下载链接
const downloadPromise = page.waitForEvent('download', { timeout: 90000 })
await downloadLink.click({ timeout: 30000 })
const download = await downloadPromise

// 8. 保存文件
await download.saveAs(savePath)
```

## 关键改进点

### 1. 使用 `getByRole` API

**优势**：
- ✅ 语义化定位，更准确
- ✅ 自动等待元素出现
- ✅ 自动处理可访问性
- ✅ 更稳定，不易失效

**对比**：
```typescript
❌ page.waitForSelector('input[type="text"]')  // 手动等待
❌ page.fill('input[type="text"]', ...)        // 可能选错元素

✅ page.getByRole('textbox', { name: 'Search' })  // 自动等待 + 精确定位
```

### 2. 自动等待机制

Playwright 的 `getByRole` 会：
- 自动等待元素在DOM中出现
- 自动等待元素变为可见
- 自动等待元素变为可用
- 自动重试直到超时

**无需手动 `waitForTimeout`**：
```typescript
❌ await page.waitForTimeout(8000)  // 固定等待，浪费时间

✅ await downloadLink.waitFor({ state: 'visible', timeout: 60000 })  // 智能等待
```

### 3. 增加的超时时间

| 操作 | 超时时间 | 说明 |
|------|----------|------|
| page.goto | 90秒 | 页面加载可能较慢 |
| 点击/填写操作 | 30秒 | 元素交互 |
| 等待下载链接 | 60秒 | 服务器处理视频需要时间 |
| 下载事件 | 90秒 | 文件下载可能较大 |

### 4. 调试截图功能

当任何步骤失败时：
```typescript
try {
  const screenshotPath = path.join(path.dirname(task.savePath), `debug_${task.id}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })
  logger.debug('已保存调试截图', { taskId: task.id, screenshotPath })
} catch (screenshotError) {
  logger.warn('保存截图失败', { error: String(screenshotError) })
}
```

## 完整的操作序列

```
用户操作                    代码实现                              超时时间
───────────────────────────────────────────────────────────────────────────
1. 打开网站             → page.goto('https://ssstik.li/')      90秒
                                                               
2. 看到输入框           → getByRole('textbox', { name })       30秒
                                                               
3. 点击输入框           → searchBox.click()                    30秒
                                                               
4. 输入链接             → searchBox.fill(url)                  30秒
                                                               
5. 点击下载按钮         → getByRole('button').click()          30秒
                                                               
6. 等待处理             → downloadLink.waitFor()               60秒
   (服务器获取视频)                                            
                                                               
7. 看到下载链接         → getByRole('link', { name })          自动
   "Download MP4 HD"                                           
                                                               
8. 点击下载             → downloadLink.click()                 30秒
                                                               
9. 文件下载             → waitForEvent('download')             90秒
                                                               
10. 保存文件            → download.saveAs()                    默认
```

## 为什么之前的方法失败？

### 1. 使用URL参数直接访问
```typescript
❌ https://ssstik.li/?q=https://...
```
- 触发反爬虫机制
- `ERR_CONNECTION_CLOSED` 错误

### 2. 选择器不准确
```typescript
❌ input[type="text"]
```
- 可能匹配多个元素
- 不知道具体是哪个输入框

### 3. 固定等待时间
```typescript
❌ await page.waitForTimeout(8000)
```
- 网络快时浪费时间
- 网络慢时不够用

### 4. 缺少自动等待
```typescript
❌ await page.click('button')
```
- 元素可能还未出现
- 可能还未可点击

## 修复后的优势

### ✅ 1. 更可靠
- 使用语义化API，不依赖CSS结构
- 自动等待机制，处理各种网络情况
- 精确定位，不会点错元素

### ✅ 2. 更快速
- 智能等待，无需固定延迟
- 元素一出现就操作，不浪费时间

### ✅ 3. 更易维护
- 代码清晰易读
- `getByRole` 接近自然语言
- 网站改版影响小

### ✅ 4. 更易调试
- 详细的日志记录
- 自动截图功能
- 每个步骤都有进度提示

## 测试结果预期

启动应用后，你应该看到：

1. **浏览器窗口自动打开**（headless: false）
2. **访问 ssstik.li**
3. **输入框自动填写链接**
4. **自动点击 Download 按钮**
5. **等待页面处理**（会显示 "Retrieving data..."）
6. **出现下载链接后自动点击**
7. **文件开始下载**
8. **保存为 `TT_20251114_HHMMSS.mp4`**

## 日志示例

成功时的日志：
```
[INFO] 正在访问ssstik.li...
[DEBUG] 页面加载成功，准备输入链接...
[DEBUG] 已点击输入框，准备填写链接...
[DEBUG] 已输入链接，准备点击下载按钮...
[DEBUG] 已点击下载按钮，等待下载链接生成...
[DEBUG] 开始等待下载链接出现...
[DEBUG] 下载链接已出现，准备点击...
[DEBUG] 已点击下载链接，等待下载开始...
[DEBUG] 正在保存文件...
[INFO] TikTok/抖音视频下载完成
```

失败时的日志：
```
[ERROR] 下载过程失败
[DEBUG] 已保存调试截图: debug_3.png
```

## 文件信息

- **修改文件**：`src/main/workers/DownloadWorker.ts`
- **当前行数**：502行 ✅（<600行）
- **Linter错误**：0个 ✅

## 关键要点总结

1. ✅ **使用 `getByRole` 而不是 CSS 选择器**
2. ✅ **利用 Playwright 的自动等待机制**
3. ✅ **增加充足的超时时间（30-90秒）**
4. ✅ **模拟完整的用户操作流程**
5. ✅ **保持 headless: false 便于观察**
6. ✅ **添加调试截图功能**
7. ✅ **详细的日志记录**

## 现在可以测试了！

打开应用，添加 TikTok 链接：
```
https://vt.tiktok.com/ZSy8X6uoB/
```

然后观察浏览器窗口自动执行完整的下载流程！🚀

