import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'
import { logger } from './logger'

// 设置FFmpeg路径
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export interface EditConfig {
  speed: number          // 倍速 0.5-2.0
  sharpen: number        // 锐化 0-100
  flip: 'none' | 'h' | 'v'  // 翻转
  muteOriginal: boolean  // 静音原音
  musicPath?: string     // 背景音乐路径
  // 画质增强配置
  resolution?: string    // 分辨率，如 '2560x1440' (2K), '1920x1080' (1080p)
  fps?: number           // 帧率，如 60
  videoBitrate?: string  // 视频码率，如 '20000k' (20Mbps)
  crf?: number           // CRF质量值 0-51
  preset?: string        // 编码预设
}

export class FFmpegUtil extends EventEmitter {
  async processVideo(
    inputPath: string,
    outputPath: string,
    config: EditConfig
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('开始处理视频', { module: 'ffmpeg', inputPath, config })
        
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }
        
        const command = ffmpeg(inputPath)
        
        // 构建视频滤镜
        const videoFilters: string[] = []
        
        // 倍速处理
        if (config.speed !== 1.0) {
          const pts = 1 / config.speed
          videoFilters.push(`setpts=${pts}*PTS`)
        }
        
        // 锐化处理
        if (config.sharpen > 0) {
          const sharpenValue = config.sharpen / 100
          videoFilters.push(`unsharp=5:5:${sharpenValue}:5:5:0`)
        }
        
        // 翻转处理
        if (config.flip === 'h') {
          videoFilters.push('hflip')
        } else if (config.flip === 'v') {
          videoFilters.push('vflip')
        }
        
        // 应用视频滤镜
        if (videoFilters.length > 0) {
          command.videoFilters(videoFilters.join(','))
        }
        
        // 音频处理
        if (config.muteOriginal && config.musicPath && fs.existsSync(config.musicPath)) {
          // 静音原音并添加背景音乐（音乐文件存在）
          command
            .input(config.musicPath)
            .complexFilter([
              '[1:a]atrim=0:duration,asetpts=PTS-STARTPTS[music]'
            ])
            .outputOptions(['-map', '0:v', '-map', '[music]'])
        } else if (config.muteOriginal) {
          // 仅静音原音（无背景音乐或音乐文件不存在）
          command.noAudio()
          if (config.musicPath && !fs.existsSync(config.musicPath)) {
            logger.warn('背景音乐文件不存在，将仅静音原音', { module: 'ffmpeg', musicPath: config.musicPath })
          }
        } else if (config.musicPath && fs.existsSync(config.musicPath)) {
          // 保留原音,添加背景音乐(混音)
          command
            .input(config.musicPath)
            .complexFilter([
              '[0:a][1:a]amix=inputs=2:duration=shortest[aout]'
            ])
            .outputOptions(['-map', '0:v', '-map', '[aout]'])
        } else if (config.speed !== 1.0) {
          // 音频倍速（无背景音乐或音乐文件不存在）
          const atempo = config.speed
          command.audioFilters(`atempo=${atempo}`)
          if (config.musicPath && !fs.existsSync(config.musicPath)) {
            logger.warn('背景音乐文件不存在，将保留原音并应用倍速', { module: 'ffmpeg', musicPath: config.musicPath })
          }
        }
        
        // 输出配置
        command
          .output(outputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
        
        // 分辨率设置
        if (config.resolution) {
          command.size(config.resolution)
          logger.debug('设置输出分辨率', { module: 'ffmpeg', resolution: config.resolution })
        }
        
        // 帧率设置
        if (config.fps) {
          command.fps(config.fps)
          logger.debug('设置输出帧率', { module: 'ffmpeg', fps: config.fps })
        }
        
        // 视频码率设置
        if (config.videoBitrate) {
          command.videoBitrate(config.videoBitrate)
          logger.debug('设置视频码率', { module: 'ffmpeg', videoBitrate: config.videoBitrate })
        }
        
        // 输出选项
        const outputOptions = ['-movflags', '+faststart']
        
        // CRF质量设置
        const crfValue = config.crf !== undefined ? config.crf : 23
        outputOptions.push('-crf', String(crfValue))
        
        // 编码预设
        const presetValue = config.preset || 'medium'
        outputOptions.push('-preset', presetValue)
        
        command.outputOptions(outputOptions)
        
        logger.debug('FFmpeg输出配置', { 
          module: 'ffmpeg', 
          resolution: config.resolution,
          fps: config.fps,
          videoBitrate: config.videoBitrate,
          crf: crfValue,
          preset: presetValue
        })
        
        // 进度回调
        command.on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0)
          this.emit('progress', percent)
          logger.debug('处理进度', { module: 'ffmpeg', percent })
        })
        
        // 完成回调
        command.on('end', () => {
          logger.info('视频处理完成', { module: 'ffmpeg', outputPath })
          this.emit('completed', outputPath)
          resolve()
        })
        
        // 错误回调
        command.on('error', (error) => {
          logger.error('视频处理失败', { module: 'ffmpeg', error })
          this.emit('failed', error)
          reject(error)
        })
        
        // 开始处理
        command.run()
      } catch (error) {
        logger.error('FFmpeg处理异常', { module: 'ffmpeg', error })
        reject(error)
      }
    })
  }
  
  async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          reject(error)
        } else {
          resolve(metadata)
        }
      })
    })
  }
  
  async getDuration(filePath: string): Promise<number> {
    const info = await this.getVideoInfo(filePath)
    return info.format.duration || 0
  }
  
  async generateThumbnail(videoPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          filename: path.basename(outputPath),
          folder: outputDir,
          size: '320x240'
        })
        .on('end', () => resolve(outputPath))
        .on('error', reject)
    })
  }
}

const ffmpegUtilInstance = new FFmpegUtil()

export { ffmpegUtilInstance as ffmpegUtil }
export default ffmpegUtilInstance

