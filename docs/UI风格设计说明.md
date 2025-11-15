# AutoCutVideo UI 风格设计说明

> 本文档基于市面上优秀视频下载、编辑工具的 UI 设计调研，为 AutoCutVideo 项目提供统一的视觉设计规范。

---

## 🎨 设计理念

### 核心原则
1. **简洁高效**：减少视觉干扰，突出核心功能
2. **直观易用**：降低学习成本，提升操作效率
3. **自动化优先**：强调自动剪辑流程，无需复杂的手动操作
4. **配置驱动**：通过简单的参数配置实现批量处理
5. **现代美观**：符合当代审美，提升用户体验

### 设计定位
本项目是**自动视频剪辑工具**，而非传统视频编辑器：
- ❌ **不需要**：时间轴、多轨道编辑、素材库、复杂的调整面板
- ✅ **重点是**：批量链接输入、自动剪辑参数配置、视频列表管理、批量导出
- ✅ **核心流程**：配置参数 → 批量输入链接 → 自动剪辑 → 选择下载/导出

---

## 📱 竞品 UI 调研

### 1. 剪映（CapCut）

**产品定位**：视频剪辑工具  
**开发商**：字节跳动

#### UI 特点分析

**✅ 优点：**
- **三栏布局**：左侧素材库、中间预览区、右侧属性面板，分工明确
- **深色主题**：专业感强，长时间使用不易疲劳
- **时间轴可视化**：清晰的时间轴，支持多轨道编辑
- **图标语义化**：图标设计直观，辅以文字说明
- **进度反馈**：实时进度条、加载动画，用户体验好

**参考要点：**
- 采用三栏式布局结构
- 深色主题为主，亮色主题为辅
- 重要操作使用明显的按钮和图标



---

### 2. FFmpeg GUI 工具（HandBrake）

**产品定位**：视频转码工具  
**开发商**：开源社区

#### UI 特点分析

**✅ 优点：**
- **配置面板清晰**：选项分组合理，参数可视化
- **预设功能**：内置常用预设，降低使用门槛
- **队列管理**：支持批量任务，队列可视化
- **跨平台一致性**：Windows/macOS/Linux 界面统一

**参考要点：**
- 配置项分组展示（手风琴/标签页）
- 提供常用预设模板
- 批量任务队列管理

#### 关键界面布局

```
┌─────────────────────────────────────────────────────────────┐
│ HandBrake                                       🗕  🗖  ✕   │
├─────────────────────────────────────────────────────────────┤
│ 文件 编辑 查看 工具 帮助                                      │
├─────────────────────────────────────────────────────────────┤
│ 源文件: [浏览...]  C:\Videos\input.mp4                       │
│ 目标位置: [浏览...] C:\Videos\output.mp4                     │
├─────────────────────────────────────────────────────────────┤
│ ┌ 摘要 ─────────────────────────────────────────────────┐  │
│ │ 预设: [Fast 1080p30]  ▾                               │  │
│ │                                                       │  │
│ │ [视频] [音频] [字幕] [章节]                            │  │
│ │                                                       │  │
│ │ 格式: MP4                                             │  │
│ │ 视频编码: H.264 (x264)                                │  │
│ │ 帧率: 30 FPS                                          │  │
│ │ 质量: RF 22                                           │  │
│ │ 音频: AAC (Core Audio)                                │  │
│ │                                                       │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ 队列:                                                       │
│ ┌──────────┬─────────────┬────────┬─────────┬──────────┐  │
│ │ 文件名    │ 状态         │ 进度   │ 大小    │ 操作     │  │
│ ├──────────┼─────────────┼────────┼─────────┼──────────┤  │
│ │ video1   │ 等待中       │ 0%     │ -       │ [删除]   │  │
│ │ video2   │ 处理中       │ 45%    │ 123MB   │ [暂停]   │  │
│ └──────────┴─────────────┴────────┴─────────┴──────────┘  │
│                                                             │
│                               [开始编码] [添加到队列]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. 4K Video Downloader

**产品定位**：视频下载工具  
**开发商**：OpenMedia

#### UI 特点分析

**✅ 优点：**
- **简洁直观**：主界面只保留核心功能
- **大按钮设计**："粘贴链接"按钮醒目，降低操作门槛
- **下载列表清晰**：缩略图 + 进度条 + 状态，信息完整
- **设置分类明确**：常规/下载/播放器，易于配置

**参考要点：**
- 主界面突出主要操作（输入链接/下载）
- 列表项使用卡片式设计，带缩略图
- 设置页面分类清晰

#### 关键界面布局

```
┌─────────────────────────────────────────────────────────────┐
│ 4K Video Downloader                            🗕  🗖  ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌─────────────────────────────┐               │
│              │     📋 粘贴链接              │               │
│              └─────────────────────────────┘               │
│                                                             │
│  或拖放链接到此处                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 下载列表:                                                   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [缩略图]  视频标题.mp4               🗑 ⏸ ⏯          │  │
│ │           状态: 下载中                                │  │
│ │           ████████████░░░░░░░░ 65% (123MB/189MB)     │  │
│ │           速度: 2.5 MB/s  剩余: 26秒                  │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [缩略图]  另一个视频.mp4              ✓                │  │
│ │           状态: 已完成                                │  │
│ │           ██████████████████████ 100% (256MB)        │  │
│ │           [打开文件夹] [播放]                         │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│                         [设置] [关于]                        │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Notion（参考其整体布局）

