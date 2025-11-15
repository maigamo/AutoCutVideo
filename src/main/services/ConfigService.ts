import Store from 'electron-store'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { logger } from '../utils/logger'

// 获取项目根目录
function getProjectRoot(): string {
  // 如果是开发环境，返回项目根目录
  if (process.env.NODE_ENV === 'development') {
    return process.cwd()
  }
  // 如果是生产环境，返回可执行文件所在目录
  return path.dirname(app.getPath('exe'))
}

export interface AppConfig {
  general: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    startOnBoot: boolean
    minimizeToTray: boolean
  }
  paths: {
    downloadDir: string
    outputDir: string
    musicDir: string
    tempDir: string
    customDownloadDir?: string
    customOutputDir?: string
    customMusicDir?: string
    customTempDir?: string
  }
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug'
    maxFileSize: number // MB
    maxFiles: number // 天数
    consoleOutput: boolean
    logDir?: string // 日志目录路径
  }
  performance: {
    maxConcurrentTasks: number
    memoryLimit: number
    hardwareAccel: 'auto' | 'nvenc' | 'qsv' | 'amf' | 'none'
    ffmpegThreads: number
  }
  network: {
    proxy: string
    timeout: number
    retryCount: number
  }
  editing: {
    defaultSpeed: number
    defaultSharpen: number
    defaultCRF: number
    defaultPreset: string
    defaultFlip: 'none' | 'h' | 'v'
    muteOriginalAudio: boolean
    randomMusic: boolean
    // 画质增强配置
    defaultResolution: string  // 分辨率，如 '2560x1440' (2K)
    defaultFps: number         // 帧率，如 60
    defaultVideoBitrate: string // 视频码率，如 '20000k' (20Mbps)
  }
}

const projectRoot = getProjectRoot()

const defaultConfig: AppConfig = {
  general: {
    language: 'zh-CN',
    theme: 'auto',
    startOnBoot: false,
    minimizeToTray: true
  },
  paths: {
    downloadDir: path.join(projectRoot, 'videos', 'raw'),
    outputDir: path.join(projectRoot, 'videos', 'edited'),
    musicDir: path.join(projectRoot, 'music'),
    tempDir: path.join(projectRoot, 'videos', 'temp')
  },
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    maxFileSize: 20, // 20MB
    maxFiles: 365, // 保留1年
    consoleOutput: true,
    logDir: path.join(projectRoot, 'logs') // 日志目录设置为项目根目录下的logs文件夹
  },
  performance: {
    maxConcurrentTasks: 3,
    memoryLimit: 2048,
    hardwareAccel: 'auto',
    ffmpegThreads: 4
  },
  network: {
    proxy: '',
    timeout: 60000,
    retryCount: 3
  },
  editing: {
    defaultSpeed: 1.2,
    defaultSharpen: 0.1,
    defaultCRF: 0,  // CRF值越小画质越好，0为无损质量
    defaultPreset: 'veryslow',  // veryslow为最高画质的编码预设
    defaultFlip: 'none',
    muteOriginalAudio: true,
    randomMusic: true,
    // 画质增强配置
    defaultResolution: '2560x1440',  // 2K分辨率
    defaultFps: 60,                   // 60帧
    defaultVideoBitrate: '20000k'     // 20Mbps
  }
}

class ConfigService {
  private store: Store<AppConfig>
  private defaultPaths: AppConfig['paths']
  
  constructor() {
    this.store = new Store<AppConfig>({
      defaults: defaultConfig
    })
    this.defaultPaths = defaultConfig.paths
    
    // 修复旧的AppData路径问题
    this.fixLegacyPaths()
    
    // 确保默认路径存在
    this.ensureDefaultDirectories()
    
    // 初始化日志配置（延迟导入避免循环依赖）
    this.initializeLogger()
  }
  
