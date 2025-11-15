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
      
      // 生成输出路径（使用实际路径，优先使用自定义路径）
      const outputDir = configService.getActualPath('outputDir')
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
