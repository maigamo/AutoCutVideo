import { getDatabase } from '../database/connection'
import type { BatchTask, Task, Video, AudioMaterial } from '../database/entities'

export class DatabaseService {
  // BatchTask 相关操作
  createBatchTask(data: Omit<BatchTask, 'id'>): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO batch_tasks (name, status, total_videos, completed_videos, failed_videos, edit_config)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      data.name,
      data.status,
      data.total_videos,
      data.completed_videos,
      data.failed_videos,
      data.edit_config
    )
    return result.lastInsertRowid as number
  }
  
  getBatchTask(id: number): BatchTask | undefined {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM batch_tasks WHERE id = ?')
    return stmt.get(id) as BatchTask | undefined
  }
  
  getAllBatchTasks(): BatchTask[] {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM batch_tasks ORDER BY created_at DESC')
    return stmt.all() as BatchTask[]
  }
  
  updateBatchTask(id: number, data: Partial<BatchTask>): void {
    const db = getDatabase()
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = Object.values(data)
    const stmt = db.prepare(`UPDATE batch_tasks SET ${fields} WHERE id = ?`)
    stmt.run(...values, id)
  }
  
  deleteBatchTask(id: number): void {
    const db = getDatabase()
    db.prepare('DELETE FROM batch_tasks WHERE id = ?').run(id)
  }
  
  // Task 相关操作
  createTask(data: Omit<Task, 'id'>): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO tasks (batch_id, type, status, url, platform, input_path, output_path, config, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      data.batch_id || null,
      data.type,
      data.status,
      data.url || null,
      data.platform || null,
      data.input_path || null,
      data.output_path || null,
      data.config || null,
      data.progress
    )
    return result.lastInsertRowid as number
  }
  
  getTask(id: number): Task | undefined {
    const db = getDatabase()
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined
  }
  
  getTasksByBatch(batchId: number): Task[] {
    const db = getDatabase()
    return db.prepare('SELECT * FROM tasks WHERE batch_id = ?').all(batchId) as Task[]
  }
  
  updateTask(id: number, data: Partial<Task>): void {
    const db = getDatabase()
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = Object.values(data)
    db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`).run(...values, id)
  }
  
  // Video 相关操作
  createVideo(data: Omit<Video, 'id'>): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO videos (batch_id, filename, file_path, file_size, duration, resolution, thumbnail_path, is_edited, source_task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      data.batch_id || null,
      data.filename,
      data.file_path,
      data.file_size || null,
      data.duration || null,
      data.resolution || null,
      data.thumbnail_path || null,
      data.is_edited ? 1 : 0,
      data.source_task_id || null
    )
    return result.lastInsertRowid as number
  }
  
  getVideo(id: number): Video | undefined {
    const db = getDatabase()
    return db.prepare('SELECT * FROM videos WHERE id = ?').get(id) as Video | undefined
  }
  
  getAllVideos(): Video[] {
    const db = getDatabase()
    return db.prepare('SELECT * FROM videos ORDER BY created_at DESC').all() as Video[]
  }
  
  getVideosByType(isEdited: boolean): Video[] {
    const db = getDatabase()
    return db.prepare('SELECT * FROM videos WHERE is_edited = ?').all(isEdited ? 1 : 0) as Video[]
  }
  
  deleteVideo(id: number): void {
    const db = getDatabase()
    db.prepare('DELETE FROM videos WHERE id = ?').run(id)
  }
  
  // AudioMaterial 相关操作
  createAudioMaterial(data: Omit<AudioMaterial, 'id'>): number {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO audio_materials (filename, file_path, file_size, duration)
      VALUES (?, ?, ?, ?)
    `)
    const result = stmt.run(
      data.filename,
      data.file_path,
      data.file_size || null,
      data.duration || null
    )
    return result.lastInsertRowid as number
  }
  
  getAllAudioMaterials(): AudioMaterial[] {
    const db = getDatabase()
    return db.prepare('SELECT * FROM audio_materials ORDER BY created_at DESC').all() as AudioMaterial[]
  }
  
  deleteAudioMaterial(id: number): void {
    const db = getDatabase()
    db.prepare('DELETE FROM audio_materials WHERE id = ?').run(id)
  }
}

export const dbService = new DatabaseService()

