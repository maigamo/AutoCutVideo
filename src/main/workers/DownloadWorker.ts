import { chromium, Browser, Page } from 'playwright'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'
import { logger } from '../utils/logger'
import { configService } from '../services/ConfigService'
import { InstagramDownloader } from './downloaders/InstagramDownloader'

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
      logger.info('正在启动Playwright浏览器...', { module: 'download' })
      
      this.browser = await chromium.launch({
        headless: false, // 设置为可视化模式以便检查
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
      
      logger.info('Playwright浏览器启动成功', { 
        module: 'download',
        headless: false,
        downloadsPath: configService.getActualPath('downloadDir')
      })
    } catch (error) {
      logger.error('Playwright浏览器启动失败', { 
        module: 'download', 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }
  
  async shutdown(): Promise<void> {
    if (this.browser) {
      logger.info('正在关闭Playwright浏览器...', { module: 'download' })
      await this.browser.close()
      this.browser = null
      logger.info('Playwright浏览器已关闭', { module: 'download' })
    }
  }
  
  async downloadVideo(task: DownloadTask): Promise<string> {
    if (!this.browser) {
      const error = new Error('浏览器未初始化')
      logger.error('下载失败：浏览器未初始化', { 
        module: 'download',
        taskId: task.id,
        url: task.url
      })
      throw error
    }
    
    this.isRunning = true
    const startTime = Date.now()
    
    logger.info('开始下载视频', { 
      module: 'download',
      taskId: task.id,
      url: task.url,
      platform: task.platform
    })
    
    try {
      const platform = this.detectPlatform(task.url)
      logger.debug('检测到视频平台', { 
        module: 'download',
        taskId: task.id,
        platform 
      })
      
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
        case 'instagram':
          filePath = await this.downloadFromInstagram(task)
          break
        default:
          throw new Error(`不支持的平台: ${platform}`)
      }
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      
      this.emit('progress', { taskId: task.id, progress: 100 })
      this.emit('completed', { taskId: task.id, filePath })
      
      logger.info('视频下载成功', { 
        module: 'download',
        taskId: task.id,
        url: task.url,
        platform,
        filePath,
        duration: `${duration}s`
      })
      
      return filePath
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      
      logger.error('视频下载失败', { 
        module: 'download',
        taskId: task.id,
        url: task.url,
        platform: task.platform,
        duration: `${duration}s`,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
    }
  }
  
  detectPlatform(url: string): string {
    if (url.includes('douyin.com') || url.includes('tiktok.com')) return 'douyin'
    if (url.includes('xiaohongshu.com')) return 'xiaohongshu'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('instagram.com')) return 'instagram'
    return 'unknown'
  }
  
  private async downloadFromDouyin(task: DownloadTask): Promise<string> {
    // 创建带有自定义User-Agent的浏览器上下文
    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    })
    
    const page = await context.newPage()
    
    // 移除webdriver标识
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      })
    })
    
    try {
      // 生成文件名：平台缩写 + 日期时间
      const platform = task.url.includes('tiktok.com') ? 'TT' : 'DY'
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0]
      const filename = `${platform}_${timestamp}.mp4`
      const savePath = path.join(path.dirname(task.savePath), filename)
      
      logger.debug('正在访问ssstik.li...', { 
        module: 'download', 
        taskId: task.id,
        filename,
        url: task.url
      })
      
      // 访问ssstik.li首页
      await page.goto('https://ssstik.li/', {
        waitUntil: 'domcontentloaded',
        timeout: 90000 // 增加超时时间到90秒
      })
      
      logger.debug('页面加载成功，准备输入链接...', { 
        module: 'download', 
        taskId: task.id
      })
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      // 使用getByRole查找Search输入框（会自动等待元素出现）
      const searchBox = page.getByRole('textbox', { name: 'Search' })
      
      // 点击输入框
      await searchBox.click({ timeout: 30000 })
      
      logger.debug('已点击输入框，准备填写链接...', { 
        module: 'download', 
        taskId: task.id
      })
      
      // 填写TikTok链接
      await searchBox.fill(task.url, { timeout: 30000 })
      
      logger.debug('已输入链接，准备点击下载按钮...', { 
        module: 'download', 
        taskId: task.id
      })
      
      this.emit('progress', { taskId: task.id, progress: 40 })
      
      // 使用getByRole查找并点击Download按钮（会自动等待）
      await page.getByRole('button', { name: 'Download' }).click({ timeout: 30000 })
      
      logger.debug('已点击下载按钮，等待下载链接生成...', { 
        module: 'download', 
        taskId: task.id
      })
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      logger.debug('等待下载链接生成...', { module: 'download', taskId: task.id })
      
      // 等待并查找下载链接
      try {
        // 使用getByRole查找 "Download MP4 HD" 链接（会自动等待元素出现）
        const downloadLink = page.getByRole('link', { name: 'Download MP4 HD' })
        
        logger.debug('开始等待下载链接出现...', { module: 'download', taskId: task.id })
        
        // 等待链接可见（增加超时时间到60秒）
        await downloadLink.waitFor({ state: 'visible', timeout: 60000 })
        
        logger.debug('下载链接已出现，准备点击...', { 
          module: 'download', 
          taskId: task.id
        })
        
        this.emit('progress', { taskId: task.id, progress: 70 })
        
        // 点击下载链接并等待下载事件
        const downloadPromise = page.waitForEvent('download', { timeout: 90000 })
        await downloadLink.click({ timeout: 30000 })
        
        logger.debug('已点击下载链接，等待下载开始...', { 
          module: 'download', 
          taskId: task.id
        })
        
        const download = await downloadPromise
        
        this.emit('progress', { taskId: task.id, progress: 70 })
        
        logger.debug('正在保存文件...', { 
          module: 'download', 
          taskId: task.id,
          savePath 
        })
        
        // 确保目录存在
        const dir = path.dirname(savePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        
        // 保存文件
        await download.saveAs(savePath)
        
        // 获取文件信息
        const stats = fs.statSync(savePath)
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
        
        logger.info('TikTok/抖音视频下载完成', { 
          module: 'download',
          taskId: task.id,
          savePath,
          fileSize: `${fileSizeMB}MB`
        })
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
        return savePath
      } catch (error) {
        // 如果出现错误，保存截图用于调试
        logger.error('下载过程失败', {
          module: 'download',
          taskId: task.id,
          url: task.url,
          error: error instanceof Error ? error.message : String(error)
        })
        
        // 保存页面截图用于调试
        try {
          const screenshotPath = path.join(path.dirname(task.savePath), `debug_${task.id}.png`)
          await page.screenshot({ path: screenshotPath, fullPage: true })
          logger.debug('已保存调试截图', { 
            module: 'download', 
            taskId: task.id, 
            screenshotPath 
          })
        } catch (screenshotError) {
          logger.warn('保存截图失败', { 
            module: 'download', 
            error: String(screenshotError) 
          })
        }
        
        throw error
      }
    } catch (error) {
      logger.error('TikTok/抖音视频下载失败', { 
        module: 'download', 
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    } finally {
      await page.close()
      await context.close()
    }
  }
  
  private async downloadFromXiaohongshu(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      logger.debug('正在访问godownloader.app...', { module: 'download', taskId: task.id })
      
      // 使用godownloader.app下载小红书视频
      await page.goto('https://godownloader.app/zh/xiaohongshu-downloader')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      logger.debug('正在提交下载请求...', { module: 'download', taskId: task.id })
      await page.fill('input[type="text"]', task.url)
      await page.click('button[type="submit"]')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      logger.debug('等待下载链接生成...', { module: 'download', taskId: task.id })
      await page.waitForSelector('a[download]', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('a[download]', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      logger.debug('获取到下载链接', { module: 'download', taskId: task.id })
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } catch (error) {
      logger.error('小红书视频下载失败', { 
        module: 'download', 
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromTwitter(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      logger.debug('正在访问xdown.app...', { module: 'download', taskId: task.id })
      
      await page.goto('https://xdown.app/')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      logger.debug('正在提交下载请求...', { module: 'download', taskId: task.id })
      await page.fill('input[type="url"]', task.url)
      await page.click('button[type="submit"]')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      logger.debug('等待下载链接生成...', { module: 'download', taskId: task.id })
      await page.waitForSelector('.download-link', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('.download-link', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      logger.debug('获取到下载链接', { module: 'download', taskId: task.id })
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } catch (error) {
      logger.error('Twitter视频下载失败', { 
        module: 'download', 
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromYoutube(task: DownloadTask): Promise<string> {
    const page = await this.browser!.newPage()
    
    try {
      logger.debug('正在访问savefrom.net...', { module: 'download', taskId: task.id })
      
      await page.goto('https://savefrom.net/')
      
      this.emit('progress', { taskId: task.id, progress: 20 })
      
      logger.debug('正在提交下载请求...', { module: 'download', taskId: task.id })
      await page.fill('input#sf_url', task.url)
      await page.click('button#sf_submit')
      
      this.emit('progress', { taskId: task.id, progress: 50 })
      
      logger.debug('等待下载链接生成...', { module: 'download', taskId: task.id })
      await page.waitForSelector('.def-btn-box a', { timeout: 30000 })
      
      const downloadUrl = await page.getAttribute('.def-btn-box a', 'href')
      if (!downloadUrl) {
        throw new Error('未找到下载链接')
      }
      
      logger.debug('获取到下载链接', { module: 'download', taskId: task.id })
      const downloadPath = await this.downloadFile(page, downloadUrl, task.savePath)
      
      this.emit('progress', { taskId: task.id, progress: 90 })
      
      return downloadPath
    } catch (error) {
      logger.error('YouTube视频下载失败', { 
        module: 'download', 
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    } finally {
      await page.close()
    }
  }
  
  private async downloadFromInstagram(task: DownloadTask): Promise<string> {
    return await InstagramDownloader.download(
      this.browser!,
      task,
      (progress) => this.emit('progress', { taskId: task.id, progress })
    )
  }
  
  private async downloadFile(page: Page, url: string, savePath: string): Promise<string> {
    logger.debug('准备下载文件', { 
      module: 'download', 
      url, 
      savePath 
    })
    
    // 确保目录存在
    const dir = path.dirname(savePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      logger.debug('已创建下载目录', { module: 'download', dir })
    }
    
    try {
      // 监听下载事件
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.goto(url)
      ])
      
      logger.debug('正在保存文件...', { module: 'download', savePath })
      
      // 保存文件
      await download.saveAs(savePath)
      
      // 获取文件信息
      const stats = fs.statSync(savePath)
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
      
      logger.info('文件下载完成', { 
        module: 'download', 
        savePath,
        fileSize: `${fileSizeMB}MB`
      })
      
      return savePath
    } catch (error) {
      logger.error('文件下载失败', { 
        module: 'download', 
        url,
        savePath,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

export const downloadWorker = new DownloadWorker()