**产品定位**：协作工具  
**开发商**：Notion Labs

#### UI 特点分析

**✅ 优点：**
- **侧边栏 + 主内容区**：经典布局，空间利用率高
- **层级清晰**：面包屑导航、折叠面板
- **卡片式设计**：内容模块化，视觉统一
- **响应式布局**：适配不同屏幕尺寸

**参考要点：**
- 左侧导航 + 右侧主内容区
- 使用卡片/面板组织内容
- 支持亮色/暗色主题切换

---

## 🎨 AutoCutVideo 设计方案

### 1. 整体布局

#### 1.1 主窗口布局

```
┌─────────────────────────────────────────────────────────────────────┐
│ AutoCutVideo - 自动剪辑工具               ⚙️ ❓ 🗕  🗖  ✕           │  ← 标题栏
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  📥 批量  │                                                          │
│    输入  │                   主内容区                                │
│          │              （根据左侧选择的模块切换）                    │
│  🎬 视频  │                                                          │
│    管理  │                                                          │
│          │                                                          │
│  📦 导出  │                                                          │
│    下载  │                                                          │
│          │                                                          │
│  ⚙️ 设置  │                                                          │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
   侧边栏                        主内容区（占比 85%）
  （15%）

说明：
- 合并了下载和剪辑流程，强调批量自动化处理
- 移除了统计页面，简化为3个核心页面
```

#### 1.2 响应式设计

| 窗口宽度 | 布局调整 |
|---------|---------|
| **< 800px** | 侧边栏折叠为图标，悬停展开 |
| **800px - 1200px** | 侧边栏显示图标 + 文字 |
| **> 1200px** | 侧边栏完全展开，宽度 200px |

---

### 2. 色彩方案

#### 2.1 主题色

```scss
// 品牌主色
$primary: #409EFF;      // Element Plus 默认蓝（保持一致性）
$primary-light: #79BBFF;
$primary-dark: #337ECC;

// 辅助色
$success: #67C23A;      // 成功/完成
$warning: #E6A23C;      // 警告
$danger: #F56C6C;       // 错误/删除
$info: #909399;         // 信息

// 中性色
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$text-placeholder: #C0C4CC;

$border-base: #DCDFE6;
$border-light: #E4E7ED;
$border-lighter: #EBEEF5;
$border-extra-light: #F2F6FC;

$bg-base: #FFFFFF;
$bg-page: #F5F7FA;
$bg-overlay: rgba(0, 0, 0, 0.7);
```

#### 2.2 暗色主题

```scss
// 暗色主题变量
$dark-bg-base: #1E1E1E;
$dark-bg-elevated: #252526;
$dark-bg-overlay: rgba(0, 0, 0, 0.9);

$dark-text-primary: #E0E0E0;
$dark-text-secondary: #A0A0A0;
$dark-text-disabled: #606060;

$dark-border-base: #3E3E42;
$dark-border-light: #2E2E32;

// 主题色在暗色模式下保持不变
$dark-primary: #409EFF;
$dark-success: #67C23A;
$dark-warning: #E6A23C;
$dark-danger: #F56C6C;
```

