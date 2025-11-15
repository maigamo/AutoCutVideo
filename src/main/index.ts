import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { initDatabase, closeDatabase } from './database/connection'
import { initIpcHandlers } from './ipc'
import { logger } from './utils/logger'
import { configService } from './services/ConfigService'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  })

  // 加载URL
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:10031')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 应用启动
app.whenReady().then(() => {
  try {
    // 初始化数据库
    initDatabase()
    logger.info('数据库初始化成功', { module: 'main' })

    // 加载配置
    configService.load()
    logger.info('配置加载成功', { module: 'main' })

    // 初始化IPC处理器
    initIpcHandlers()
    logger.info('IPC处理器初始化成功', { module: 'main' })

    // 创建窗口
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  } catch (error) {
    logger.error('应用启动失败', { module: 'main', error })
    app.quit()
  }
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出
app.on('before-quit', () => {
  try {
    closeDatabase()
    logger.info('数据库连接已关闭', { module: 'main' })
  } catch (error) {
    logger.error('关闭数据库时出错', { module: 'main', error })
  }
})

// 未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', { module: 'main', error })
})

process.on('unhandledRejection', (reason) => {
  logger.error('未处理的Promise拒绝', { module: 'main', reason })
})

export { mainWindow }

