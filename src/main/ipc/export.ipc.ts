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
