import { ipcMain, BrowserWindow } from 'electron'
import { logger } from '../utils/logger'

export function initWindowHandlers(): void {
  // 最小化窗口
  ipcMain.on('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.minimize()
  })
  
  // 最大化/还原窗口
  ipcMain.on('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window?.isMaximized()) {
      window.unmaximize()
    } else {
      window?.maximize()
    }
  })
  
  // 关闭窗口
  ipcMain.on('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.close()
  })
  
  // 设置窗口标题
  ipcMain.on('window:setTitle', (event, title: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    window?.setTitle(title)
  })
  
  logger.debug('窗口IPC处理器已注册', { module: 'ipc' })
}

