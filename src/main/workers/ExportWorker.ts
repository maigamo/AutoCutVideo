import { EventEmitter } from 'events'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { logger } from '../utils/logger'

export interface ExportTask {
  id: number
  videoIds: number[]
  outputDir: string
  compress: boolean
  zipName?: string
  renameRule: 'keep' | 'prefix' | 'suffix' | 'timestamp'
  prefix?: string
  suffix?: string
  deleteSource: boolean
}

export class ExportWorker extends EventEmitter {
  private isRunning = false
  
  async exportVideos(task: ExportTask): Promise<string> {
    if (this.isRunning) {
      throw new Error('已有导出任务正在运行')
    }
    
    this.isRunning = true
    
    try {
      logger.info('开始导出视频', { module: 'export', task })
      
      // 确保输出目录存在
      if (!fs.existsSync(task.outputDir)) {
        fs.mkdirSync(task.outputDir, { recursive: true })
      }
      
      const { dbService } = require('../services/DatabaseService')
      
      // 获取视频列表
      const videos = task.videoIds.map(id => dbService.getVideo(id)).filter(Boolean)
      
      if (videos.length === 0) {
        throw new Error('没有找到要导出的视频')
      }
      
      this.emit('progress', { taskId: task.id, progress: 10, step: '准备导出' })
      
      // 复制/重命名文件
      const exportedFiles: string[] = []
      let currentIndex = 0
      
      for (const video of videos) {
        const sourcePath = video.file_path
        
        if (!fs.existsSync(sourcePath)) {
          logger.warn('源文件不存在', { module: 'export', sourcePath })
          continue
        }
        
        // 生成目标文件名
        let filename = path.basename(sourcePath)
        const ext = path.extname(filename)
        const basename = path.basename(filename, ext)
        
        switch (task.renameRule) {
          case 'prefix':
            filename = `${task.prefix || ''}${filename}`
            break
          case 'suffix':
            filename = `${basename}${task.suffix || ''}${ext}`
            break
          case 'timestamp':
            filename = `${basename}_${Date.now()}${ext}`
            break
          default:
            // keep
            break
        }
        
        const targetPath = path.join(task.outputDir, filename)
        
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath)
        exportedFiles.push(targetPath)
        
        currentIndex++
        const progress = 10 + Math.floor((currentIndex / videos.length) * (task.compress ? 50 : 80))
        this.emit('progress', { taskId: task.id, progress, step: `复制文件 ${currentIndex}/${videos.length}` })
      }
      
      let resultPath = task.outputDir
      
      // 压缩为ZIP
      if (task.compress) {
        const zipName = task.zipName || `export_${Date.now()}.zip`
        const zipPath = path.join(task.outputDir, zipName)
        
        await this.createZip(exportedFiles, zipPath, (progress) => {
          const totalProgress = 60 + Math.floor(progress * 0.3)
          this.emit('progress', { taskId: task.id, progress: totalProgress, step: '压缩文件' })
        })
        
        // 删除已压缩的文件
        exportedFiles.forEach(file => {
          try {
            fs.unlinkSync(file)
          } catch (error) {
            logger.warn('删除临时文件失败', { module: 'export', file, error })
          }
        })
        
        resultPath = zipPath
      }
      
      // 删除源文件
      if (task.deleteSource) {
        this.emit('progress', { taskId: task.id, progress: 95, step: '清理源文件' })
        
        for (const video of videos) {
          try {
            if (fs.existsSync(video.file_path)) {
              fs.unlinkSync(video.file_path)
            }
            if (video.thumbnail_path && fs.existsSync(video.thumbnail_path)) {
              fs.unlinkSync(video.thumbnail_path)
            }
            dbService.deleteVideo(video.id)
          } catch (error) {
            logger.warn('删除源文件失败', { module: 'export', video: video.filename, error })
          }
        }
      }
      
      this.emit('progress', { taskId: task.id, progress: 100, step: '完成' })
      this.emit('completed', { taskId: task.id, path: resultPath })
      
      logger.info('视频导出完成', { module: 'export', resultPath })
      
      return resultPath
    } catch (error) {
      logger.error('视频导出失败', { module: 'export', error })
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
    }
  }
  
  private async createZip(files: string[], outputPath: string, onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath)
      const archive = archiver('zip', {
        zlib: { level: 5 }
      })
      
      let totalSize = 0
      let processedSize = 0
      
      // 计算总大小
      files.forEach(file => {
        totalSize += fs.statSync(file).size
      })
      
      archive.on('progress', (progress: any) => {
        processedSize = progress.fs.processedBytes
        const percent = Math.floor((processedSize / totalSize) * 100)
        onProgress?.(percent)
      })
      
      output.on('close', () => {
        logger.info('ZIP文件创建完成', { module: 'export', size: archive.pointer() })
        resolve()
      })
      
      archive.on('error', (error: Error) => {
        logger.error('ZIP文件创建失败', { module: 'export', error })
        reject(error)
      })
      
      archive.pipe(output)
      
      // 添加文件到压缩包
      files.forEach(file => {
        archive.file(file, { name: path.basename(file) })
      })
      
      archive.finalize()
    })
  }
}

export const exportWorker = new ExportWorker()