#### 2.3 功能状态色

| 状态 | 颜色 | Hex | 用途 |
|------|------|-----|------|
| **等待中** | 灰色 | #909399 | 任务队列中 |
| **下载中** | 蓝色 | #409EFF | 正在下载 |
| **处理中** | 橙色 | #E6A23C | 正在剪辑 |
| **已完成** | 绿色 | #67C23A | 任务完成 |
| **失败** | 红色 | #F56C6C | 任务失败 |
| **已取消** | 灰色 | #C0C4CC | 用户取消 |

---

### 3. 排版规范

#### 3.1 字体

**西文字体：**
```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                   'Helvetica Neue', Helvetica, Arial, sans-serif;
```

**中文字体：**
```scss
$font-family-zh: 'PingFang SC', 'Microsoft YaHei', '微软雅黑', 
                 'Hiragino Sans GB', sans-serif;
```

**代码字体：**
```scss
$font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 
                   'Courier New', monospace;
```

#### 3.2 字号

| 类型 | 字号 | 行高 | 用途 |
|------|------|------|------|
| **标题 H1** | 24px | 32px | 页面主标题 |
| **标题 H2** | 20px | 28px | 区块标题 |
| **标题 H3** | 18px | 24px | 小节标题 |
| **正文** | 14px | 22px | 正文内容 |
| **辅助文字** | 13px | 20px | 说明文字 |
| **小字** | 12px | 18px | 提示信息 |

#### 3.3 间距

```scss
// 间距系统（4px 基准）
$space-xs: 4px;
$space-sm: 8px;
$space-md: 12px;
$space-lg: 16px;
$space-xl: 24px;
$space-xxl: 32px;
```

---

### 4. 组件设计规范

#### 4.1 按钮

**尺寸规格：**
| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| Large | 40px | 20px 16px | 14px |
| Default | 32px | 12px 15px | 14px |
| Small | 24px | 9px 11px | 13px |

**按钮类型：**
```vue
<!-- 主要按钮（强调操作） -->
<el-button type="primary">开始下载</el-button>

<!-- 次要按钮（普通操作） -->
<el-button>取消</el-button>

<!-- 危险按钮（删除等） -->
<el-button type="danger">删除</el-button>

<!-- 文字按钮（低优先级） -->
<el-button type="text">查看详情</el-button>

<!-- 图标按钮 -->
<el-button :icon="Download" circle />
```

#### 4.2 输入框

```vue
<!-- 标准输入框 -->
<el-input 
  v-model="url" 
  placeholder="请输入或粘贴视频链接"
  clearable
/>

<!-- 多行文本框 -->
<el-input 
  v-model="urls" 
  type="textarea" 
  :rows="6"
  placeholder="每行一个链接，支持批量粘贴"
/>

<!-- 带前缀图标 -->
<el-input 
  v-model="search" 
  placeholder="搜索视频"
  :prefix-icon="Search"
/>
```

#### 4.3 卡片

```vue
<el-card shadow="hover" class="video-card">
  <template #header>
    <div class="card-header">
      <span>视频标题</span>
      <el-button type="text">操作</el-button>
    </div>
  </template>
  
  <div class="card-content">
    <!-- 视频缩略图 -->
    <img src="thumbnail.jpg" alt="视频缩略图" />
    
    <!-- 视频信息 -->
    <div class="video-info">
      <p>文件大小: 123MB</p>
      <p>时长: 5:32</p>
    </div>
  </div>
  
  <template #footer>
    <el-button type="primary" size="small">开始剪辑</el-button>
  </template>
</el-card>
```

**卡片样式：**
```scss
.video-card {
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
```

#### 4.4 表格

