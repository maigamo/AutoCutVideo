import { EventEmitter } from 'events'
import { ffmpegUtil, type EditConfig } from '../utils/ffmpeg.util'
import { logger } from '../utils/logger'
import path from 'path'

export interface EditTask {
  id: number
  inputPath: string
  outputPath: string
  config: EditConfig
}

export class EditWorker extends EventEmitter {
  private isRunning = false
  
  async editVideo(task: EditTask): Promise<string> {
    if (this.isRunning) {
      throw new Error('已有剪辑任务正在运行')
    }
    
    this.isRunning = true
    
    try {
      logger.info('开始剪辑视频', { module: 'edit', task })
      
      // 监听FFmpeg进度
      ffmpegUtil.on('progress', (percent) => {
        this.emit('progress', { taskId: task.id, progress: percent })
      })
      
      // 执行剪辑
      await ffmpegUtil.processVideo(
        task.inputPath,
        task.outputPath,
        task.config
      )
      
      logger.info('视频剪辑完成', { module: 'edit', outputPath: task.outputPath })
      
      this.emit('completed', { taskId: task.id, outputPath: task.outputPath })
      
      return task.outputPath
    } catch (error) {
      logger.error('视频剪辑失败', { module: 'edit', error })
      this.emit('failed', { taskId: task.id, error })
      throw error
    } finally {
      this.isRunning = false
      ffmpegUtil.removeAllListeners('progress')
    }
  }
  
  async generateThumbnail(videoPath: string): Promise<string> {
    try {
      const thumbnailDir = path.join(path.dirname(videoPath), '..', '..', 'thumbnails')
      const filename = path.basename(videoPath, path.extname(videoPath)) + '.jpg'
      const thumbnailPath = path.join(thumbnailDir, filename)
      
      await ffmpegUtil.generateThumbnail(videoPath, thumbnailPath)
      
      return thumbnailPath
    } catch (error) {
      logger.error('生成缩略图失败', { module: 'edit', error })
      throw error
    }
  }
}

export const editWorker = new EditWorker()

