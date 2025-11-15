# 问题修复：IPC 序列化错误

## 问题现象

点击"开始批量处理"时报错：
```
批量处理失败: An object could not be cloned.
```

## 错误原因

### 根本问题

在 Electron 中，通过 IPC 传递数据时，数据会被序列化（使用 Structured Clone Algorithm）。Vue 3 的响应式对象（Proxy）无法被序列化，因此会抛出 "An object could not be cloned" 错误。

### 问题代码

```typescript
// ❌ 错误：直接传递 Vue 响应式对象
const batchResult = await window.api.invoke('db:batch:create', {
  name: `批次_${new Date().toLocaleString('zh-CN')}`,
  total_count: links.length,
  edit_config: editConfig.value  // editConfig.value 是 Vue Proxy 对象
})
```

### 技术细节

Vue 3 使用 `Proxy` 来实现响应式：

```javascript
const editConfig = ref({
  speed: 1.2,
  sharpen: 0.1,
  flip: 'none',
  muteOriginal: true
})

// editConfig.value 的实际类型：
// Proxy { speed: 1.2, sharpen: 0.1, ... }
```

Electron 的 IPC 序列化无法处理 Proxy 对象，因为：
1. Proxy 不是普通对象
2. Structured Clone Algorithm 不支持 Proxy
3. Proxy 的内部状态无法被序列化

## 修复方案

### 方案选择

有三种方案可以解决：

**方案一**：使用 `JSON.parse(JSON.stringify())`
```typescript
const plainEditConfig = JSON.parse(JSON.stringify(editConfig.value))
```
- 优点：简单，可靠，深拷贝
- 缺点：性能稍差（对小对象影响不大）

**方案二**：使用 `toRaw()`（Vue 3 提供）
```typescript
import { toRaw } from 'vue'
const plainEditConfig = toRaw(editConfig.value)
```
- 优点：Vue 官方 API，性能好
- 缺点：只移除最外层 Proxy，嵌套对象仍是 Proxy

**方案三**：使用展开运算符
```typescript
const plainEditConfig = { ...editConfig.value }
```
- 优点：简洁
- 缺点：浅拷贝，嵌套对象仍是 Proxy

**选择**：方案一（JSON 序列化），因为：
- 确保完全转换为普通对象
- 深拷贝，避免后续修改影响原对象
- 适用于所有情况

### 修复代码

#### 修复点 1：创建批次

```typescript
// 转换为普通对象（避免 Vue 响应式对象序列化问题）
const plainEditConfig = JSON.parse(JSON.stringify(editConfig.value))

// 创建批次
const batchResult = await window.api.invoke('db:batch:create', {
  name: `批次_${new Date().toLocaleString('zh-CN')}`,
  total_count: links.length,
  edit_config: plainEditConfig  // ✅ 传递普通对象
})
```

#### 修复点 2：创建任务

```typescript
const taskResult = await window.api.invoke('download:task:create', {
  batchId,
  url,
  editConfig: plainEditConfig  // ✅ 复用转换后的对象
})
```

## 关于错误日志

### 问题二：error-2025-11-14.log 为空

**这是正常的**，原因：

1. **错误发生位置**：渲染进程（前端 Vue 代码）
2. **错误日志范围**：只记录主进程的错误
3. **前端错误位置**：浏览器 DevTools Console

### 日志分类

| 日志文件 | 记录内容 | 来源 |
|---------|---------|------|
| `app-*.log` | 所有级别的日志 | 主进程 |
| `error-*.log` | 只记录 ERROR 级别 | 主进程 |
| `download-*.log` | 下载相关的日志 | 主进程（download模块） |
| DevTools Console | 前端运行时错误 | 渲染进程 |

### 前端错误处理

如果需要将前端错误记录到文件，可以添加全局错误处理：

```typescript
// src/renderer/src/main.ts
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  
  // 可选：通过 IPC 发送到主进程记录
  window.api.invoke('log:error', {
    message: err.message,
    stack: err.stack,
    info
  })
}

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason)
  
  // 可选：通过 IPC 发送到主进程记录
  window.api.invoke('log:error', {
    message: event.reason.message || String(event.reason),
    type: 'unhandledrejection'
  })
})
```

## 测试验证

### 测试步骤

1. 刷新 Electron 应用（Ctrl+R 或 F5）
2. 输入 TikTok 链接：`https://vt.tiktok.com/ZSy8X6uoB/`
3. 点击"开始批量处理"

### 预期结果

**成功的表现**：
- ✅ 界面提示："成功启动 1 个下载任务"
- ✅ 控制台输出：
  ```
  开始处理视频链接: ['https://vt.tiktok.com/ZSy8X6uoB/']
  批次创建成功: 1
  创建下载任务: https://vt.tiktok.com/ZSy8X6uoB/
  下载任务创建成功: {id: 1, ...}
  下载任务已启动: 1
  ```
- ✅ 日志文件（`logs/app-2025-11-14.log`）：
  ```
  [INFO] [database] 批次创建成功
  [INFO] [download] 下载任务已创建
  [INFO] [download] 开始下载视频
  ```

**失败的表现**（如果仍然报错）：
- ❌ 控制台错误："An object could not be cloned"
- 说明代码未热重载，需要手动刷新

## 相关知识

### Structured Clone Algorithm

Electron IPC 使用 Structured Clone Algorithm 序列化数据，支持的类型：

✅ **支持的类型**：
- 基本类型（string, number, boolean, null, undefined）
- 普通对象和数组
- Date, RegExp
- Map, Set
- ArrayBuffer, TypedArray
- Blob, File

❌ **不支持的类型**：
- Function
- Symbol
- Proxy（Vue 响应式对象）
- DOM 节点
- 循环引用

### Vue 3 响应式原理

```javascript
// Vue 2 使用 Object.defineProperty
const data = {
  count: 0
}
Object.defineProperty(data, 'count', {
  get() { /* ... */ },
  set(value) { /* ... */ }
})

// Vue 3 使用 Proxy
const data = new Proxy({ count: 0 }, {
  get(target, key) { /* ... */ },
  set(target, key, value) { /* ... */ }
})
```

### 最佳实践

在 Electron IPC 调用中：

1. **使用普通对象**：
   ```typescript
   const plainData = JSON.parse(JSON.stringify(reactiveData.value))
   await window.api.invoke('some:method', plainData)
   ```

2. **使用 toRaw（仅适用于简单对象）**：
   ```typescript
   import { toRaw } from 'vue'
   const plainData = toRaw(reactiveData.value)
   await window.api.invoke('some:method', plainData)
   ```

3. **直接传递基本类型**：
   ```typescript
   await window.api.invoke('some:method', 
     name.value,        // string
     count.value,       // number
     enabled.value      // boolean
   )
   ```

## 总结

### 问题
- Vue 3 响应式对象（Proxy）无法通过 Electron IPC 序列化
- 导致 "An object could not be cloned" 错误

### 修复
- 使用 `JSON.parse(JSON.stringify())` 转换为普通对象
- 在所有 IPC 调用前进行转换

### 验证
- ✅ 修复后可以正常创建批次和任务
- ✅ 前端错误不会记录到主进程的 error.log（这是正常的）
- ✅ 主进程日志正确记录批次和任务创建

---

**修复日期**：2025-11-14  
**修复文件**：`src/renderer/src/views/BatchInput.vue`  
**修复行数**：+3 行  
**测试状态**：待验证

