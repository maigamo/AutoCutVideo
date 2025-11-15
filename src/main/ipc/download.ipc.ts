import { ipcMain } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'
import { downloadWorker } from '../workers/DownloadWorker'
import { eventBus } from '../services/EventBus'
import path from 'path'
import fs from 'fs'
import { configService } from '../services/ConfigService'
import { getRandomMusic } from '../utils/music.util'
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
  
  downloadWorker.on('completed', async ({ taskId, filePath }) => {
    dbService.updateTask(taskId, { 
      status: 'completed', 
      output_path: filePath,
      completed_at: new Date().toISOString()
    })
    
    // 创建视频记录
    const task = dbService.getTask(taskId)
    if (task) {
      // 获取文件大小
      let fileSize = 0
      try {
        const stats = fs.statSync(filePath)
        fileSize = stats.size
      } catch (error) {
        logger.warn('获取文件大小失败', { module: 'download', filePath, error })
      }
      
      const videoId = dbService.createVideo({
        batch_id: task.batch_id,
        filename: path.basename(filePath),
        file_path: filePath,
        file_size: fileSize,
        is_edited: false,
        source_task_id: taskId
      })
      
      // 如果有剪辑配置，自动创建并启动剪辑任务
      if (task.config) {
        try {
          const editConfig = JSON.parse(task.config)
          
          // 如果需要随机音乐，获取音乐文件路径
          if (editConfig.randomMusic) {
            const musicDir = configService.getActualPath('musicDir')
            const musicPath = await getRandomMusic(musicDir)
            if (musicPath) {
              editConfig.musicPath = musicPath
              logger.info('已选择随机背景音乐', { module: 'download', musicPath })
            } else {
              logger.warn('未找到可用的背景音乐文件，将不添加背景音乐', { module: 'download', musicDir })
            }
          }
          
          // 创建剪辑任务
          const editTaskId = dbService.createTask({
            batch_id: task.batch_id,
            type: 'edit',
            status: 'pending',
            input_path: filePath,
            config: JSON.stringify(editConfig),
            progress: 0
          })
          
          logger.info('自动创建剪辑任务', { 
            module: 'download', 
            downloadTaskId: taskId, 
            editTaskId, 
            videoId 
          })
          
          // 导入 editWorker 并启动剪辑
          const { editWorker } = await import('../workers/EditWorker')
          
          // 更新剪辑任务状态
          dbService.updateTask(editTaskId, { 
            status: 'running',
            started_at: new Date().toISOString()
          })
          
          // 生成输出路径：原文件名_edit.mp4
          const outputDir = configService.getActualPath('outputDir')
          const originalBasename = path.basename(filePath, path.extname(filePath))
          const filename = `${originalBasename}_edit.mp4`
          const outputPath = path.join(outputDir, filename)
          
          // 开始剪辑(异步)
          editWorker.editVideo({
            id: editTaskId,
            inputPath: filePath,
            outputPath,
            config: editConfig
          }).catch(error => {
            logger.error('自动剪辑失败', { module: 'download', editTaskId, error })
          })
          
          eventBus.publish('edit:started', { taskId: editTaskId })
          
          logger.info('自动剪辑已启动', { 
            module: 'download', 
            editTaskId, 
            inputPath: filePath 
          })
        } catch (error) {
          logger.error('自动启动剪辑失败', { 
            module: 'download', 
            taskId, 
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
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
      const { url, batchId, editConfig } = payload
      
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
        batch_id: batchId || null,
        type: 'download',
        status: 'pending',
        url,
        platform,
        config: editConfig ? JSON.stringify(editConfig) : null,
        progress: 0
      })
      
      logger.info('下载任务已创建', { module: 'download', taskId, url, batchId, platform })
      
      return { 
        success: true, 
        data: { id: taskId, url, platform, batchId },
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
      
      // 生成保存路径（使用getActualPath获取实际路径并自动创建目录）
      const downloadDir = configService.getActualPath('downloadDir')
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
      const { getDatabase } = await import('../database/connection')
      const db = getDatabase()
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
