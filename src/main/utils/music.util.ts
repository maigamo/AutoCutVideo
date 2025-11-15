import fs from 'fs'
import path from 'path'
import { logger } from './logger'

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.aac', '.m4a', '.flac']

/**
 * 从指定目录随机选择一个音乐文件
 * @param musicDir 音乐目录路径
 * @returns 音乐文件完整路径，如果没有找到返回undefined
 */
export async function getRandomMusic(musicDir: string): Promise<string | undefined> {
  try {
    // 检查目录是否存在
    if (!fs.existsSync(musicDir)) {
      logger.warn('音乐目录不存在', { module: 'music', musicDir })
      return undefined
    }

    // 读取目录中的所有文件
    const files = fs.readdirSync(musicDir)
    
    // 过滤出音乐文件
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return AUDIO_EXTENSIONS.includes(ext)
    })

    // 如果没有音乐文件
    if (musicFiles.length === 0) {
      logger.warn('音乐目录中没有找到音乐文件', { module: 'music', musicDir })
      return undefined
    }

    // 随机选择一个音乐文件
    const randomFile = musicFiles[Math.floor(Math.random() * musicFiles.length)]
    const musicPath = path.join(musicDir, randomFile)
    
    logger.debug('已选择随机音乐', { module: 'music', musicPath })
    
    return musicPath
  } catch (error) {
    logger.error('获取随机音乐失败', { 
      module: 'music', 
      musicDir, 
      error: error instanceof Error ? error.message : String(error) 
    })
    return undefined
  }
}

/**
 * 检查音乐目录是否有可用的音乐文件
 * @param musicDir 音乐目录路径
 * @returns true表示有可用音乐，false表示没有
 */
export function hasMusicFiles(musicDir: string): boolean {
  try {
    if (!fs.existsSync(musicDir)) {
      return false
    }

    const files = fs.readdirSync(musicDir)
    const musicFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return AUDIO_EXTENSIONS.includes(ext)
    })

    return musicFiles.length > 0
  } catch (error) {
    logger.error('检查音乐文件失败', { 
      module: 'music', 
      musicDir, 
      error: error instanceof Error ? error.message : String(error) 
    })
    return false
  }
}

