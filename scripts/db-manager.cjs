#!/usr/bin/env node

/**
 * 数据库管理脚本
 * 用法:
 *   node scripts/db-manager.cjs init      # 初始化数据库
 *   node scripts/db-manager.cjs migrate   # 执行迁移
 *   node scripts/db-manager.cjs reset     # 清空数据
 *   node scripts/db-manager.cjs repair    # 修复数据库
 */

const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'data', 'app.db')
const DB_VERSION = 1

function ensureDbDirectory() {
  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log('✓ 数据库目录已创建')
  }
}

function initDatabase() {
  console.log('开始初始化数据库...')
  
  ensureDbDirectory()
  
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  
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
  
  // 创建版本表
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 记录版本
  db.prepare('INSERT OR REPLACE INTO schema_version (version) VALUES (?)').run(DB_VERSION)
  
  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON tasks(batch_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_videos_batch_id ON videos(batch_id);
    CREATE INDEX IF NOT EXISTS idx_videos_is_edited ON videos(is_edited);
  `)
  
  db.close()
  
  console.log('✓ 数据库初始化完成')
  console.log(`  数据库路径: ${DB_PATH}`)
  console.log(`  数据库版本: ${DB_VERSION}`)
}

function migrateDatabase() {
  console.log('开始执行数据库迁移...')
  
  if (!fs.existsSync(DB_PATH)) {
    console.error('✗ 数据库文件不存在,请先执行 init 初始化')
    process.exit(1)
  }
  
  const db = new Database(DB_PATH)
  
  // 获取当前版本
  let currentVersion = 0
  try {
    const row = db.prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1').get()
    currentVersion = row ? row.version : 0
  } catch (e) {
    console.log('  未找到版本表,从版本0开始')
  }
  
  console.log(`  当前版本: ${currentVersion}`)
  console.log(`  目标版本: ${DB_VERSION}`)
  
  if (currentVersion >= DB_VERSION) {
    console.log('✓ 数据库已是最新版本')
    db.close()
    return
  }
  
  // 执行迁移(根据版本号)
  // 未来版本升级时在此添加迁移逻辑
  
  // 更新版本号
  db.prepare('INSERT OR REPLACE INTO schema_version (version) VALUES (?)').run(DB_VERSION)
  
  db.close()
  console.log('✓ 数据库迁移完成')
}

function resetDatabase() {
  console.log('开始清空数据库...')
  
  if (!fs.existsSync(DB_PATH)) {
    console.error('✗ 数据库文件不存在')
    process.exit(1)
  }
  
  const db = new Database(DB_PATH)
  
  // 清空所有表
  db.exec('DELETE FROM audio_materials')
  db.exec('DELETE FROM videos')
  db.exec('DELETE FROM tasks')
  db.exec('DELETE FROM batch_tasks')
  
  // 重置自增ID
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('batch_tasks', 'tasks', 'videos', 'audio_materials')")
  
  db.close()
  
  console.log('✓ 数据库已清空')
}

function repairDatabase() {
  console.log('开始修复数据库...')
  
  if (!fs.existsSync(DB_PATH)) {
    console.error('✗ 数据库文件不存在')
    process.exit(1)
  }
  
  const db = new Database(DB_PATH)
  
  // 检查完整性
  console.log('  检查数据库完整性...')
  const integrityCheck = db.pragma('integrity_check')
  if (integrityCheck[0].integrity_check === 'ok') {
    console.log('✓ 数据库完整性正常')
  } else {
    console.error('✗ 数据库完整性检查失败')
    console.error(integrityCheck)
  }
  
  // 优化数据库
  console.log('  优化数据库...')
  db.pragma('optimize')
  
  // 重建索引
  console.log('  重建索引...')
  db.exec('REINDEX')
  
  // 清理孤立记录
  console.log('  清理孤立记录...')
  db.exec(`
    DELETE FROM tasks WHERE batch_id IS NOT NULL 
    AND batch_id NOT IN (SELECT id FROM batch_tasks)
  `)
  db.exec(`
    DELETE FROM videos WHERE batch_id IS NOT NULL 
    AND batch_id NOT IN (SELECT id FROM batch_tasks)
  `)
  
  db.close()
  
  console.log('✓ 数据库修复完成')
}

function migrateVideos() {
  console.log('开始迁移AppData中的视频文件...')
  
  const projectRoot = path.join(__dirname, '..')
  const appDataPath = path.join(
    process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming'),
    'autocutvideo-electron'
  )
  
  // 定义需要迁移的目录映射
  const dirMappings = [
    {
      from: path.join(appDataPath, 'videos', 'raw'),
      to: path.join(projectRoot, 'videos', 'raw'),
      name: '原始视频'
    },
    {
      from: path.join(appDataPath, 'videos', 'edited'),
      to: path.join(projectRoot, 'videos', 'edited'),
      name: '剪辑视频'
    },
    {
      from: path.join(appDataPath, 'videos', 'temp'),
      to: path.join(projectRoot, 'videos', 'temp'),
      name: '临时视频'
    }
  ]
  
  let totalMoved = 0
  let totalFailed = 0
  
  dirMappings.forEach(({ from, to, name }) => {
    console.log(`\n正在迁移 ${name}...`)
    console.log(`  源目录: ${from}`)
    console.log(`  目标目录: ${to}`)
    
    // 检查源目录是否存在
    if (!fs.existsSync(from)) {
      console.log(`  跳过: 源目录不存在`)
      return
    }
    
    // 确保目标目录存在
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true })
      console.log(`  已创建目标目录`)
    }
    
    // 获取所有文件
    const files = fs.readdirSync(from)
    if (files.length === 0) {
      console.log(`  跳过: 目录为空`)
      return
    }
    
    console.log(`  找到 ${files.length} 个文件`)
    
    // 移动文件
    files.forEach(filename => {
      const fromPath = path.join(from, filename)
      const toPath = path.join(to, filename)
      
      // 跳过目录
      if (fs.statSync(fromPath).isDirectory()) {
        return
      }
      
      try {
        // 如果目标文件已存在，跳过
        if (fs.existsSync(toPath)) {
          console.log(`  跳过 ${filename}: 目标文件已存在`)
          return
        }
        
        // 移动文件
        fs.copyFileSync(fromPath, toPath)
        fs.unlinkSync(fromPath)
        
        console.log(`  ✓ 移动 ${filename}`)
        totalMoved++
      } catch (error) {
        console.error(`  ✗ 移动失败 ${filename}: ${error.message}`)
        totalFailed++
      }
    })
  })
  
  console.log(`\n迁移完成:`)
  console.log(`  成功: ${totalMoved} 个文件`)
  console.log(`  失败: ${totalFailed} 个文件`)
  
  // 更新数据库中的文件路径
  if (totalMoved > 0 && fs.existsSync(DB_PATH)) {
    console.log('\n正在更新数据库中的文件路径...')
    const db = new Database(DB_PATH)
    
    try {
      // 更新videos表中的路径
      const updateVideos = db.prepare(`
        UPDATE videos 
        SET file_path = REPLACE(file_path, ?, ?)
        WHERE file_path LIKE ?
      `)
      
      const appdataPattern = appDataPath.replace(/\\/g, '\\\\')
      const projectPattern = projectRoot.replace(/\\/g, '\\\\')
      
      const result = updateVideos.run(appdataPattern, projectPattern, `${appdataPattern}%`)
      console.log(`  已更新 ${result.changes} 条视频记录`)
      
      // 更新tasks表中的路径
      const updateTasks = db.prepare(`
        UPDATE tasks 
        SET output_path = REPLACE(output_path, ?, ?),
            input_path = REPLACE(input_path, ?, ?)
        WHERE output_path LIKE ? OR input_path LIKE ?
      `)
      
      const result2 = updateTasks.run(
        appdataPattern, projectPattern,
        appdataPattern, projectPattern,
        `${appdataPattern}%`, `${appdataPattern}%`
      )
      console.log(`  已更新 ${result2.changes} 条任务记录`)
      
      db.close()
      console.log('✓ 数据库路径更新完成')
    } catch (error) {
      console.error('✗ 更新数据库路径失败:', error.message)
      db.close()
    }
  }
  
  console.log('\n✓ 视频文件迁移完成')
}

// 主函数
const command = process.argv[2]

switch (command) {
  case 'init':
    initDatabase()
    break
  case 'migrate':
    migrateDatabase()
    break
  case 'migrate-videos':
    migrateVideos()
    break
  case 'reset':
    resetDatabase()
    break
  case 'repair':
    repairDatabase()
    break
  default:
    console.log('用法: node scripts/db-manager.cjs <command>')
    console.log('命令:')
    console.log('  init           - 初始化数据库')
    console.log('  migrate        - 执行数据库迁移')
    console.log('  migrate-videos - 迁移AppData中的视频到项目目录')
    console.log('  reset          - 清空所有数据')
    console.log('  repair         - 修复数据库')
    process.exit(1)
}

