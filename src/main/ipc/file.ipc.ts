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

