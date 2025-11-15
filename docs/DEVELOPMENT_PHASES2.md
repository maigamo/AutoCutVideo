# AutoCutVideo 开发阶段指导书 (阶段6-10)

## ⚠️ 重要声明

### 开发规则
1. **命令执行方式**: 所有命令行操作必须使用 **PowerShell** 方式执行
2. **代码文件行数限制**: 每个代码文件不能超过 **600行**
   - 超过600行的文件必须拆分成多个文件
   - 发现此问题后,**优先解决文件拆分问题**,再继续其他开发任务
3. **程序运行要求**: 每完成一个阶段后必须运行程序,确保无报错
   - 如有异常必须立即修复
   - 确保程序能正常启动和运行

### 开发检查要点
- [ ] 使用PowerShell执行所有命令
- [ ] 所有代码文件 ≤ 600行
- [ ] 程序能够正常启动
- [ ] 前后端接口正确对应(涉及前后端时)
- [ ] 无运行时错误

---

## 📋 开发概述

本文档是AutoCutVideo项目开发指导的第二部分,包含**阶段6-10**的详细开发指导。

在开始本阶段前,请确保已完成**DEVELOPMENT_PHASES1.md**中的阶段1-5。

---

## 🎯 阶段6: 下载功能实现

### 阶段目标
实现视频下载功能,支持多平台链接解析和Playwright自动化下载。

### 开发任务清单

#### 6.1 创建下载Worker

**src/main/workers/DownloadWorker.ts** (< 400行):
```typescript
import { chromium, Browser, Page } from 'playwright'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'
import { logger } from '../utils/logger'
import { configService } from '../services/ConfigService'

export interface DownloadTask {
  id: number
  url: string
  platform: string
  savePath: string
}

export class DownloadWorker extends EventEmitter {
  private browser: Browser | null = null
  private isRunning = false
  
  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        downloadsPath: configService.get('paths').downloadDir
      })
      logger.info('Playwright浏览器启动成功', { module: 'download' })
    } catch (error) {
      logger.error('Playwright浏览器启动失败', { module: 'download', error })
      throw error
    }
  }
  
  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      logger.info('Playwright浏览器已关闭', { module: 'download' })
    }
  }
  
  async downloadVideo(task: DownloadTask): Promise<string> {
    if (!this.browser) {
      throw new Error('浏览器未初始化')
    }
    
    this.isRunning = true
    
    try {
      const platform = this.detectPlatform(task.url)
      let filePath: string
      
      switch (platform) {
        case 'douyin':
          filePath = await this.downloadFromDouyin(task)
          break
        case 'xiaohongshu':
          filePath = await this.downloadFromXiaohongshu(task)
          break
        case 'twitter':
          filePath = await this.downloadFromTwitter(task)
          break
        case 'youtube':
          filePath = await this.downloadFromYoutube(task)
          break
        default:
          throw new Error(`不支持的平台: ${platform}`)
      }
      
      this.emit('progress', { taskId: task.id, progress: 100 })
      this.emit('completed', { taskId: task.id, filePath })
      
      return filePath
    } catch (error) {
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
    }
  }
  
  detectPlatform(url: string): string {
    if (url.includes('douyin.com')) return 'douyin'
    if (url.includes('xiaohongshu.com')) return 'xiaohongshu'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    return 'unknown'
  }
  
  private async downloadFromDouyin(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      // 使用ssstik.li下载抖音视频
      await page.goto('https://ssstik.io/zh')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      // 输入链接
      await page.fill('input[name="id"]', task.url)
      
      this.emit('progress', { taskId: task.id, progress: 40 })
      
      // 点击下载按钮
      await page.click('button[type="submit"]')
      
      // 等待下载链接出现
      await page.waitForSelector('a[download]', { timeout: 30000 })
      
      this.emit('progress', { taskId: task.id, progress: 60 })
      
      // 获取下载链接
      const downloadUrl = await page.getAttribute('a[download]', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      // 下载文件
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromXiaohongshu(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      // 使用godownloader.app下载小红书视频
      await page.goto('https://godownloader.app/zh/xiaohongshu-downloader')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      await page.fill('input[type="text"]', task.url)
      await page.click('button[type="submit"]')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      await page.waitForSelector('a[download]', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('a[download]', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromTwitter(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      await page.goto('https://xdown.app/')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      await page.fill('input[type="url"]', task.url)
      await page.click('button[type="submit"]')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      await page.waitForSelector('.download-link', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('.download-link', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromYoutube(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      await page.goto('https://savefrom.net/')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      await page.fill('input#sf_url', task.url)
      await page.click('button#sf_submit')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      await page.waitForSelector('.def-btn-box a', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('.def-btn-box a', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } finally {
      await page.close()
    }
  }
  
  private async downloadFile(page: Page, url: string, savePath: string): Promise<string> {
    // 确保目录存在
    const dir = path.dirname(savePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // 监听下载事件
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.goto(url)
    ])
    
    // 保存文件
    await download.saveAs(savePath)
    
    return savePath
  }
}

export const downloadWorker = new DownloadWorker()
```

#### 6.2 实现下载IPC处理器

**src/main/ipc/download.ipc.ts** (< 200行):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'
import { downloadWorker } from '../workers/DownloadWorker'
import { eventBus } from '../services/EventBus'
import path from 'path'
import { configService } from '../services/ConfigService'
import { v4 as uuidv4 } from 'uuid'

