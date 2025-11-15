import { ipcMain, shell, app } from 'electron'
import { logger } from '../utils/logger'
import os from 'os'

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

