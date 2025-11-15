import { initDownloadHandlers } from './download.ipc'
import { initEditHandlers } from './edit.ipc'
import { initExportHandlers } from './export.ipc'
import { initDatabaseHandlers } from './database.ipc'
import { initFileHandlers } from './file.ipc'
import { initSettingsHandlers } from './settings.ipc'
import { initSystemHandlers } from './system.ipc'
import { initWindowHandlers } from './window.ipc'
import { logger } from '../utils/logger'

export function initIpcHandlers(): void {
  try {
    initDownloadHandlers()
    initEditHandlers()
    initExportHandlers()
    initDatabaseHandlers()
    initFileHandlers()
    initSettingsHandlers()
    initSystemHandlers()
    initWindowHandlers()
    
    logger.info('所有IPC处理器已注册', { module: 'ipc' })
  } catch (error) {
    logger.error('IPC处理器注册失败', { module: 'ipc', error })
    throw error
  }
}

