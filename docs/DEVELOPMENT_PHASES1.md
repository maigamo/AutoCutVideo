# AutoCutVideo 开发阶段指导书 (阶段1-5)

## ⚠️ 重要声明

### 开发规则
1. **命令执行方式**: 所有命令行操作必须使用 **PowerShell** 方式执行
2. **代码文件行数限制**: 每个代码文件不能超过 **600行**
   - 超过600行的文件必须拆分成多个文件
   - 发现此问题后,**优先解决文件拆分问题**,再继续其他开发任务
3. **程序运行要求**: 每完成一个阶段后必须运行程序,确保无报错
   - 如有异常必须立即修复
   - 确保程序能正常启动和运行

### 开发检查要点
- [ ] 使用PowerShell执行所有命令
- [ ] 所有代码文件 ≤ 600行
- [ ] 程序能够正常启动
- [ ] 前后端接口正确对应(涉及前后端时)
- [ ] 无运行时错误

---

## 📋 开发概述

本文档将AutoCutVideo项目的开发划分为10个阶段,本文件包含**阶段1-5**的详细开发指导。

### 项目技术栈
- **前端**: Vue 3.5.12 + Element Plus 2.8.8 + Pinia 2.2.6
- **构建**: Vite 5.4.11 + electron-vite 2.3.0
- **框架**: Electron 32.2.7 (内置 Node.js 18.20.5)
- **数据库**: SQLite (better-sqlite3 11.7.0)
- **视频处理**: FFmpeg 7.1 + fluent-ffmpeg 2.1.3
- **下载**: Playwright 1.49.0
- **日志**: winston 3.17.0

### 核心功能模块
1. 批量输入(下载+自动剪辑)
2. 视频管理(原视频+剪辑后视频)
3. 导出下载(批量导出+压缩)
4. 设置中心

---

## 🎯 阶段1: 项目初始化与环境配置

### 阶段目标
搭建基础项目结构,配置开发环境,确保所有依赖正确安装并能正常运行。

### 开发任务清单

#### 1.1 创建项目基础结构
```powershell
# 创建项目目录
mkdir AutoCutVideo-electron
cd AutoCutVideo-electron

# 初始化 npm 项目
npm init -y
```

#### 1.2 安装核心依赖
```powershell
# 安装 Electron 和构建工具
npm install electron@32.2.7 electron-vite@2.3.0 vite@5.4.11 --save-dev

# 安装 Vue 3 及相关
npm install vue@3.5.12 pinia@2.2.6
npm install @vitejs/plugin-vue@5.2.1 --save-dev

# 安装 UI 库
npm install element-plus@2.8.8

# 安装数据库
npm install better-sqlite3@11.7.0 typeorm@0.3.20

# 安装视频处理
npm install fluent-ffmpeg@2.1.3 @ffmpeg-installer/ffmpeg@1.1.0

# 安装下载工具
npm install playwright@1.49.0

# 安装工具库
npm install axios@1.7.9 dayjs@1.11.13 lodash-es@4.17.21 uuid@11.0.3
npm install winston@3.17.0 winston-daily-rotate-file@5.0.0
npm install archiver@7.0.1 file-type@19.6.0
npm install electron-store@10.0.0

# 安装开发工具
npm install typescript@5.7.2 --save-dev
npm install eslint@9.16.0 eslint-plugin-vue@9.31.0 --save-dev
npm install @vue/eslint-config-typescript@14.1.3 --save-dev
npm install electron-builder@25.1.8 electron-rebuild@3.2.9 --save-dev
npm install sass@1.83.0 vitest@2.1.8 --save-dev

# 安装类型定义
npm install @types/node@22.10.1 --save-dev
npm install @types/better-sqlite3@7.6.12 --save-dev
npm install @types/fluent-ffmpeg@2.1.27 --save-dev
npm install @types/lodash-es@4.17.12 --save-dev
npm install @types/uuid@10.0.0 --save-dev
```

