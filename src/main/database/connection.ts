import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

// 获取项目根目录
function getProjectRoot(): string {
  // 如果是开发环境，返回项目根目录
  if (process.env.NODE_ENV === 'development') {
    return process.cwd()
  }
  // 如果是生产环境，返回可执行文件所在目录
  return path.dirname(app.getPath('exe'))
}

export function initDatabase(): Database.Database {
  // 使用项目根目录而不是系统AppData目录
  const projectRoot = getProjectRoot()
  const dbPath = path.join(projectRoot, 'data', 'app.db')
  
  // 确保目录存在
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  
  createTables()
  
  return db
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

function createTables(): void {
  const db = getDatabase()
  
  // 创建批次任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS batch_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      status TEXT NOT NULL,
      total_videos INTEGER DEFAULT 0,
      completed_videos INTEGER DEFAULT 0,
      failed_videos INTEGER DEFAULT 0,
      edit_config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    )
  `)
  
  // 创建任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      url TEXT,
      platform TEXT,
      input_path TEXT,
      output_path TEXT,
      config TEXT,
      progress INTEGER DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME,
      FOREIGN KEY (batch_id) REFERENCES batch_tasks(id)
    )
  `)
  
  // 创建视频表
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      duration REAL,
      resolution TEXT,
      thumbnail_path TEXT,
      is_edited BOOLEAN DEFAULT 0,
      source_task_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES batch_tasks(id),
      FOREIGN KEY (source_task_id) REFERENCES tasks(id)
    )
  `)
  
  // 创建音频素材表
  db.exec(`
    CREATE TABLE IF NOT EXISTS audio_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      duration REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON tasks(batch_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_videos_batch_id ON videos(batch_id);
    CREATE INDEX IF NOT EXISTS idx_videos_is_edited ON videos(is_edited);
  `)
}