  /**
   * 修复旧的AppData路径问题
   * 如果路径中包含AppData，则强制更新为项目根目录
   */
  private fixLegacyPaths(): void {
    try {
      const paths = this.get('paths')
      let needUpdate = false
      
      // 检查每个路径是否包含AppData
      const pathKeys: Array<'downloadDir' | 'outputDir' | 'musicDir' | 'tempDir'> = 
        ['downloadDir', 'outputDir', 'musicDir', 'tempDir']
      
      pathKeys.forEach(key => {
        const currentPath = paths[key]
        if (currentPath && currentPath.includes('AppData')) {
          // 使用默认的项目根目录路径替换
          paths[key] = this.defaultPaths[key]
          needUpdate = true
          console.log(`已修复路径 ${key}: ${currentPath} -> ${this.defaultPaths[key]}`)
        }
      })
      
      if (needUpdate) {
        this.set('paths', paths)
        console.log('路径配置已更新为项目根目录')
      }
    } catch (error) {
      console.error('修复路径配置失败:', error)
    }
  }
  
  /**
   * 初始化日志配置
   */
  private initializeLogger(): void {
    // 使用setTimeout延迟初始化，避免循环依赖
    setTimeout(() => {
      try {
        const loggingConfig = this.get('logging')
        logger.updateConfig({
          level: loggingConfig.level,
          maxFileSize: loggingConfig.maxFileSize,
          maxFiles: loggingConfig.maxFiles,
          consoleOutput: loggingConfig.consoleOutput
        })
      } catch (error) {
        console.error('初始化日志配置失败:', error)
      }
    }, 0)
  }
  
  /**
   * 确保默认目录存在
   */
  private ensureDefaultDirectories(): void {
    const paths = [
      this.defaultPaths.downloadDir,
      this.defaultPaths.outputDir,
      this.defaultPaths.musicDir,
      this.defaultPaths.tempDir
    ]
    
    paths.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }
  
  load(): AppConfig {
    return this.store.store
  }
  
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.store.get(key)
  }
  
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.store.set(key, value)
  }
  
  reset(): void {
    this.store.clear()
    this.store.store = defaultConfig
  }
  
  getAll(): AppConfig {
    return this.store.store
  }
  
  setAll(config: Partial<AppConfig>): void {
    Object.entries(config).forEach(([key, value]) => {
      this.store.set(key as keyof AppConfig, value as any)
    })
  }
  
  /**
   * 获取默认路径配置
   */
  getDefaultPaths(): AppConfig['paths'] {
    return { ...this.defaultPaths }
  }
  
  /**
   * 判断路径是否为用户自定义
   */
  isCustomPath(pathType: 'downloadDir' | 'outputDir' | 'musicDir' | 'tempDir'): boolean {
    const paths = this.get('paths')
    const customKey = `custom${pathType.charAt(0).toUpperCase() + pathType.slice(1)}` as keyof AppConfig['paths']
    return !!paths[customKey]
  }
  
  /**
   * 获取实际使用的路径（优先使用自定义路径）
   * 自动创建目录如果不存在
   */
  getActualPath(pathType: 'downloadDir' | 'outputDir' | 'musicDir' | 'tempDir'): string {
    const paths = this.get('paths')
    const customKey = `custom${pathType.charAt(0).toUpperCase() + pathType.slice(1)}` as keyof AppConfig['paths']
    const actualPath = (paths[customKey] as string) || paths[pathType]
    
    // 确保目录存在
    if (!fs.existsSync(actualPath)) {
      try {
        fs.mkdirSync(actualPath, { recursive: true })
        logger.debug('已自动创建目录', { module: 'config', path: actualPath })
      } catch (error) {
        logger.error('创建目录失败', { 
          module: 'config', 
          path: actualPath,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    return actualPath
  }
  
  /**
   * 设置自定义路径
   */
  setCustomPath(
    pathType: 'downloadDir' | 'outputDir' | 'musicDir' | 'tempDir',
    customPath: string | null
  ): void {
    const paths = this.get('paths')
    const customKey = `custom${pathType.charAt(0).toUpperCase() + pathType.slice(1)}` as keyof AppConfig['paths']
    
    if (customPath) {
      // 设置自定义路径
      paths[customKey] = customPath as any
      // 确保目录存在
      if (!fs.existsSync(customPath)) {
        fs.mkdirSync(customPath, { recursive: true })
      }
    } else {
      // 清除自定义路径，恢复默认
      delete paths[customKey]
    }
    
    this.set('paths', paths)
  }
  
  /**
   * 获取项目根目录
   */
  getProjectRoot(): string {
    return projectRoot
  }
}

export const configService = new ConfigService()

