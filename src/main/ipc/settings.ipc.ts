import { ipcMain, dialog } from 'electron'
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
  
  // 获取默认路径配置
  ipcMain.handle('settings:paths:defaults', async () => {
    try {
      const defaultPaths = configService.getDefaultPaths()
      return { success: true, data: defaultPaths }
    } catch (error: any) {
      logger.error('获取默认路径失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 判断路径是否为自定义
  ipcMain.handle('settings:paths:isCustom', async (event, pathType: string) => {
    try {
      const isCustom = configService.isCustomPath(pathType as any)
      return { success: true, data: isCustom }
    } catch (error: any) {
      logger.error('判断路径类型失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 选择自定义路径
  ipcMain.handle('settings:paths:select', async (event, pathType: string) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: '选择目录',
        buttonLabel: '选择'
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0]
        configService.setCustomPath(pathType as any, selectedPath)
        logger.info('已设置自定义路径', { module: 'settings', pathType, path: selectedPath })
        return { success: true, data: selectedPath }
      }
      
      return { success: false, error: '未选择路径' }
    } catch (error: any) {
      logger.error('选择路径失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 恢复默认路径
  ipcMain.handle('settings:paths:resetToDefault', async (event, pathType: string) => {
    try {
      configService.setCustomPath(pathType as any, null)
      const defaultPath = configService.getActualPath(pathType as any)
      logger.info('已恢复默认路径', { module: 'settings', pathType, path: defaultPath })
      return { success: true, data: defaultPath }
    } catch (error: any) {
      logger.error('恢复默认路径失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  // 保存设置
  ipcMain.handle('settings:set', async (event, config: any) => {
    try {
      configService.setAll(config)
      logger.info('设置已保存', { module: 'settings' })
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
      logger.info('设置已重置', { module: 'settings' })
      return { success: true, message: '设置已重置' }
    } catch (error: any) {
      logger.error('重置设置失败', { module: 'settings', error })
      return { success: false, error: error.message }
    }
  })
  
  logger.debug('设置IPC处理器已注册', { module: 'ipc' })
}

