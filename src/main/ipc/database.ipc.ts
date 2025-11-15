import { ipcMain, shell } from 'electron'
import { logger } from '../utils/logger'
import { dbService } from '../services/DatabaseService'
import { getDatabase } from '../database/connection'
import fs from 'fs'
import path from 'path'

export function initDatabaseHandlers(): void {
  // 创建批次
  ipcMain.handle('db:batch:create', async (event, data: any) => {
    try {
      const batchId = dbService.createBatchTask({
        name: data.name,
        status: 'pending',
        total_videos: data.total_count || 0,
        completed_videos: 0,
        failed_videos: 0,
        edit_config: JSON.stringify(data.edit_config || {})
      })
      
      const batch = dbService.getBatchTask(batchId)
      logger.info('批次创建成功', { module: 'database', batchId, name: data.name })
      
      return { success: true, data: batch }
    } catch (error: any) {
      logger.error('创建批次失败', { module: 'database', error })
      return { success: false, error: error.message }
    }
  })
  
  // 查询任务
  ipcMain.handle('db:query:tasks', async (event, filter: any = {}) => {
    try {
      const { type, status, batch_id } = filter
      const db = getDatabase()
      
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
      const db = getDatabase()
      
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
      const db = getDatabase()
      
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
  
  // 获取视频列表（前端使用）
  ipcMain.handle('database:videos:list', async (event, filter: any = {}) => {
    try {
      const { is_edited, batch_id } = filter
      
      // 使用 dbService 替代直接数据库操作
      let videos: any[]
      
      if (is_edited !== undefined) {
        videos = dbService.getVideosByType(is_edited)
      } else {
        videos = dbService.getAllVideos()
      }
      
      // 如果有 batch_id 过滤，进一步筛选
      if (batch_id) {
        videos = videos.filter(v => v.batch_id === batch_id)
      }
      
      return { success: true, data: videos }
    } catch (error: any) {
      logger.error('获取视频列表失败', { module: 'database', error })
      return { success: false, error: error.message }
    }
  })
  
  // 下载视频文件（在文件资源管理器中显示）
  ipcMain.handle('video:download', async (event, payload: { videoId: number }) => {
    try {
      const { videoId } = payload
      const video = dbService.getVideo(videoId)
      
      if (!video) {
        return { success: false, error: '视频不存在' }
      }
      
      if (!fs.existsSync(video.file_path)) {
        return { success: false, error: '视频文件不存在' }
      }
      
      // 在文件资源管理器中显示文件
      shell.showItemInFolder(video.file_path)
      
      logger.info('视频文件已在资源管理器中显示', { module: 'video', videoId, filePath: video.file_path })
      
      return { success: true, message: '已在资源管理器中显示' }
    } catch (error: any) {
      logger.error('下载视频失败', { module: 'video', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('数据库IPC处理器已注册', { module: 'ipc' })
}