```vue
<el-table 
  :data="taskList" 
  stripe
  :height="500"
  @selection-change="handleSelectionChange"
>
  <el-table-column type="selection" width="55" />
  
  <el-table-column prop="url" label="链接" min-width="200">
    <template #default="{ row }">
      <el-tooltip :content="row.url" placement="top">
        <span class="text-ellipsis">{{ row.url }}</span>
      </el-tooltip>
    </template>
  </el-table-column>
  
  <el-table-column prop="status" label="状态" width="100">
    <template #default="{ row }">
      <el-tag :type="getStatusType(row.status)">
        {{ row.status }}
      </el-tag>
    </template>
  </el-table-column>
  
  <el-table-column prop="progress" label="进度" width="200">
    <template #default="{ row }">
      <el-progress 
        :percentage="row.progress" 
        :status="getProgressStatus(row.status)"
      />
    </template>
  </el-table-column>
  
  <el-table-column label="操作" width="150">
    <template #default="{ row }">
      <el-button 
        type="primary" 
        size="small" 
        :icon="VideoPlay"
        @click="handlePlay(row)"
      >
        播放
      </el-button>
      <el-button 
        type="danger" 
        size="small" 
        :icon="Delete"
        @click="handleDelete(row)"
      />
    </template>
  </el-table-column>
</el-table>
```

#### 4.5 进度条

```vue
<!-- 线性进度条 -->
<el-progress 
  :percentage="progress" 
  :status="status"
  :show-text="true"
/>

<!-- 圆形进度条 -->
<el-progress 
  type="circle" 
  :percentage="progress"
  :width="80"
/>

<!-- 带速度信息的进度条 -->
<div class="progress-with-info">
  <el-progress :percentage="progress" />
  <div class="progress-text">
    <span>{{ downloadedSize }} / {{ totalSize }}</span>
    <span>速度: {{ speed }}</span>
    <span>剩余: {{ remaining }}</span>
  </div>
</div>
```

#### 4.6 状态标签

```vue
<el-tag type="info">等待中</el-tag>
<el-tag type="primary">下载中</el-tag>
<el-tag type="warning">处理中</el-tag>
<el-tag type="success">已完成</el-tag>
<el-tag type="danger">失败</el-tag>
```

---

### 5. 页面设计详解

#### 5.1 批量输入页面

**设计理念**：极简输入界面，专注批量链接处理和自动剪辑参数配置

```vue
<template>
  <div class="batch-input-page">
    <!-- 顶部说明 -->
    <el-alert
      title="批量自动剪辑流程"
      type="info"
      :closable="false"
      show-icon
    >
      <template #default>
        1. 配置自动剪辑参数 → 2. 粘贴视频链接 → 3. 点击开始处理 → 4. 在视频管理页查看结果
      </template>
    </el-alert>

    <!-- 自动剪辑配置（始终展开） -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>⚙️ 自动剪辑配置</span>
          <el-button type="text" @click="loadPreset">加载预设</el-button>
        </div>
      </template>

      <el-form :model="editConfig" label-width="120px" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频倍速">
              <el-slider 
                v-model="editConfig.speed" 
                :min="0.5" 
                :max="2.0" 
                :step="0.1"
                show-input
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="锐化强度">
              <el-slider 
                v-model="editConfig.sharpen" 
                :min="0" 
                :max="100"
                show-input
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="镜像翻转">
              <el-radio-group v-model="editConfig.flip">
                <el-radio label="none">无</el-radio>
                <el-radio label="h">左右</el-radio>
                <el-radio label="v">上下</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="原音频处理">
              <el-switch 
                v-model="editConfig.muteOriginal" 
                active-text="静音"
                inactive-text="保留"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="背景音乐目录">
          <el-input v-model="editConfig.musicDir" readonly>
            <template #append>
              <el-button :icon="Folder" @click="selectMusicDir">选择</el-button>
            </template>
          </el-input>
          <span class="form-tip">留空则不添加背景音乐</span>
        </el-form-item>

        <el-form-item label="保存路径">
          <el-input v-model="editConfig.outputDir" readonly>
            <template #append>
              <el-button :icon="Folder" @click="selectOutputDir">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量链接输入 -->
    <el-card class="links-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📥 批量输入视频链接</span>
          <div>
            <el-button type="text" :icon="Upload" @click="importFromFile">
              从文件导入
            </el-button>
            <el-button type="text" @click="clearLinks">清空</el-button>
          </div>
        </div>
      </template>

      <el-input
        v-model="linksText"
        type="textarea"
        :rows="10"
        placeholder="每行输入一个视频链接，支持抖音、小红书、Twitter、YouTube等平台&#10;&#10;示例：&#10;https://www.douyin.com/video/xxxxx&#10;https://www.xiaohongshu.com/explore/xxxxx&#10;https://twitter.com/user/status/xxxxx"
      />

      <div class="links-info">
        <el-tag type="info">{{ linkCount }} 个链接</el-tag>
        <span class="tip">支持的平台：抖音、小红书、Twitter、YouTube、B站</span>
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <el-button 
        type="primary" 
        size="large"
        :icon="VideoPlay"
        :loading="processing"
        :disabled="linkCount === 0"
        @click="startBatchProcess"
      >
        开始批量处理（下载 + 自动剪辑）
      </el-button>
      
      <el-button 
        size="large"
        @click="saveConfigOnly"
      >
        仅保存配置
      </el-button>
    </div>
  </div>
</template>
```

