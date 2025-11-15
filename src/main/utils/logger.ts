import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// 日志配置接口
export interface LoggerConfig {
  level?: 'error' | 'warn' | 'info' | 'debug'
  maxFileSize?: number // MB
  maxFiles?: number // 天数
  consoleOutput?: boolean
  logDir?: string
}

// 获取项目根目录
function getProjectRoot(): string {
  if (process.env.NODE_ENV === 'development') {
    return process.cwd()
  }
  return path.dirname(app.getPath('exe'))
}

// 默认配置
const defaultConfig: Required<LoggerConfig> = {
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  maxFileSize: 20, // 20MB
  maxFiles: 365, // 保留1年
  consoleOutput: true,
  logDir: path.join(getProjectRoot(), 'logs') // 使用项目根目录
}

let currentConfig = { ...defaultConfig }

// 确保日志目录存在
function ensureLogDir(logDir: string): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

ensureLogDir(currentConfig.logDir)

// 创建增强的日志格式
const createLogFormat = () => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, module, stack, ...meta }) => {
      // 基础日志格式
      let logMessage = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] [${(module || 'app').padEnd(12)}] ${message}`
      
      // 添加元数据（排除空对象）
      const metaKeys = Object.keys(meta).filter(key => 
        meta[key] !== undefined && 
        meta[key] !== null && 
        key !== 'timestamp' && 
        key !== 'level' && 
        key !== 'message'
      )
      
      if (metaKeys.length > 0) {
        const metaObj: any = {}
        metaKeys.forEach(key => {
          metaObj[key] = meta[key]
        })
        logMessage += ` ${JSON.stringify(metaObj, null, 2)}`
      }
      
      // 添加堆栈信息（如果有错误）
      if (stack) {
        logMessage += `\n${stack}`
      }
      
      return logMessage
    })
  )
}

// 创建日志传输器
function createTransports(config: Required<LoggerConfig>): winston.transport[] {
  const transports: winston.transport[] = []
  
  // 控制台输出
  if (config.consoleOutput) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          createLogFormat()
        )
      })
    )
  }
  
  // 文件输出 - 所有日志（使用UTF-8编码）
  transports.push(
    new DailyRotateFile({
      dirname: config.logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: `${config.maxFileSize}m`,
      maxFiles: `${config.maxFiles}d`,
      format: createLogFormat(),
      zippedArchive: true,
      options: { flags: 'a', encoding: 'utf8' }
    })
  )
  
  // 文件输出 - 错误日志（使用UTF-8编码）
  transports.push(
    new DailyRotateFile({
      dirname: config.logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: `${config.maxFileSize}m`,
      maxFiles: `${config.maxFiles}d`,
      format: createLogFormat(),
      zippedArchive: true,
      options: { flags: 'a', encoding: 'utf8' }
    })
  )
  
  // 文件输出 - 下载日志（使用UTF-8编码）
  transports.push(
    new DailyRotateFile({
      dirname: config.logDir,
      filename: 'download-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: `${config.maxFileSize}m`,
      maxFiles: `${config.maxFiles}d`,
      format: winston.format.combine(
        winston.format((info) => {
          // 只记录下载相关的日志
          return info.module === 'download' ? info : false
        })(),
        createLogFormat()
      ),
      zippedArchive: true,
      options: { flags: 'a', encoding: 'utf8' }
    })
  )
  
  return transports
}

// 创建logger实例
let loggerInstance = winston.createLogger({
  level: currentConfig.level,
  format: createLogFormat(),
  transports: createTransports(currentConfig)
})

// 导出logger
export const logger = {
  error: (message: string, meta?: any) => {
    loggerInstance.error(message, meta)
  },
  
  warn: (message: string, meta?: any) => {
    loggerInstance.warn(message, meta)
  },
  
  info: (message: string, meta?: any) => {
    loggerInstance.info(message, meta)
  },
  
  debug: (message: string, meta?: any) => {
    loggerInstance.debug(message, meta)
  },
  
  /**
   * 更新日志配置
   */
  updateConfig: (config: LoggerConfig) => {
    currentConfig = { ...currentConfig, ...config }
    
    // 确保日志目录存在
    ensureLogDir(currentConfig.logDir)
    
    // 重新创建logger实例
    loggerInstance.close()
    loggerInstance = winston.createLogger({
      level: currentConfig.level,
      format: createLogFormat(),
      transports: createTransports(currentConfig)
    })
    
    logger.info('日志配置已更新', { 
      module: 'logger', 
      config: currentConfig 
    })
  },
  
  /**
   * 获取当前配置
   */
  getConfig: (): Required<LoggerConfig> => {
    return { ...currentConfig }
  },
  
  /**
   * 清理旧日志文件
   */
  cleanOldLogs: (daysToKeep: number = currentConfig.maxFiles) => {
    try {
      const files = fs.readdirSync(currentConfig.logDir)
      const now = Date.now()
      const keepTime = daysToKeep * 24 * 60 * 60 * 1000
      
      let cleanedCount = 0
      files.forEach(file => {
        const filePath = path.join(currentConfig.logDir, file)
        const stats = fs.statSync(filePath)
        
        if (now - stats.mtimeMs > keepTime) {
          fs.unlinkSync(filePath)
          cleanedCount++
        }
      })
      
      if (cleanedCount > 0) {
        logger.info(`已清理 ${cleanedCount} 个旧日志文件`, { module: 'logger' })
      }
    } catch (error) {
      logger.error('清理旧日志失败', { module: 'logger', error })
    }
  },
  
  /**
   * 获取日志文件列表
   */
  getLogFiles: (): Array<{ name: string; size: number; mtime: Date }> => {
    try {
      const files = fs.readdirSync(currentConfig.logDir)
      return files.map(file => {
        const filePath = path.join(currentConfig.logDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: stats.size,
          mtime: stats.mtime
        }
      }).sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    } catch (error) {
      logger.error('获取日志文件列表失败', { module: 'logger', error })
      return []
    }
  }
}

// 导出默认logger
export default logger

// 定期清理旧日志（每天检查一次）
setInterval(() => {
  logger.cleanOldLogs()
}, 24 * 60 * 60 * 1000)
