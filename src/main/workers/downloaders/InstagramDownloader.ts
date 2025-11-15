import { Page, BrowserContext, Browser } from 'playwright'
import path from 'path'
import fs from 'fs'
import { logger } from '../../utils/logger'
import { DownloadTask } from '../DownloadWorker'

export class InstagramDownloader {
  /**
   * 使用 instasave.to 下载 Instagram 视频
   * @param browser Playwright浏览器实例
   * @param task 下载任务
   * @param onProgress 进度回调
   * @returns 下载的视频文件路径
   */
  static async download(
    browser: Browser, 
    task: DownloadTask, 
    onProgress: (progress: number) => void
  ): Promise<string> {
    // 创建带有自定义User-Agent的浏览器上下文
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      acceptDownloads: true // 关键：允许下载
    })
    
    const page = await context.newPage()
    
    // 移除webdriver标识
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      })
    })
    
    try {
      // 生成文件名：IG + 日期时间
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0]
      const filename = `IG_${timestamp}.mp4`
      const savePath = path.join(path.dirname(task.savePath), filename)
      
      logger.debug('正在访问instasave.to...', { 
        module: 'download', 
        taskId: task.id,
        filename,
        url: task.url
      })
      
      // 1. 访问instasave.to首页
      await page.goto('https://instasave.to/', { 
        waitUntil: 'networkidle',
        timeout: 90000
      })
      
      logger.debug('页面加载成功，准备输入链接...', { 
        module: 'download', 
        taskId: task.id
      })
      
      onProgress(20)
      
      // 2. 粘贴 Instagram 链接
      await page.fill('input#s_input[name="q"]', task.url)
      
      logger.debug('已输入链接，准备点击下载按钮...', { 
        module: 'download', 
        taskId: task.id
      })
      
      onProgress(40)
      
      // 3. 点击 Download 按钮
      await page.click('button[onclick*="ksearchvideo"]')
      
      logger.debug('已点击下载按钮，等待下载链接生成...', { 
        module: 'download', 
        taskId: task.id
      })
      
      onProgress(50)
      
      // 4. 等待"Download Video"按钮出现并点击
      const downBtn = await page.waitForSelector('a.abutton.is-success.is-fullwidth:has-text("Download Video")', {
        timeout: 30000,
      })
      
      logger.debug('下载链接已出现，准备点击...', { 
        module: 'download', 
        taskId: task.id
      })
      
      onProgress(70)
      
      // 点击下载链接并等待下载事件
      const [download] = await Promise.all([
        page.waitForEvent('download'), // 等待下载事件
        downBtn.click()                // 点击下载
      ])
      
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
      
      logger.info('Instagram视频下载完成', { 
        module: 'download',
        taskId: task.id,
        savePath,
        fileSize: `${fileSizeMB}MB`
      })
      
      onProgress(90)
      
      return savePath
    } catch (error) {
      logger.error('Instagram视频下载失败', { 
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
}