**样式：**
```scss
.batch-input-page {
  padding: $space-xl;
  max-width: 1200px;
  margin: 0 auto;

  .config-card,
  .links-card {
    margin-top: $space-lg;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .form-tip {
    font-size: 12px;
    color: $text-secondary;
    margin-left: $space-sm;
  }

  .links-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $space-md;

    .tip {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .action-bar {
    margin-top: $space-xl;
    padding: $space-lg;
    background: $bg-page;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    gap: $space-lg;
  }
}
```

#### 5.2 视频管理页面

**设计理念**：双列表展示原视频和剪辑后视频，支持查看、对比和选择下载

```vue
<template>
  <div class="video-management-page">
    <!-- 顶部筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="viewMode" size="large">
        <el-radio-button label="all">全部视频</el-radio-button>
        <el-radio-button label="raw">仅原视频</el-radio-button>
        <el-radio-button label="edited">仅剪辑后</el-radio-button>
        <el-radio-button label="compare">对比模式</el-radio-button>
      </el-radio-group>

      <div class="filter-right">
        <el-input 
          v-model="searchKeyword"
          placeholder="搜索文件名"
          :prefix-icon="Search"
          clearable
        />
        <el-button :icon="Refresh" @click="refreshList">刷新</el-button>
      </div>
    </div>
    
    <!-- 视频列表 -->
    <div v-if="viewMode === 'compare'" class="compare-view">
      <!-- 对比模式：左右分栏 -->
      <div class="compare-column">
        <div class="column-header">
          <h3>📥 原视频</h3>
          <el-tag>{{ rawVideos.length }} 个</el-tag>
        </div>
        <el-table 
          :data="rawVideos" 
          @selection-change="handleRawSelection"
          height="calc(100vh - 240px)"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="缩略图" width="100">
            <template #default="{ row }">
              <el-image 
                :src="row.thumbnail" 
                fit="cover"
                class="thumbnail"
                @click="previewVideo(row)"
              />
              </template>
          </el-table-column>
          <el-table-column prop="filename" label="文件名" min-width="200" />
          <el-table-column prop="duration" label="时长" width="80" />
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.statusText }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="compare-column">
        <div class="column-header">
          <h3>✂️ 剪辑后视频</h3>
          <el-tag type="success">{{ editedVideos.length }} 个</el-tag>
        </div>
        <el-table 
          :data="editedVideos" 
          @selection-change="handleEditedSelection"
          height="calc(100vh - 240px)"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="缩略图" width="100">
            <template #default="{ row }">
              <el-image 
                :src="row.thumbnail" 
                fit="cover"
                class="thumbnail"
                @click="previewVideo(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="filename" label="文件名" min-width="200" />
          <el-table-column prop="duration" label="时长" width="80" />
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <el-progress 
                v-if="row.status === 'processing'"
                :percentage="row.progress"
                :status="getProgressStatus(row)"
              />
              <el-tag v-else type="success">已完成</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 普通列表模式 -->
      <el-table 
      v-else
      :data="filteredVideos" 
      @selection-change="handleSelection"
      height="calc(100vh - 240px)"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="缩略图" width="100">
        <template #default="{ row }">
          <el-image 
            :src="row.thumbnail" 
            fit="cover"
            class="thumbnail"
            @click="previewVideo(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="filename" label="文件名" min-width="250" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isEdited ? 'success' : 'info'">
            {{ row.isEdited ? '剪辑后' : '原视频' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="100" />
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small"
            :icon="VideoPlay"
            @click="previewVideo(row)"
          >
            预览
          </el-button>
          <el-button 
            size="small"
            :icon="Download"
            @click="downloadSingle(row)"
          >
            下载
          </el-button>
        </template>
      </el-table-column>
      </el-table>

    <!-- 底部批量操作栏 -->
    <div v-if="selectedVideos.length > 0" class="batch-actions">
      <div class="selection-info">
        <el-icon><Select /></el-icon>
        <span>已选择 {{ selectedVideos.length }} 个视频</span>
    </div>
    
      <div class="action-buttons">
      <el-button 
        type="primary" 
          :icon="Download"
          @click="batchDownload"
      >
          批量下载
      </el-button>
        
        <el-button 
          type="success"
          :icon="FolderOpened"
          @click="showExportDialog"
        >
          导出并压缩
        </el-button>
        
      <el-button 
        type="danger" 
          :icon="Delete"
        @click="batchDelete"
      >
        批量删除
      </el-button>
        
        <el-button @click="clearSelection">取消选择</el-button>
    </div>
    </div>

    <!-- 视频预览对话框 -->
    <el-dialog 
      v-model="previewVisible" 
      title="视频预览"
      width="800px"
      center
    >
      <video 
        v-if="previewVideo"
        :src="previewVideo.path"
        controls
        class="preview-video"
      />
    </el-dialog>
  </div>
</template>
```