#### 1.3 创建目录结构
```powershell
# 创建主要目录
mkdir src
mkdir src\main
mkdir src\main\ipc
mkdir src\main\services
mkdir src\main\workers
mkdir src\main\database
mkdir src\main\database\entities
mkdir src\main\database\migrations
mkdir src\main\utils
mkdir src\renderer
mkdir src\renderer\src
mkdir src\renderer\src\router
mkdir src\renderer\src\stores
mkdir src\renderer\src\views
mkdir src\renderer\src\components
mkdir src\renderer\src\components\common
mkdir src\renderer\src\composables
mkdir src\renderer\src\assets
mkdir src\renderer\src\styles
mkdir src\preload
mkdir scripts
mkdir config
mkdir resources
mkdir videos\raw
mkdir videos\edited
mkdir videos\exported
mkdir videos\temp
mkdir music
mkdir thumbnails
mkdir logs
mkdir data
```

#### 1.4 配置文件创建

**package.json** (更新scripts):
```json
{
  "name": "autocutvideo-electron",
  "version": "1.0.0",
  "description": "AutoCutVideo - 视频批量下载与自动剪辑桌面应用",
  "main": "dist-electron/main/index.js",
  "type": "module",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "rebuild": "electron-rebuild -f -w better-sqlite3",
    "postinstall": "npm run rebuild",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "db:init": "node scripts/db-manager.js init",
    "db:migrate": "node scripts/db-manager.js migrate",
    "db:reset": "node scripts/db-manager.js reset",
    "db:repair": "node scripts/db-manager.js repair"
  },
  "engines": {
    "node": ">=18.20.0 <19.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": [
    "electron",
    "video",
    "download",
    "edit",
    "automation",
    "ffmpeg",
    "playwright"
  ],
  "author": "",
  "license": "MIT"
}
```

**electron.vite.config.ts**:
```typescript
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'electron']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      port: 10031,
      strictPort: true
    }
  }
})
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node", "better-sqlite3"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/renderer/src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "dist-electron"]
}
```

**.gitignore**:
```
# 依赖
node_modules/
package-lock.json

# 构建产物
dist/
dist-electron/
out/

# 数据文件
data/*.db
videos/
music/
thumbnails/
logs/

# 配置文件(保留示例)
config/settings.json

# 临时文件
*.log
*.tmp
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

#### 1.5 编译原生模块
```powershell
# 重新编译 better-sqlite3
npm run rebuild
```

### 检查点
- [ ] 所有依赖安装成功
- [ ] 目录结构创建完整
- [ ] 配置文件正确
- [ ] better-sqlite3 编译成功
- [ ] TypeScript 编译无错误

### 额外目标
- 仔细检查所有依赖版本是否与需求文档一致
- 确认端口10031未被占用
- 验证 Node.js 版本为 18.20.5

---

## 🎯 阶段2: 数据库层搭建

### 阶段目标
实现数据库连接、表结构创建、基础CRUD操作,以及数据库管理脚本。

### 开发任务清单

#### 2.1 创建数据库实体

**src/main/database/entities/BatchTask.entity.ts** (< 80行):
```typescript
export interface BatchTask {
  id?: number
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_videos: number
  completed_videos: number
  failed_videos: number
  edit_config: string // JSON格式
  created_at?: string
  started_at?: string
  completed_at?: string
}
```

**src/main/database/entities/Task.entity.ts** (< 100行):
```typescript
export interface Task {
  id?: number
  batch_id?: number
  type: 'download' | 'edit' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  url?: string
  platform?: string
  input_path?: string
  output_path?: string
  config?: string // JSON格式
  progress: number
  error_message?: string
  created_at?: string
  started_at?: string
  completed_at?: string
}
```

**src/main/database/entities/Video.entity.ts** (< 100行):
```typescript
export interface Video {
  id?: number
  batch_id?: number
  filename: string
  file_path: string
  file_size?: number
  duration?: number
  resolution?: string
  thumbnail_path?: string
  is_edited: boolean
  source_task_id?: number
  created_at?: string
}
```

**src/main/database/entities/AudioMaterial.entity.ts** (< 70行):
```typescript
export interface AudioMaterial {
  id?: number
  filename: string
  file_path: string
  file_size?: number
  duration?: number
  created_at?: string
}
```

#### 2.2 创建数据库服务

**src/main/database/connection.ts** (< 150行):
```typescript
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