export function initDownloadHandlers(): void {
  // 初始化下载Worker
  downloadWorker.initialize().catch(error => {
    logger.error('下载Worker初始化失败', { module: 'download', error })
  })
  
  // 监听下载事件
  downloadWorker.on('progress', ({ taskId, progress }) => {
    dbService.updateTask(taskId, { progress })
    eventBus.publish('download:progress', { taskId, progress })
  })
  
  downloadWorker.on('completed', ({ taskId, filePath }) => {
    dbService.updateTask(taskId, { 
      status: 'completed', 
      output_path: filePath,
      completed_at: new Date().toISOString()
    })
    
    // 创建视频记录
    const task = dbService.getTask(taskId)
    if (task) {
      dbService.createVideo({
        batch_id: task.batch_id,
        filename: path.basename(filePath),
        file_path: filePath,
        is_edited: false,
        source_task_id: taskId
      })
    }
    
    eventBus.publish('download:completed', { taskId, filePath })
  })
  
  downloadWorker.on('failed', ({ taskId, error }) => {
    dbService.updateTask(taskId, { 
      status: 'failed', 
      error_message: error.message 
    })
    eventBus.publish('download:failed', { taskId, error: error.message })
  })
  
  // 创建下载任务
  ipcMain.handle('download:task:create', async (event, payload) => {
    try {
      const { url } = payload
      
      if (!url) {
        return { success: false, error: '链接不能为空' }
      }
      
      // 检测平台
      const platform = downloadWorker.detectPlatform(url)
      if (platform === 'unknown') {
        return { success: false, error: '不支持的平台' }
      }
      
      // 创建任务记录
      const taskId = dbService.createTask({
        type: 'download',
        status: 'pending',
        url,
        platform,
        progress: 0
      })
      
      logger.info('下载任务已创建', { module: 'download', taskId, url })
      
      return { 
        success: true, 
        data: { id: taskId, url, platform },
        message: '任务创建成功'
      }
    } catch (error: any) {
      logger.error('创建下载任务失败', { module: 'download', error })
      return { success: false, error: error.message }
    }
  })
  
  // 开始下载任务
  ipcMain.handle('download:task:start', async (event, taskId: number) => {
    try {
      const task = dbService.getTask(taskId)
      if (!task) {
        return { success: false, error: '任务不存在' }
      }
      
      if (task.status !== 'pending') {
        return { success: false, error: '任务状态不正确' }
      }
      
      // 更新任务状态
      dbService.updateTask(taskId, { 
        status: 'running',
        started_at: new Date().toISOString()
      })
      
      // 生成保存路径
      const downloadDir = configService.get('paths').downloadDir
      const filename = `${uuidv4()}.mp4`
      const savePath = path.join(downloadDir, filename)
      
      // 开始下载(异步)
      downloadWorker.downloadVideo({
        id: taskId,
        url: task.url!,
        platform: task.platform!,
        savePath
      }).catch(error => {
        logger.error('下载失败', { module: 'download', taskId, error })
      })
      
      eventBus.publish('download:started', { taskId })
      
      return { success: true, message: '下载已开始' }
    } catch (error: any) {
      logger.error('启动下载任务失败', { module: 'download', error })
      return { success: false, error: error.message }
    }
  })
  
  // 取消下载任务
  ipcMain.handle('download:task:cancel', async (event, taskId: number) => {
    try {
      dbService.updateTask(taskId, { status: 'cancelled' })
      eventBus.publish('task:cancelled', { taskId })
      
      return { success: true, message: '任务已取消' }
    } catch (error: any) {
      logger.error('取消下载任务失败', { module: 'download', error })
      return { success: false, error: error.message }
    }
  })
  
  // 获取下载任务列表
  ipcMain.handle('download:task:list', async () => {
    try {
      const db = require('../database/connection').getDatabase()
      const tasks = db.prepare('SELECT * FROM tasks WHERE type = ? ORDER BY created_at DESC')
        .all('download')
      
      return { success: true, data: tasks }
    } catch (error: any) {
      logger.error('获取下载任务列表失败', { module: 'download', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('下载IPC处理器已注册', { module: 'ipc' })
}
```

#### 6.3 补充数据库IPC处理器

**src/main/ipc/database.ipc.ts** (< 150行):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'

export function initDatabaseHandlers(): void {
  // 查询任务
  ipcMain.handle('db:query:tasks', async (event, filter: any = {}) => {
    try {
      const { type, status, batch_id } = filter
      const db = require('../database/connection').getDatabase()
      
      let sql = 'SELECT * FROM tasks WHERE 1=1'
      const params: any[] = []
      
      if (type) {
        sql += ' AND type = ?'
        params.push(type)
      }
      if (status) {
        sql += ' AND status = ?'
        params.push(status)
      }
      if (batch_id) {
        sql += ' AND batch_id = ?'
        params.push(batch_id)
      }
      
      sql += ' ORDER BY created_at DESC'
      
      const tasks = db.prepare(sql).all(...params)
      
      return { success: true, data: tasks }
    } catch (error: any) {
      logger.error('查询任务失败', { module: 'database', error })
      return { success: false, error: error.message }
    }
  })
  
  // 查询视频
  ipcMain.handle('db:query:videos', async (event, filter: any = {}) => {
    try {
      const { is_edited, batch_id } = filter
      const db = require('../database/connection').getDatabase()
      
      let sql = 'SELECT * FROM videos WHERE 1=1'
      const params: any[] = []
      
      if (is_edited !== undefined) {
        sql += ' AND is_edited = ?'
        params.push(is_edited ? 1 : 0)
      }
      if (batch_id) {
        sql += ' AND batch_id = ?'
        params.push(batch_id)
      }
      
      sql += ' ORDER BY created_at DESC'
      
      const videos = db.prepare(sql).all(...params)
      
      return { success: true, data: videos }
    } catch (error: any) {
      logger.error('查询视频失败', { module: 'database', error })
      return { success: false, error: error.message }
    }
  })
  
  // 获取统计数据
  ipcMain.handle('db:stats:summary', async () => {
    try {
      const db = require('../database/connection').getDatabase()
      
      const totalVideos = db.prepare('SELECT COUNT(*) as count FROM videos').get().count
      const rawVideos = db.prepare('SELECT COUNT(*) as count FROM videos WHERE is_edited = 0').get().count
      const editedVideos = db.prepare('SELECT COUNT(*) as count FROM videos WHERE is_edited = 1').get().count
      const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count
      const runningTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('running').count
      
      return {
        success: true,
        data: {
          totalVideos,
          rawVideos,
          editedVideos,
          totalTasks,
          runningTasks
        }
      }
    } catch (error: any) {
      logger.error('获取统计数据失败', { module: 'database', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('数据库IPC处理器已注册', { module: 'ipc' })
}
```

#### 6.4 补充文件操作IPC处理器

**src/main/ipc/file.ipc.ts** (< 150行):
```typescript
import { ipcMain, dialog, shell } from 'electron'
import { logger } from '../utils/logger'
import fs from 'fs'
import path from 'path'

export function initFileHandlers(): void {
  // 打开文件/文件夹选择对话框
  ipcMain.handle('file:dialog:open', async (event, options: any = {}) => {
    try {
      const { type = 'file', filters = [] } = options
      
      const result = await dialog.showOpenDialog({
        properties: type === 'folder' ? ['openDirectory'] : ['openFile'],
        filters
      })
      
      if (result.canceled) {
        return { success: false, message: '用户取消' }
      }
      
      return { success: true, data: result.filePaths }
    } catch (error: any) {
      logger.error('打开文件对话框失败', { module: 'file', error })
      return { success: false, error: error.message }
    }
  })
  
  // 检查文件是否存在
  ipcMain.handle('file:exists', async (event, filePath: string) => {
    try {
      const exists = fs.existsSync(filePath)
      return { success: true, data: exists }
    } catch (error: any) {
      logger.error('检查文件存在失败', { module: 'file', error })
      return { success: false, error: error.message }
    }
  })
  
  // 删除文件
  ipcMain.handle('file:delete', async (event, filePath: string) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return { success: true, message: '文件已删除' }
      }
      return { success: false, error: '文件不存在' }
    } catch (error: any) {
      logger.error('删除文件失败', { module: 'file', error })
      return { success: false, error: error.message }
    }
  })
  
  // 获取文件信息
  ipcMain.handle('file:info', async (event, filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: '文件不存在' }
      }
      
      const stats = fs.statSync(filePath)
      
      return {
        success: true,
        data: {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile()
        }
      }
    } catch (error: any) {
      logger.error('获取文件信息失败', { module: 'file', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('文件IPC处理器已注册', { module: 'ipc' })
}
```

#### 6.5 补充设置IPC处理器

**src/main/ipc/settings.ipc.ts** (< 100行):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { configService } from '../services/ConfigService'

export function initSettingsHandlers(): void {
  // 获取所有设置
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = configService.getAll()
      return { success: true, data: settings }
    } catch (error: any) {
      logger.error('获取设置失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 保存设置
  ipcMain.handle('settings:set', async (event, config: any) => {
    try {
      configService.setAll(config)
      return { success: true, message: '设置已保存' }
    } catch (error: any) {
      logger.error('保存设置失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 重置设置
  ipcMain.handle('settings:reset', async () => {
    try {
      configService.reset()
      return { success: true, message: '设置已重置' }
    } catch (error: any) {
      logger.error('重置设置失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('设置IPC处理器已注册', { module: 'ipc' })
}
```

#### 6.6 补充系统IPC处理器

**src/main/ipc/system.ipc.ts** (< 100行):
```typescript
import { ipcMain, shell } from 'electron'
import { logger } from '../utils/logger'
import os from 'os'
import { app } from 'electron'

export function initSystemHandlers(): void {
  // 获取系统信息
  ipcMain.handle('system:info', async () => {
    try {
      return {
        success: true,
        data: {
          platform: process.platform,
          arch: process.arch,
          version: app.getVersion(),
          electronVersion: process.versions.electron,
          nodeVersion: process.versions.node,
          cpus: os.cpus().length,
          memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
        }
      }
    } catch (error: any) {
      logger.error('获取系统信息失败', { module: 'system', error })
      return { success: false, error: error.message }
    }
  })
  
  // 打开外部链接
  ipcMain.handle('system:openExternal', async (event, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error: any) {
      logger.error('打开外部链接失败', { module: 'system', error })
      return { success: false, error: error.message }
    }
  })
  
  // 在文件夹中显示文件
  ipcMain.handle('system:showItemInFolder', async (event, filePath: string) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error: any) {
      logger.error('在文件夹中显示文件失败', { module: 'system', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('系统IPC处理器已注册', { module: 'ipc' })
}
```

#### 6.7 补充窗口IPC处理器

**src/main/ipc/window.ipc.ts** (< 80行):
```typescript
import { ipcMain, BrowserWindow } from 'electron'
import { logger } from '../utils/logger'

export function initWindowHandlers(): void {
  // 最小化窗口
  ipcMain.on('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })
  
  // 最大化/还原窗口
  ipcMain.on('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })
  
  // 关闭窗口
  ipcMain.on('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })
  
  // 设置窗口标题
  ipcMain.on('window:setTitle', (event, title: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.setTitle(title)
  })
  
  logger.debug('窗口IPC处理器已注册', { module: 'ipc' })
}
```

### 检查点
- [ ] 下载Worker正常工作
- [ ] 支持多平台链接解析
- [ ] 下载进度正常更新
- [ ] 下载完成后创建视频记录
- [ ] 所有IPC处理器正常响应
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查前后端下载接口对应正确
- 验证Playwright自动化流程稳定
- 确保下载文件保存路径正确

---

## 🎯 阶段7: 剪辑功能实现

### 阶段目标
实现视频剪辑功能,支持倍速、翻转、锐化、音频处理等操作。

### 开发任务清单

#### 7.1 创建FFmpeg工具类

**src/main/utils/ffmpeg.util.ts** (< 300行):
```typescript
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'
import { logger } from './logger'

// 设置FFmpeg路径
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export interface EditConfig {
  speed: number          // 倍速 0.5-2.0
  sharpen: number        // 锐化 0-100
  flip: 'none' | 'h' | 'v'  // 翻转
  muteOriginal: boolean  // 静音原音
  musicPath?: string     // 背景音乐路径
}

export class FFmpegUtil extends EventEmitter {
  async processVideo(
    inputPath: string,
    outputPath: string,
    config: EditConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('开始处理视频', { module: 'ffmpeg', inputPath, config })
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        
        const command = ffmpeg(inputPath)
        
        // 构建视频滤镜
        const videoFilters: string[] = []
        
        // 倍速处理
        if (config.speed !== 1.0) {
          const pts = 1 / config.speed
          videoFilters.push(`setpts=${pts}*PTS`)
        }
        
        // 锐化处理
        if (config.sharpen > 0) {
          const sharpenValue = config.sharpen / 100
          videoFilters.push(`unsharp=5:5:${sharpenValue}:5:5:0`)
        }
        
        // 翻转处理
        if (config.flip === 'h') {
          videoFilters.push('hflip')
        } else if (config.flip === 'v') {
          videoFilters.push('vflip')
        }
        
        // 应用视频滤镜
        if (videoFilters.length > 0) {
          command.videoFilters(videoFilters.join(','))
        }
        
        // 音频处理
        if (config.muteOriginal && config.musicPath) {
          // 静音原音并添加背景音乐
          command
            .input(config.musicPath)
            .complexFilter([
              '[1:a]atrim=0:duration,asetpts=PTS-STARTPTS[music]'
            ])
            .outputOptions(['-map', '0:v', '-map', '[music]'])
        } else if (config.muteOriginal) {
          // 仅静音原音
          command.noAudio()
        } else if (config.musicPath) {
          // 保留原音,添加背景音乐(混音)
          command
            .input(config.musicPath)
            .complexFilter([
              '[0:a][1:a]amix=inputs=2:duration=shortest[aout]'
            ])
            .outputOptions(['-map', '0:v', '-map', '[aout]'])
        } else if (config.speed !== 1.0) {
          // 音频倍速
          const atempo = config.speed
          command.audioFilters(`atempo=${atempo}`)
        }
        
        // 输出配置
        command
          .output(outputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset', 'medium',
            '-crf', '23',
            '-movflags', '+faststart'
          ])
        
        // 进度回调
        command.on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0)
          this.emit('progress', percent)
          logger.debug('处理进度', { module: 'ffmpeg', percent })
        })
        
        // 完成回调
        command.on('end', () => {
          logger.info('视频处理完成', { module: 'ffmpeg', outputPath })
          this.emit('completed', outputPath)
          resolve()
        })
        
        // 错误回调
        command.on('error', (error) => {
          logger.error('视频处理失败', { module: 'ffmpeg', error })
          this.emit('failed', error)
          reject(error)
        })
        
        // 开始处理
        command.run()
      } catch (error) {
        logger.error('FFmpeg处理异常', { module: 'ffmpeg', error })
        reject(error)
      }
    })
  }
  
  async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          reject(error)
        } else {
          resolve(metadata)
        }
      })
    })
  }
  
  async getDuration(filePath: string): Promise<number> {
    const info = await this.getVideoInfo(filePath)
    return info.format.duration || 0
  }
  
  async generateThumbnail(videoPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          filename: path.basename(outputPath),
          folder: outputDir,
          size: '320x240'
        })
        .on('end', () => resolve(outputPath))
        .on('error', reject)
    })
  }
}

export const ffmpegUtil = new FFmpegUtil()
```

#### 7.2 创建剪辑Worker

**src/main/workers/EditWorker.ts** (< 250行):
```typescript
import { EventEmitter } from 'events'
import { ffmpegUtil } from '../utils/ffmpeg.util'
import { logger } from '../utils/logger'
import path from 'path'
import type { EditConfig } from '../utils/ffmpeg.util'

export interface EditTask {
  id: number
  inputPath: string
  outputPath: string
  config: EditConfig
}

export class EditWorker extends EventEmitter {
  private isRunning = false
  
  async editVideo(task: EditTask): Promise<string> {
    if (this.isRunning) {
      throw new Error('已有剪辑任务正在运行')
    }
    
    this.isRunning = true
    
    try {
      logger.info('开始剪辑视频', { module: 'edit', task })
      
      // 监听FFmpeg进度
      ffmpegUtil.on('progress', (percent) => {
        this.emit('progress', { taskId: task.id, progress: percent })
      })
      
      // 执行剪辑
      await ffmpegUtil.processVideo(
        task.inputPath,
        task.outputPath,
        task.config
      )
      
      logger.info('视频剪辑完成', { module: 'edit', outputPath: task.outputPath })
      
      this.emit('completed', { taskId: task.id, outputPath: task.outputPath })
      
      return task.outputPath
    } catch (error) {
      logger.error('视频剪辑失败', { module: 'edit', error })
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
      ffmpegUtil.removeAllListeners('progress')
    }
  }
  
  async generateThumbnail(videoPath: string): Promise<string> {
    try {
      const thumbnailDir = path.join(path.dirname(videoPath), '..', '..', 'thumbnails')
      const filename = path.basename(videoPath, path.extname(videoPath)) + '.jpg'
      const thumbnailPath = path.join(thumbnailDir, filename)
      
      await ffmpegUtil.generateThumbnail(videoPath, thumbnailPath)
      
      return thumbnailPath
    } catch (error) {
      logger.error('生成缩略图失败', { module: 'edit', error })
      throw error
    }
  }
}

export const editWorker = new EditWorker()
```

#### 7.3 实现剪辑IPC处理器

**src/main/ipc/edit.ipc.ts** (< 250行):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'
import { editWorker } from '../workers/EditWorker'
import { eventBus } from '../services/EventBus'
import { configService } from '../services/ConfigService'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

export function initEditHandlers(): void {
  // 监听剪辑事件
  editWorker.on('progress', ({ taskId, progress }) => {
    dbService.updateTask(taskId, { progress })
    eventBus.publish('edit:progress', { taskId, progress })
  })
  
  editWorker.on('completed', async ({ taskId, outputPath }) => {
    dbService.updateTask(taskId, { 
      status: 'completed', 
      output_path: outputPath,
      completed_at: new Date().toISOString()
    })
    
    // 创建剪辑后视频记录
    const task = dbService.getTask(taskId)
    if (task) {
      // 获取文件信息
      const stats = fs.statSync(outputPath)
      
      // 生成缩略图
      let thumbnailPath: string | undefined
      try {
        thumbnailPath = await editWorker.generateThumbnail(outputPath)
      } catch (error) {
        logger.warn('生成缩略图失败', { module: 'edit', error })
      }
      
      dbService.createVideo({
        batch_id: task.batch_id,
        filename: path.basename(outputPath),
        file_path: outputPath,
        file_size: stats.size,
        thumbnail_path: thumbnailPath,
        is_edited: true,
        source_task_id: taskId
      })
    }
    
    eventBus.publish('edit:completed', { taskId, outputPath })
  })
  
  editWorker.on('failed', ({ taskId, error }) => {
    dbService.updateTask(taskId, { 
      status: 'failed', 
      error_message: error.message 
    })
    eventBus.publish('edit:failed', { taskId, error: error.message })
  })
  
  // 创建剪辑任务
  ipcMain.handle('edit:task:create', async (event, payload) => {
    try {
      const { videoId, config } = payload
      
      // 获取视频记录
      const video = dbService.getVideo(videoId)
      if (!video) {
        return { success: false, error: '视频不存在' }
      }
      
      // 创建任务记录
      const taskId = dbService.createTask({
        type: 'edit',
        status: 'pending',
        input_path: video.file_path,
        config: JSON.stringify(config),
        progress: 0
      })
      
      logger.info('剪辑任务已创建', { module: 'edit', taskId, videoId })
      
      return { 
        success: true, 
        data: { id: taskId, videoId },
        message: '任务创建成功'
      }
    } catch (error: any) {
      logger.error('创建剪辑任务失败', { module: 'edit', error })
      return { success: false, error: error.message }
    }
  })
  
  // 开始剪辑任务
  ipcMain.handle('edit:task:start', async (event, taskId: number) => {
    try {
      const task = dbService.getTask(taskId)
      if (!task) {
        return { success: false, error: '任务不存在' }
      }
      
      if (task.status !== 'pending') {
        return { success: false, error: '任务状态不正确' }
      }
      
      // 更新任务状态
      dbService.updateTask(taskId, { 
        status: 'running',
        started_at: new Date().toISOString()
      })
      
      // 生成输出路径
      const outputDir = configService.get('paths').outputDir
      const filename = `${uuidv4()}.mp4`
      const outputPath = path.join(outputDir, filename)
      
      // 解析配置
      const config = JSON.parse(task.config || '{}')
      
      // 开始剪辑(异步)
      editWorker.editVideo({
        id: taskId,
        inputPath: task.input_path!,
        outputPath,
        config
      }).catch(error => {
        logger.error('剪辑失败', { module: 'edit', taskId, error })
      })
      
      eventBus.publish('edit:started', { taskId })
      
      return { success: true, message: '剪辑已开始' }
    } catch (error: any) {
      logger.error('启动剪辑任务失败', { module: 'edit', error })
      return { success: false, error: error.message }
    }
  })
  
  // 取消剪辑任务
  ipcMain.handle('edit:task:cancel', async (event, taskId: number) => {
    try {
      dbService.updateTask(taskId, { status: 'cancelled' })
      eventBus.publish('task:cancelled', { taskId })
      
      return { success: true, message: '任务已取消' }
    } catch (error: any) {
      logger.error('取消剪辑任务失败', { module: 'edit', error })
      return { success: false, error: error.message }
    }
  })
  
  // 获取剪辑配置
  ipcMain.handle('edit:config:get', async () => {
    try {
      const config = configService.get('editing')
      return { success: true, data: config }
    } catch (error: any) {
      logger.error('获取剪辑配置失败', { module: 'edit', error })
      return { success: false, error: error.message }
    }
  })
  
  // 保存剪辑配置
  ipcMain.handle('edit:config:set', async (event, config: any) => {
    try {
      configService.set('editing', config)
      return { success: true, message: '配置已保存' }
    } catch (error: any) {
      logger.error('保存剪辑配置失败', { module: 'edit', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('剪辑IPC处理器已注册', { module: 'ipc' })
}
```

### 检查点
- [ ] FFmpeg工具类正常工作
- [ ] 剪辑Worker正常执行
- [ ] 支持倍速、翻转、锐化等效果
- [ ] 音频处理正常(静音/添加背景音乐)
- [ ] 剪辑进度正常更新
- [ ] 生成缩略图功能正常
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查前后端剪辑接口对应正确
- 验证FFmpeg处理结果质量
- 确保剪辑后文件保存路径正确

---

## 🎯 阶段8: 导出功能实现

### 阶段目标
实现视频导出功能,支持批量导出、ZIP压缩、文件管理。

### 开发任务清单

#### 8.1 创建导出Worker

**src/main/workers/ExportWorker.ts** (< 300行):
```typescript
import { EventEmitter } from 'events'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { logger } from '../utils/logger'

export interface ExportTask {
  id: number
  videoIds: number[]
  outputDir: string
  compress: boolean
  zipName?: string
  renameRule: 'keep' | 'prefix' | 'suffix' | 'timestamp'
  prefix?: string
  suffix?: string
  deleteSource: boolean
}

export class ExportWorker extends EventEmitter {
  private isRunning = false
  
  async exportVideos(task: ExportTask): Promise<string> {
    if (this.isRunning) {
      throw new Error('已有导出任务正在运行')
    }
    
    this.isRunning = true
    
    try {
      logger.info('开始导出视频', { module: 'export', task })
      
      // 确保输出目录存在
      if (!fs.existsSync(task.outputDir)) {
        fs.mkdirSync(task.outputDir, { recursive: true })
      }
      
      const { dbService } = require('../services/DatabaseService')
      
      // 获取视频列表
      const videos = task.videoIds.map(id => dbService.getVideo(id)).filter(Boolean)
      
      if (videos.length === 0) {
        throw new Error('没有找到要导出的视频')
      }
      
      this.emit('progress', { taskId: task.id, progress: 10, step: '准备导出' })
      
      // 复制/重命名文件
      const exportedFiles: string[] = []
      let currentIndex = 0
      
      for (const video of videos) {
        const sourcePath = video.file_path
        
        if (!fs.existsSync(sourcePath)) {
          logger.warn('源文件不存在', { module: 'export', sourcePath })
          continue
        }
        
        // 生成目标文件名
        let filename = path.basename(sourcePath)
        const ext = path.extname(filename)
        const basename = path.basename(filename, ext)
        
        switch (task.renameRule) {
          case 'prefix':
            filename = `${task.prefix || ''}${filename}`
            break
          case 'suffix':
            filename = `${basename}${task.suffix || ''}${ext}`
            break
          case 'timestamp':
            filename = `${basename}_${Date.now()}${ext}`
            break
          default:
            // keep
            break
        }
        
        const targetPath = path.join(task.outputDir, filename)
        
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath)
        exportedFiles.push(targetPath)
        
        currentIndex++
        const progress = 10 + Math.floor((currentIndex / videos.length) * (task.compress ? 50 : 80))
        this.emit('progress', { taskId: task.id, progress, step: `复制文件 ${currentIndex}/${videos.length}` })
      }
      
      let resultPath = task.outputDir
      
      // 压缩为ZIP
      if (task.compress) {
        const zipName = task.zipName || `export_${Date.now()}.zip`
        const zipPath = path.join(task.outputDir, zipName)
        
        await this.createZip(exportedFiles, zipPath, (progress) => {
          const totalProgress = 60 + Math.floor(progress * 0.3)
          this.emit('progress', { taskId: task.id, progress: totalProgress, step: '压缩文件' })
        })
        
        // 删除已压缩的文件
        exportedFiles.forEach(file => {
          try {
            fs.unlinkSync(file)
          } catch (error) {
            logger.warn('删除临时文件失败', { module: 'export', file, error })
          }
        })
        
        resultPath = zipPath
      }
      
      // 删除源文件
      if (task.deleteSource) {
        this.emit('progress', { taskId: task.id, progress: 95, step: '清理源文件' })
        
        for (const video of videos) {
          try {
            if (fs.existsSync(video.file_path)) {
              fs.unlinkSync(video.file_path)
            }
            if (video.thumbnail_path && fs.existsSync(video.thumbnail_path)) {
              fs.unlinkSync(video.thumbnail_path)
            }
            dbService.deleteVideo(video.id)
          } catch (error) {
            logger.warn('删除源文件失败', { module: 'export', video: video.filename, error })
          }
        }
      }
      
      this.emit('progress', { taskId: task.id, progress: 100, step: '完成' })
      this.emit('completed', { taskId: task.id, path: resultPath })
      
      logger.info('视频导出完成', { module: 'export', resultPath })
      
      return resultPath
    } catch (error) {
      logger.error('视频导出失败', { module: 'export', error })
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
    }
  }
  
  private async createZip(files: string[], outputPath: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath)
      const archive = archiver('zip', {
        zlib: { level: 5 }
      })
      
      let totalSize = 0
      let processedSize = 0
      
      // 计算总大小
      files.forEach(file => {
        totalSize += fs.statSync(file).size
      })
      
      archive.on('progress', (progress) => {
        processedSize = progress.fs.processedBytes
        const percent = Math.floor((processedSize / totalSize) * 100)
        onProgress?.(percent)
      })
      
      output.on('close', () => {
        logger.info('ZIP文件创建完成', { module: 'export', size: archive.pointer() })
        resolve()
      })
      
      archive.on('error', (error) => {
        logger.error('ZIP文件创建失败', { module: 'export', error })
        reject(error)
      })
      
      archive.pipe(output)
      
      // 添加文件到压缩包
      files.forEach(file => {
        archive.file(file, { name: path.basename(file) })
      })
      
      archive.finalize()
    })
  }
}

export const exportWorker = new ExportWorker()
```

#### 8.2 实现导出IPC处理器

**src/main/ipc/export.ipc.ts** (< 200行):
```typescript
import { ipcMain, shell } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'
import { exportWorker } from '../workers/ExportWorker'
import { eventBus } from '../services/EventBus'

export function initExportHandlers(): void {
  // 监听导出事件
  exportWorker.on('progress', ({ taskId, progress, step }) => {
    dbService.updateTask(taskId, { progress })
    eventBus.publish('export:progress', { taskId, progress, step })
  })
  
  exportWorker.on('completed', ({ taskId, path }) => {
    dbService.updateTask(taskId, { 
      status: 'completed', 
      output_path: path,
      completed_at: new Date().toISOString()
    })
    eventBus.publish('export:completed', { taskId, path })
  })
  
  exportWorker.on('failed', ({ taskId, error }) => {
    dbService.updateTask(taskId, { 
      status: 'failed', 
      error_message: error.message 
    })
    eventBus.publish('export:failed', { taskId, error: error.message })
  })
  
  // 创建导出任务
  ipcMain.handle('export:task:create', async (event, payload) => {
    try {
      const { videoIds, options } = payload
      
      if (!videoIds || videoIds.length === 0) {
        return { success: false, error: '请选择要导出的视频' }
      }
      
      if (!options.outputDir) {
        return { success: false, error: '请选择导出目录' }
      }
      
      // 创建任务记录
      const taskId = dbService.createTask({
        type: 'export',
        status: 'pending',
        config: JSON.stringify({ videoIds, ...options }),
        progress: 0
      })
      
      logger.info('导出任务已创建', { module: 'export', taskId, videoIds })
      
      return { 
        success: true, 
        data: { id: taskId },
        message: '任务创建成功'
      }
    } catch (error: any) {
      logger.error('创建导出任务失败', { module: 'export', error })
      return { success: false, error: error.message }
    }
  })
  
  // 开始导出任务
  ipcMain.handle('export:task:start', async (event, taskId: number) => {
    try {
      const task = dbService.getTask(taskId)
      if (!task) {
        return { success: false, error: '任务不存在' }
      }
      
      if (task.status !== 'pending') {
        return { success: false, error: '任务状态不正确' }
      }
      
      // 更新任务状态
      dbService.updateTask(taskId, { 
        status: 'running',
        started_at: new Date().toISOString()
      })
      
      // 解析配置
      const config = JSON.parse(task.config || '{}')
      
      // 开始导出(异步)
      exportWorker.exportVideos({
        id: taskId,
        ...config
      }).catch(error => {
        logger.error('导出失败', { module: 'export', taskId, error })
      })
      
      eventBus.publish('export:started', { taskId })
      
      return { success: true, message: '导出已开始' }
    } catch (error: any) {
      logger.error('启动导出任务失败', { module: 'export', error })
      return { success: false, error: error.message }
    }
  })
  
  // 在文件夹中显示
  ipcMain.handle('export:file:open', async (event, payload) => {
    try {
      const { path } = payload
      shell.showItemInFolder(path)
      return { success: true }
    } catch (error: any) {
      logger.error('打开文件夹失败', { module: 'export', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('导出IPC处理器已注册', { module: 'ipc' })
}
```

### 检查点
- [ ] 导出Worker正常工作
- [ ] 支持批量文件复制
- [ ] 支持文件重命名规则
- [ ] ZIP压缩功能正常
- [ ] 导出进度正常更新
- [ ] 删除源文件功能正常(可选)
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查前后端导出接口对应正确
- 验证ZIP压缩质量和速度
- 确保文件删除安全性

---

## 🎯 阶段9: 完善用户界面

### 阶段目标
完善所有页面UI,实现完整的用户交互功能。

### 开发任务清单

#### 9.1 完善批量输入页面

参考UI设计文档,实现完整的批量输入页面(< 400行)

**功能要点**:
- 自动剪辑配置面板
- 音频素材管理(弹窗)
- 批量链接输入
- 从文件导入
- 创建批次任务
- 自动触发下载和剪辑

#### 9.2 完善视频管理页面

参考UI设计文档,实现完整的视频管理页面(< 500行,如超过则拆分为多个组件)

**功能要点**:
- 视图模式切换(全部/原视频/剪辑后/对比模式)
- 对比模式双列表展示
- 实时进度显示
- 视频预览功能
- 批量操作(下载/导出/删除)

#### 9.3 完善导出下载页面

参考UI设计文档,实现完整的导出下载页面(< 400行)

**功能要点**:
- 导出配置面板
- 待导出视频列表
- 统计信息显示
- 导出进度对话框
- 完成后打开文件夹

#### 9.4 完善设置页面

实现完整的设置页面(< 300行)

**功能要点**:
- 通用设置(语言/主题/启动选项)
- 路径配置
- 性能设置
- 网络设置
- 数据管理

#### 9.5 创建公共组件

创建常用的公共组件(每个组件 < 200行):
- VideoCard.vue - 视频卡片
- TaskList.vue - 任务列表
- ProgressBar.vue - 进度条
- FileUploader.vue - 文件上传器

### 检查点
- [ ] 所有页面UI完整美观
- [ ] 用户交互流畅
- [ ] 表单验证正确
- [ ] 错误提示清晰
- [ ] 加载状态正常显示
- [ ] 所有组件文件 ≤ 600行

### 额外目标
- 仔细检查前后端所有接口调用正确
- 验证用户操作流程完整
- 确保UI响应式布局正常

---

## 🎯 阶段10: 测试与优化

### 阶段目标
全面测试应用功能,修复所有Bug,优化性能和用户体验。

### 开发任务清单

#### 10.1 功能测试

**下载功能测试**:
- [ ] 抖音视频下载
- [ ] 小红书视频下载
- [ ] Twitter视频下载
- [ ] YouTube视频下载
- [ ] 下载进度显示
- [ ] 下载失败重试
- [ ] 批量下载

**剪辑功能测试**:
- [ ] 倍速调节(0.5x - 2.0x)
- [ ] 镜像翻转(无/左右/上下)
- [ ] 锐化处理
- [ ] 静音原音
- [ ] 添加背景音乐
- [ ] 混音效果
- [ ] 剪辑进度显示
- [ ] 生成缩略图

**导出功能测试**:
- [ ] 单个视频导出
- [ ] 批量视频导出
- [ ] ZIP压缩
- [ ] 文件重命名规则
- [ ] 删除源文件
- [ ] 导出进度显示

**UI功能测试**:
- [ ] 页面导航
- [ ] 表单提交
- [ ] 文件选择
- [ ] 列表刷新
- [ ] 搜索筛选
- [ ] 视频预览
- [ ] 设置保存

#### 10.2 性能优化

**启动优化**:
- 延迟加载非必要模块
- 优化数据库查询
- 减少初始化时间

**运行优化**:
- 限制并发任务数
- 控制内存占用
- 优化FFmpeg参数
- 缓存视频信息

**界面优化**:
- 虚拟列表(大量视频时)
- 懒加载图片
- 防抖节流
- 动画流畅度

#### 10.3 错误处理

**添加全局错误处理**:
- 网络错误处理
- 文件操作错误处理
- FFmpeg处理错误处理
- 数据库错误处理

**用户提示优化**:
- 友好的错误提示
- 操作确认对话框
- 成功提示
- 警告提示

#### 10.4 日志完善

**补充日志记录**:
- 关键操作日志
- 错误详情日志
- 性能监控日志
- 用户行为日志

#### 10.5 文档完善

**更新文档**:
- [ ] README.md
- [ ] CHANGELOG.md
- [ ] 用户手册
- [ ] API文档

#### 10.6 代码检查

**代码质量检查**:
- [ ] ESLint检查通过
- [ ] TypeScript编译无错误
- [ ] 所有文件 ≤ 600行
- [ ] 移除console.log
- [ ] 移除未使用代码
- [ ] 代码格式统一

#### 10.7 打包测试

```powershell
# 构建项目
npm run build

# 打包应用
npm run dist
```

**测试安装包**:
- [ ] Windows安装包正常
- [ ] 应用启动正常
- [ ] 所有功能正常工作
- [ ] 卸载正常

### 检查点
- [ ] 所有功能测试通过
- [ ] 无严重Bug
- [ ] 性能达标
- [ ] 用户体验良好
- [ ] 代码质量合格
- [ ] 文档完整
- [ ] 打包成功

### 额外目标
- 进行压力测试(批量处理大量视频)
- 进行长时间运行测试
- 收集用户反馈

---

## 📝 全部阶段总结

完成阶段6-10后,你将拥有:

✅ **完整的业务功能**
- 视频下载(多平台支持)
- 视频剪辑(倍速/翻转/锐化/音频处理)
- 视频导出(批量/压缩/文件管理)

✅ **完善的用户界面**
- 批量输入页面
- 视频管理页面
- 导出下载页面
- 设置页面

✅ **稳定的应用质量**
- 全面的功能测试
- 性能优化
- 错误处理
- 日志记录

### 项目完成

恭喜!你已经完成了AutoCutVideo项目的全部开发阶段。

现在你可以:
1. 发布第一个正式版本
2. 收集用户反馈
3. 规划未来功能(如MCP集成、高级剪辑功能等)
4. 持续优化和维护

---

**文档维护**: AutoCutVideo 开发团队  
**最后更新**: 2025-11-13  
**版本**: v1.0.0