**样式：**
```scss
.video-management-page {
  padding: $space-lg;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-lg;
    padding: $space-md;
    background: $bg-base;
    border-radius: 8px;
    
    .filter-right {
      display: flex;
      gap: $space-sm;
    }
  }
  
  .compare-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-lg;
    flex: 1;

    .compare-column {
      border: 1px solid $border-light;
      border-radius: 8px;
      overflow: hidden;

      .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $space-md $space-lg;
        background: $bg-page;
        border-bottom: 1px solid $border-light;

        h3 {
          margin: 0;
          font-size: 16px;
        }
      }
    }
  }

  .thumbnail {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.1);
    }
  }
  
  .batch-actions {
    position: fixed;
    bottom: $space-xl;
    left: 50%;
    transform: translateX(-50%);
    padding: $space-md $space-xl;
    background: $primary;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: $space-xl;
    z-index: 1000;

    .selection-info {
      display: flex;
      align-items: center;
      gap: $space-sm;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: $space-sm;
    }
  }

  .preview-video {
    width: 100%;
    max-height: 500px;
  }
}
```

#### 5.3 导出下载页面

**设计理念**：支持批量导出、压缩打包、同时删除旧数据

```vue
<template>
  <div class="export-download-page">
    <!-- 说明卡片 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>导出说明</span>
        </div>
      </template>
      <ul class="info-list">
        <li>✅ 选择需要导出的视频（支持同时选择原视频和剪辑后视频）</li>
        <li>✅ 导出到指定目录，可选择压缩为ZIP格式</li>
        <li>✅ 导出后可选择删除源文件，释放磁盘空间</li>
        <li>⚠️ 删除操作不可恢复，请谨慎选择</li>
      </ul>
    </el-card>

    <!-- 导出配置 -->
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <span>📦 导出配置</span>
        </div>
      </template>

      <el-form :model="exportConfig" label-width="140px">
        <el-form-item label="导出目录">
          <el-input v-model="exportConfig.outputDir" readonly>
            <template #append>
              <el-button :icon="Folder" @click="selectOutputDir">选择</el-button>
            </template>
          </el-input>
          <span class="form-tip">建议选择空间充足的磁盘</span>
        </el-form-item>

        <el-form-item label="压缩选项">
          <el-switch 
            v-model="exportConfig.compress"
            active-text="压缩为ZIP"
            inactive-text="直接复制文件"
          />
          <span class="form-tip">压缩可减小传输体积</span>
        </el-form-item>

        <el-form-item v-if="exportConfig.compress" label="压缩包名称">
          <el-input 
            v-model="exportConfig.zipName"
            placeholder="默认使用时间戳命名"
          >
            <template #suffix>.zip</template>
          </el-input>
        </el-form-item>

        <el-form-item label="文件重命名规则">
          <el-select v-model="exportConfig.renameRule" style="width: 100%">
            <el-option label="保持原文件名" value="keep" />
            <el-option label="添加前缀" value="prefix" />
            <el-option label="添加后缀" value="suffix" />
            <el-option label="添加时间戳" value="timestamp" />
          </el-select>
        </el-form-item>

        <el-form-item 
          v-if="exportConfig.renameRule === 'prefix'" 
          label="文件名前缀"
        >
          <el-input 
            v-model="exportConfig.prefix"
            placeholder="例如：edited_"
          />
        </el-form-item>

        <el-form-item 
          v-if="exportConfig.renameRule === 'suffix'" 
          label="文件名后缀"
        >
          <el-input 
            v-model="exportConfig.suffix"
            placeholder="例如：_final"
          />
        </el-form-item>

        <el-divider />

        <el-form-item label="导出后操作">
          <el-checkbox-group v-model="exportConfig.postActions">
            <el-checkbox label="deleteSource">
              删除源文件（原视频和剪辑后视频）
            </el-checkbox>
            <el-checkbox label="deleteDatabase">
              清除数据库记录
            </el-checkbox>
            <el-checkbox label="openFolder">
              导出完成后打开目标文件夹
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-alert
          v-if="exportConfig.postActions.includes('deleteSource')"
          title="警告：删除操作不可恢复！"
          type="warning"
          show-icon
          :closable="false"
        />
      </el-form>
    </el-card>

    <!-- 待导出视频列表 -->
    <el-card shadow="hover" class="video-list-card">
      <template #header>
        <div class="card-header">
          <span>📹 待导出视频列表</span>
          <el-button type="primary" :icon="Plus" @click="showSelectDialog">
            选择视频
          </el-button>
        </div>
      </template>

      <el-empty 
        v-if="selectedForExport.length === 0"
        description="请先选择需要导出的视频"
      />

      <el-table 
        v-else
        :data="selectedForExport"
        max-height="400"
      >
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="缩略图" width="100">
          <template #default="{ row }">
            <el-image 
              :src="row.thumbnail" 
              fit="cover"
              class="thumbnail"
            />
          </template>
        </el-table-column>
        <el-table-column prop="filename" label="文件名" min-width="250" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isEdited ? 'success' : 'info'">
              {{ row.isEdited ? '剪辑后' : '原视频' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column label="操作" width="100">
          <template #default="{ row, $index }">
            <el-button 
              type="danger" 
              size="small"
              text
              :icon="Delete"
              @click="removeFromExportList($index)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="selectedForExport.length > 0" class="summary">
        <el-statistic title="总文件数" :value="selectedForExport.length" />
        <el-statistic title="总大小" :value="totalSize" suffix="MB" />
        <el-statistic 
          v-if="exportConfig.compress"
          title="预计压缩后"
          :value="estimatedZipSize"
          suffix="MB"
        />
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <el-button 
        type="primary" 
        size="large"
        :icon="Download"
        :loading="exporting"
        :disabled="selectedForExport.length === 0 || !exportConfig.outputDir"
        @click="startExport"
      >
        开始导出 ({{ selectedForExport.length }} 个文件)
      </el-button>

      <el-button 
        size="large"
        @click="resetExport"
      >
        重置
      </el-button>
    </div>

    <!-- 导出进度对话框 -->
    <el-dialog
      v-model="progressVisible"
      title="导出进度"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress 
          :percentage="exportProgress"
          :status="exportStatus"
        />
        <div class="progress-text">
          <span>{{ currentExportFile }}</span>
          <span>{{ exportProgress }}%</span>
        </div>

        <el-timeline class="export-timeline">
          <el-timeline-item 
            v-for="step in exportSteps"
            :key="step.name"
            :type="getStepType(step.status)"
            :icon="getStepIcon(step.status)"
          >
            {{ step.name }} - {{ step.status }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button 
          v-if="exportStatus === 'success'"
          type="primary"
          @click="finishExport"
        >
          完成
        </el-button>
        <el-button 
          v-else-if="exportStatus === 'exception'"
          type="danger"
          @click="retryExport"
        >
          重试
        </el-button>
        <el-button 
          v-else
          @click="cancelExport"
        >
          取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

**样式：**
```scss
.export-download-page {
  padding: $space-xl;
  max-width: 1400px;
  margin: 0 auto;

  .info-card,
  .config-card,
  .video-list-card {
    margin-bottom: $space-lg;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    gap: $space-sm;
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: $space-sm 0;
      line-height: 1.6;
    }
  }

  .form-tip {
    font-size: 12px;
    color: $text-secondary;
    margin-left: $space-sm;
  }

  .thumbnail {
    width: 80px;
    height: 60px;
    border-radius: 4px;
  }

  .summary {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: $space-lg;
    padding: $space-lg;
    background: $bg-page;
    border-radius: 8px;
  }

  .action-bar {
    margin-top: $space-xl;
    padding: $space-lg;
    background: $bg-page;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    gap: $space-lg;
  }

  .progress-content {
    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-top: $space-md;
      font-size: 14px;
      color: $text-secondary;
    }

    .export-timeline {
      margin-top: $space-lg;
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
```

---

### 6. 动画效果

#### 6.1 页面过渡

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
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

#### 6.2 列表动画

```vue
<transition-group name="list" tag="div">
  <div 
    v-for="item in items" 
    :key="item.id" 
    class="list-item"
  >
    {{ item.name }}
  </div>
</transition-group>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>
```

#### 6.3 加载动画

```vue
<el-skeleton :rows="5" animated />

<!-- 自定义加载动画 -->
<div class="loading-spinner">
  <el-icon :size="32" class="is-loading">
    <Loading />
  </el-icon>
  <p>正在处理...</p>
</div>
```

---

### 7. 图标系统

使用 **Element Plus Icons** + **自定义 SVG 图标**

#### 7.1 常用图标

```typescript
import {
  Download,      // 下载
  VideoPlay,     // 播放
  VideoPause,    // 暂停
  Delete,        // 删除
  Edit,          // 编辑
  View,          // 查看
  Setting,       // 设置
  Folder,        // 文件夹
  Document,      // 文档
  Plus,          // 添加
  Search,        // 搜索
  Filter,        // 筛选
  Upload,        // 上传
  Close,         // 关闭
  Check,         // 完成
  Warning,       // 警告
  CircleCheck,   // 成功
  CircleClose    // 失败
} from '@element-plus/icons-vue'
```

#### 7.2 平台图标

为不同视频平台设计专属图标：

```vue
<!-- 抖音 -->
<svg class="platform-icon tiktok">...</svg>

<!-- 小红书 -->
<svg class="platform-icon xiaohongshu">...</svg>

<!-- Twitter -->
<svg class="platform-icon twitter">...</svg>

<!-- YouTube -->
<svg class="platform-icon youtube">...</svg>
```

---

### 8. 响应式设计

#### 8.1 断点定义

```scss
$breakpoints: (
  'xs': 0,
  'sm': 768px,
  'md': 992px,
  'lg': 1200px,
  'xl': 1920px
);

// 媒体查询混合宏
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

#### 8.2 响应式布局

```scss
.container {
  padding: $space-md;
  
  @include respond-to('md') {
    padding: $space-lg;
  }
  
  @include respond-to('lg') {
    padding: $space-xl;
  }
}

.grid {
  display: grid;
  gap: $space-lg;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  
  @include respond-to('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to('md') {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to('lg') {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

### 9. 无障碍设计

#### 9.1 键盘导航

```vue
<el-button 
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space="handleClick"
>
  确定
</el-button>
```

#### 9.2 ARIA 属性

```vue
<div 
  role="alert" 
  aria-live="polite"
  aria-atomic="true"
>
  {{ message }}
</div>

<button 
  aria-label="删除任务"
  :aria-disabled="isDisabled"
>
  <el-icon><Delete /></el-icon>
</button>
```

---

### 10. 设计资源

#### 10.1 设计工具
- **Figma**：原型设计
- **Adobe XD**：UI 设计
- **Sketch**：UI 设计（macOS）

#### 10.2 参考资源
- [Element Plus 组件库](https://element-plus.org/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Dribbble 设计灵感](https://dribbble.com/)

---

## ✅ 设计检查清单

在实现 UI 时，请确保：

- [ ] 色彩使用符合设计规范
- [ ] 字号和间距使用预定义变量
- [ ] 按钮尺寸和类型使用正确
- [ ] 卡片有 hover 效果
- [ ] 进度条显示实时进度
- [ ] 状态标签颜色正确
- [ ] 响应式布局适配不同屏幕
- [ ] 暗色主题正常显示
- [ ] 动画流畅自然
- [ ] 支持键盘导航
- [ ] 无障碍属性完整

---

**更新时间：** 2025-11-13  
**维护者：** AutoCutVideo 开发团队