export function initDatabase(): Database.Database {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'data', 'app.db')
  
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
```

**src/main/services/DatabaseService.ts** (< 300行,如超过则拆分为多个文件):
```typescript
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
```

#### 2.3 创建数据库管理脚本

**scripts/db-manager.js** (< 400行):
```javascript
#!/usr/bin/env node

/**
 * 数据库管理脚本
 * 用法:
 *   node scripts/db-manager.js init      # 初始化数据库
 *   node scripts/db-manager.js migrate   # 执行迁移
 *   node scripts/db-manager.js reset     # 清空数据
 *   node scripts/db-manager.js repair    # 修复数据库
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

// 主函数
const command = process.argv[2]

switch (command) {
  case 'init':
    initDatabase()
    break
  case 'migrate':
    migrateDatabase()
    break
  case 'reset':
    resetDatabase()
    break
  case 'repair':
    repairDatabase()
    break
  default:
    console.log('用法: node scripts/db-manager.js <command>')
    console.log('命令:')
    console.log('  init    - 初始化数据库')
    console.log('  migrate - 执行数据库迁移')
    console.log('  reset   - 清空所有数据')
    console.log('  repair  - 修复数据库')
    process.exit(1)
}
```

#### 2.4 初始化数据库
```powershell
# 初始化数据库
npm run db:init
```

### 检查点
- [ ] 数据库文件创建成功 (data/app.db)
- [ ] 所有表结构创建正确
- [ ] DatabaseService 所有方法可用
- [ ] db-manager.js 脚本运行正常
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查前后端数据接口定义是否一致
- 验证数据库索引创建正确
- 确保外键关系正确

---

## 🎯 阶段3: 主进程基础架构

### 阶段目标
搭建Electron主进程架构,实现IPC通信、事件总线、日志系统和配置管理。

### 开发任务清单

#### 3.1 创建主进程入口

**src/main/index.ts** (< 200行):
```typescript
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
```

#### 3.2 创建日志工具

**src/main/utils/logger.ts** (< 150行):
```typescript
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// 确保日志目录存在
const logDir = path.join(app.getPath('userData'), 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, module, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
    return `[${timestamp}] [${level.toUpperCase()}] [${module || 'app'}] ${message} ${metaStr}`
  })
)

// 创建日志传输器
const transports: winston.transport[] = [
  // 控制台输出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }),
  
  // 文件输出 - 所有日志
  new DailyRotateFile({
    dirname: logDir,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  }),
  
  // 文件输出 - 错误日志
  new DailyRotateFile({
    dirname: logDir,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  })
]

// 创建logger实例
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports
})

// 导出便捷方法
export default logger
```

#### 3.3 创建配置服务

**src/main/services/ConfigService.ts** (< 200行):
```typescript
import Store from 'electron-store'
import { app } from 'electron'
import path from 'path'

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
    muteOriginalAudio: boolean
    randomMusic: boolean
  }
}

const defaultConfig: AppConfig = {
  general: {
    language: 'zh-CN',
    theme: 'auto',
    startOnBoot: false,
    minimizeToTray: true
  },
  paths: {
    downloadDir: path.join(app.getPath('userData'), 'videos', 'raw'),
    outputDir: path.join(app.getPath('userData'), 'videos', 'edited'),
    musicDir: path.join(app.getPath('userData'), 'music'),
    tempDir: path.join(app.getPath('userData'), 'videos', 'temp')
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
    defaultCRF: 18,
    defaultPreset: 'slow',
    muteOriginalAudio: true,
    randomMusic: true
  }
}

class ConfigService {
  private store: Store<AppConfig>
  
  constructor() {
    this.store = new Store<AppConfig>({
      defaults: defaultConfig
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
}

export const configService = new ConfigService()
```

#### 3.4 创建事件总线

**src/main/services/EventBus.ts** (< 150行):
```typescript
import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import { logger } from '../utils/logger'

export type EventType = 
  | 'task:created'
  | 'task:started'
  | 'task:progress'
  | 'task:completed'
  | 'task:failed'
  | 'task:cancelled'
  | 'download:started'
  | 'download:progress'
  | 'download:completed'
  | 'download:failed'
  | 'edit:started'
  | 'edit:progress'
  | 'edit:completed'
  | 'edit:failed'
  | 'export:started'
  | 'export:progress'
  | 'export:completed'
  | 'export:failed'

export interface EventPayload {
  type: EventType
  data: any
  timestamp: number
}

class EventBus extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(50) // 增加最大监听器数量
  }
  
  // 发布事件
  publish(type: EventType, data: any): void {
    const payload: EventPayload = {
      type,
      data,
      timestamp: Date.now()
    }
    
    logger.debug('事件发布', { module: 'eventbus', type, data })
    
    // 触发内部监听器
    this.emit(type, payload)
    
    // 发送到渲染进程
    this.sendToRenderer(type, payload)
  }
  
  // 订阅事件
  subscribe(type: EventType, handler: (payload: EventPayload) => void): void {
    this.on(type, handler)
  }
  
  // 取消订阅
  unsubscribe(type: EventType, handler: (payload: EventPayload) => void): void {
    this.off(type, handler)
  }
  
  // 发送事件到渲染进程
  private sendToRenderer(type: EventType, payload: EventPayload): void {
    try {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('event:notification', payload)
        }
      })
    } catch (error) {
      logger.error('发送事件到渲染进程失败', { module: 'eventbus', error })
    }
  }
}

export const eventBus = new EventBus()
```

#### 3.5 创建IPC处理器入口

**src/main/ipc/index.ts** (< 100行):
```typescript
import { initDownloadHandlers } from './download.ipc'
import { initEditHandlers } from './edit.ipc'
import { initExportHandlers } from './export.ipc'
import { initDatabaseHandlers } from './database.ipc'
import { initFileHandlers } from './file.ipc'
import { initSettingsHandlers } from './settings.ipc'
import { initSystemHandlers } from './system.ipc'
import { initWindowHandlers } from './window.ipc'
import { logger } from '../utils/logger'

export function initIpcHandlers(): void {
  try {
    initDownloadHandlers()
    initEditHandlers()
    initExportHandlers()
    initDatabaseHandlers()
    initFileHandlers()
    initSettingsHandlers()
    initSystemHandlers()
    initWindowHandlers()
    
    logger.info('所有IPC处理器已注册', { module: 'ipc' })
  } catch (error) {
    logger.error('IPC处理器注册失败', { module: 'ipc', error })
    throw error
  }
}
```

#### 3.6 创建基础IPC处理器(占位符)

**src/main/ipc/download.ipc.ts** (< 50行,占位符):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'

export function initDownloadHandlers(): void {
  // 创建下载任务
  ipcMain.handle('download:task:create', async (event, payload) => {
    logger.info('创建下载任务', { module: 'download', payload })
    // TODO: 实现下载逻辑
    return { success: true, message: '下载功能待实现' }
  })
  
  logger.debug('下载IPC处理器已注册', { module: 'ipc' })
}
```

**src/main/ipc/edit.ipc.ts** (< 50行,占位符):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'

export function initEditHandlers(): void {
  // 创建剪辑任务
  ipcMain.handle('edit:task:create', async (event, payload) => {
    logger.info('创建剪辑任务', { module: 'edit', payload })
    // TODO: 实现剪辑逻辑
    return { success: true, message: '剪辑功能待实现' }
  })
  
  logger.debug('剪辑IPC处理器已注册', { module: 'ipc' })
}
```

**src/main/ipc/export.ipc.ts** (< 50行,占位符):
```typescript
import { ipcMain } from 'electron'
import { logger } from '../utils/logger'

export function initExportHandlers(): void {
  // 创建导出任务
  ipcMain.handle('export:task:create', async (event, payload) => {
    logger.info('创建导出任务', { module: 'export', payload })
    // TODO: 实现导出逻辑
    return { success: true, message: '导出功能待实现' }
  })
  
  logger.debug('导出IPC处理器已注册', { module: 'ipc' })
}
```

(其他IPC处理器文件类似创建占位符,每个文件 < 50行)

#### 3.7 创建preload脚本

**src/preload/index.ts** (< 200行):
```typescript
import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('api', {
  // 下载模块
  download: {
    createTask: (payload: any) => ipcRenderer.invoke('download:task:create', payload),
    startTask: (taskId: number) => ipcRenderer.invoke('download:task:start', taskId),
    cancelTask: (taskId: number) => ipcRenderer.invoke('download:task:cancel', taskId),
    getTaskList: () => ipcRenderer.invoke('download:task:list')
  },
  
  // 剪辑模块
  edit: {
    createTask: (payload: any) => ipcRenderer.invoke('edit:task:create', payload),
    startTask: (taskId: number) => ipcRenderer.invoke('edit:task:start', taskId),
    cancelTask: (taskId: number) => ipcRenderer.invoke('edit:task:cancel', taskId),
    getConfig: () => ipcRenderer.invoke('edit:config:get'),
    setConfig: (config: any) => ipcRenderer.invoke('edit:config:set', config)
  },
  
  // 导出模块
  export: {
    createTask: (payload: any) => ipcRenderer.invoke('export:task:create', payload),
    startTask: (taskId: number) => ipcRenderer.invoke('export:task:start', taskId)
  },
  
  // 数据库模块
  database: {
    queryTasks: (filter: any) => ipcRenderer.invoke('db:query:tasks', filter),
    queryVideos: (filter: any) => ipcRenderer.invoke('db:query:videos', filter),
    getStats: () => ipcRenderer.invoke('db:stats:summary')
  },
  
  // 文件模块
  file: {
    selectFolder: () => ipcRenderer.invoke('file:dialog:open', { type: 'folder' }),
    selectFile: (filters?: any) => ipcRenderer.invoke('file:dialog:open', { type: 'file', filters }),
    exists: (path: string) => ipcRenderer.invoke('file:exists', path),
    delete: (path: string) => ipcRenderer.invoke('file:delete', path)
  },
  
  // 设置模块
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (config: any) => ipcRenderer.invoke('settings:set', config),
    reset: () => ipcRenderer.invoke('settings:reset')
  },
  
  // 系统模块
  system: {
    getInfo: () => ipcRenderer.invoke('system:info'),
    openExternal: (url: string) => ipcRenderer.invoke('system:openExternal', url),
    showInFolder: (path: string) => ipcRenderer.invoke('system:showItemInFolder', path)
  },
  
  // 事件订阅
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  }
})
```

### 检查点
- [ ] 主进程入口文件正常启动
- [ ] 日志系统正常工作
- [ ] 配置服务正常加载
- [ ] 事件总线可以发布和订阅事件
- [ ] IPC处理器已注册
- [ ] preload脚本正确暴露API
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查IPC通道命名是否符合规范
- 验证事件总线能正确发送到渲染进程
- 确保日志文件正常创建和轮转

---

## 🎯 阶段4: 渲染进程基础架构

### 阶段目标
搭建Vue 3渲染进程架构,实现路由、状态管理、基础组件和页面框架。

### 开发任务清单

#### 4.1 创建渲染进程入口

**src/renderer/index.html** (< 50行):
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoCutVideo - 自动剪辑工具</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**src/renderer/src/main.ts** (< 100行):
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { size: 'default', zIndex: 3000 })

app.mount('#app')
```

**src/renderer/src/App.vue** (< 100行):
```vue
<template>
  <div id="app" :class="{ 'dark-theme': isDark }">
    <div class="app-layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="logo">
          <h1>AutoCutVideo</h1>
        </div>
        
        <el-menu
          :default-active="currentRoute"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/batch-input">
            <el-icon><Upload /></el-icon>
            <span>批量输入</span>
          </el-menu-item>
          
          <el-menu-item index="/video-management">
            <el-icon><VideoCamera /></el-icon>
            <span>视频管理</span>
          </el-menu-item>
          
          <el-menu-item index="/export">
            <el-icon><Download /></el-icon>
            <span>导出下载</span>
          </el-menu-item>
          
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </aside>
      
      <!-- 主内容区 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isDark = ref(false)
const currentRoute = computed(() => route.path)

function handleMenuSelect(index: string) {
  router.push(index)
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  
  .sidebar {
    width: 200px;
    background: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    
    .logo {
      padding: 20px;
      border-bottom: 1px solid #e4e7ed;
      
      h1 {
        font-size: 18px;
        margin: 0;
        color: #409eff;
      }
    }
    
    .sidebar-menu {
      flex: 1;
      border-right: none;
    }
  }
  
  .main-content {
    flex: 1;
    overflow: auto;
    background: #f5f7fa;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

#### 4.2 创建路由

**src/renderer/src/router/index.ts** (< 100行):
```typescript
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/batch-input'
  },
  {
    path: '/batch-input',
    name: 'BatchInput',
    component: () => import('../views/BatchInput.vue')
  },
  {
    path: '/video-management',
    name: 'VideoManagement',
    component: () => import('../views/VideoManagement.vue')
  },
  {
    path: '/export',
    name: 'Export',
    component: () => import('../views/Export.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
```

#### 4.3 创建Pinia stores

**src/renderer/src/stores/task.store.ts** (< 200行):
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Task {
  id: number
  batch_id?: number
  type: 'download' | 'edit' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  url?: string
  progress: number
  error_message?: string
  created_at?: string
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  
  async function fetchTasks() {
    loading.value = true
    try {
      const result = await window.api.database.queryTasks({})
      if (result.success) {
        tasks.value = result.data
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function createDownloadTask(url: string) {
    try {
      const result = await window.api.download.createTask({ url })
      if (result.success) {
        await fetchTasks()
        return result.data
      }
    } catch (error) {
      console.error('创建下载任务失败:', error)
      throw error
    }
  }
  
  function updateTaskProgress(taskId: number, progress: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.progress = progress
    }
  }
  
  return {
    tasks,
    loading,
    fetchTasks,
    createDownloadTask,
    updateTaskProgress
  }
})
```

**src/renderer/src/stores/video.store.ts** (< 150行):
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Video {
  id: number
  filename: string
  file_path: string
  file_size?: number
  duration?: number
  thumbnail_path?: string
  is_edited: boolean
  created_at?: string
}

export const useVideoStore = defineStore('video', () => {
  const videos = ref<Video[]>([])
  const loading = ref(false)
  
  const rawVideos = computed(() => videos.value.filter(v => !v.is_edited))
  const editedVideos = computed(() => videos.value.filter(v => v.is_edited))
  
  async function fetchVideos() {
    loading.value = true
    try {
      const result = await window.api.database.queryVideos({})
      if (result.success) {
        videos.value = result.data
      }
    } catch (error) {
      console.error('获取视频列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    videos,
    rawVideos,
    editedVideos,
    loading,
    fetchVideos
  }
})
```

**src/renderer/src/stores/settings.store.ts** (< 100行):
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<any>({})
  const loading = ref(false)
  
  async function loadSettings() {
    loading.value = true
    try {
      const result = await window.api.settings.get()
      if (result.success) {
        settings.value = result.data
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  async function saveSettings(newSettings: any) {
    try {
      const result = await window.api.settings.set(newSettings)
      if (result.success) {
        settings.value = newSettings
      }
      return result
    } catch (error) {
      console.error('保存设置失败:', error)
      throw error
    }
  }
  
  return {
    settings,
    loading,
    loadSettings,
    saveSettings
  }
})
```

#### 4.4 创建基础页面(占位符)

**src/renderer/src/views/BatchInput.vue** (< 100行,占位符):
```vue
<template>
  <div class="batch-input-page">
    <el-card>
      <template #header>
        <h2>批量输入 - 下载 + 自动剪辑</h2>
      </template>
      
      <el-empty description="批量输入页面待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现批量输入逻辑
</script>

<style scoped lang="scss">
.batch-input-page {
  padding: 20px;
}
</style>
```

**src/renderer/src/views/VideoManagement.vue** (< 100行,占位符):
```vue
<template>
  <div class="video-management-page">
    <el-card>
      <template #header>
        <h2>视频管理</h2>
      </template>
      
      <el-empty description="视频管理页面待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现视频管理逻辑
</script>

<style scoped lang="scss">
.video-management-page {
  padding: 20px;
}
</style>
```

**src/renderer/src/views/Export.vue** (< 100行,占位符):
```vue
<template>
  <div class="export-page">
    <el-card>
      <template #header>
        <h2>导出下载</h2>
      </template>
      
      <el-empty description="导出下载页面待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现导出逻辑
</script>

<style scoped lang="scss">
.export-page {
  padding: 20px;
}
</style>
```

**src/renderer/src/views/Settings.vue** (< 100行,占位符):
```vue
<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <h2>设置</h2>
      </template>
      
      <el-empty description="设置页面待实现" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
// TODO: 实现设置逻辑
</script>

<style scoped lang="scss">
.settings-page {
  padding: 20px;
}
</style>
```

#### 4.5 创建全局样式

**src/renderer/src/styles/main.scss** (< 200行):
```scss
// 变量定义
$primary: #409EFF;
$success: #67C23A;
$warning: #E6A23C;
$danger: #F56C6C;
$info: #909399;

$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;

$border-base: #DCDFE6;
$bg-page: #F5F7FA;

$space-sm: 8px;
$space-md: 12px;
$space-lg: 16px;
$space-xl: 24px;

// 全局样式
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
               'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: $text-primary;
  background: $bg-page;
}

#app {
  width: 100%;
  height: 100%;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

// 暗色主题
.dark-theme {
  background: #1e1e1e;
  color: #e0e0e0;
  
  .sidebar {
    background: #252526;
    border-right-color: #3e3e42;
  }
  
  .main-content {
    background: #1e1e1e;
  }
}
```

#### 4.6 TypeScript类型定义

**src/renderer/src/types/window.d.ts** (< 150行):
```typescript
export interface IElectronAPI {
  download: {
    createTask: (payload: any) => Promise<any>
    startTask: (taskId: number) => Promise<any>
    cancelTask: (taskId: number) => Promise<any>
    getTaskList: () => Promise<any>
  }
  edit: {
    createTask: (payload: any) => Promise<any>
    startTask: (taskId: number) => Promise<any>
    cancelTask: (taskId: number) => Promise<any>
    getConfig: () => Promise<any>
    setConfig: (config: any) => Promise<any>
  }
  export: {
    createTask: (payload: any) => Promise<any>
    startTask: (taskId: number) => Promise<any>
  }
  database: {
    queryTasks: (filter: any) => Promise<any>
    queryVideos: (filter: any) => Promise<any>
    getStats: () => Promise<any>
  }
  file: {
    selectFolder: () => Promise<any>
    selectFile: (filters?: any) => Promise<any>
    exists: (path: string) => Promise<any>
    delete: (path: string) => Promise<any>
  }
  settings: {
    get: () => Promise<any>
    set: (config: any) => Promise<any>
    reset: () => Promise<any>
  }
  system: {
    getInfo: () => Promise<any>
    openExternal: (url: string) => Promise<any>
    showInFolder: (path: string) => Promise<any>
  }
  on: (channel: string, callback: Function) => void
  off: (channel: string, callback: Function) => void
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
```

### 检查点
- [ ] 渲染进程正常启动
- [ ] Vue Router 路由正常切换
- [ ] Pinia stores 可以正常使用
- [ ] 页面布局正确显示
- [ ] 侧边栏导航正常工作
- [ ] 所有代码文件 ≤ 600行

### 额外目标
- 仔细检查前后端接口调用是否正确
- 验证TypeScript类型定义完整
- 确保Element Plus组件正常显示

---

## 🎯 阶段5: 运行测试与问题修复

### 阶段目标
运行项目,修复所有启动错误和运行时异常,确保基础架构稳定运行。

### 开发任务清单

#### 5.1 补充缺失的IPC处理器

创建所有占位符IPC处理器文件:
- `src/main/ipc/database.ipc.ts`
- `src/main/ipc/file.ipc.ts`
- `src/main/ipc/settings.ipc.ts`
- `src/main/ipc/system.ipc.ts`
- `src/main/ipc/window.ipc.ts`

每个文件实现基本的IPC响应逻辑(< 100行/文件)。

#### 5.2 运行开发模式

```powershell
# 启动开发服务器
npm run dev
```

#### 5.3 检查清单

运行程序后检查以下内容:

- [ ] 应用窗口正常打开
- [ ] 侧边栏导航正常显示
- [ ] 路由切换正常工作
- [ ] 控制台无报错信息
- [ ] 数据库文件正常创建
- [ ] 日志文件正常创建
- [ ] 配置文件正常加载

#### 5.4 常见问题修复

**问题1: better-sqlite3 编译错误**
```powershell
# 重新编译
npm run rebuild
```

**问题2: 端口10031被占用**
```powershell
# 检查端口占用
netstat -ano | findstr :10031

# 修改 electron.vite.config.ts 中的端口号
```

**问题3: TypeScript编译错误**
```powershell
# 检查类型定义
npm run build
```

**问题4: IPC通信失败**
- 检查preload.ts是否正确暴露API
- 检查main进程是否注册了对应的IPC处理器
- 查看控制台日志定位问题

#### 5.5 性能优化

- 检查内存占用是否正常(< 500MB)
- 检查启动时间是否合理(< 5秒)
- 检查页面切换是否流畅

### 检查点
- [ ] 程序能够正常启动
- [ ] 无任何报错信息
- [ ] 所有页面可以访问
- [ ] IPC通信正常
- [ ] 数据库读写正常
- [ ] 日志记录正常
- [ ] 配置加载正常

### 额外目标
- 验证所有代码文件 ≤ 600行
- 检查前后端接口完全对应
- 确保代码符合ESLint规范

---

## 📝 阶段总结

完成阶段1-5后,你将拥有:

✅ **完整的项目结构**
- 主进程、渲染进程、preload脚本
- 数据库层、服务层、IPC层
- Vue 3 + Element Plus UI框架

✅ **可运行的基础应用**
- 应用可以正常启动
- 页面导航正常工作
- 数据库正常连接

✅ **完善的开发环境**
- 日志系统
- 配置管理
- 事件总线
- 类型定义

### 下一步
继续阅读 **DEVELOPMENT_PHASES2.md** (阶段6-10),实现核心业务功能。

---

**文档维护**: AutoCutVideo 开发团队  
**最后更新**: 2025-11-13  
**版本**: v1.0.0

