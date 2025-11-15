<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="通用" name="general">
        <el-form :model="settings.general" label-width="140px">
          <el-form-item label="语言">
            <el-select v-model="settings.general.language">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>

          <el-form-item label="主题">
            <el-radio-group v-model="settings.general.theme">
              <el-radio value="light">亮色</el-radio>
              <el-radio value="dark">暗色</el-radio>
              <el-radio value="auto">自动</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="开机自动启动">
            <el-switch v-model="settings.general.startOnBoot" />
          </el-form-item>
          
          <el-form-item label="最小化到托盘">
            <el-switch v-model="settings.general.minimizeToTray" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="路径配置" name="paths">
        <el-form :model="pathDisplay" label-width="140px">
          <el-form-item label="下载目录">
            <div style="display: flex; width: 100%; gap: 8px;">
              <el-input 
                :value="pathDisplay.downloadDir" 
                readonly
                :placeholder="defaultPaths.downloadDir"
              />
              <el-button @click="selectPath('downloadDir')">选择</el-button>
              <el-button 
                v-if="isCustomPath.downloadDir" 
                @click="resetPath('downloadDir')"
                type="warning"
              >
                恢复默认
              </el-button>
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              {{ isCustomPath.downloadDir ? '自定义路径' : '默认路径' }}
            </div>
          </el-form-item>

          <el-form-item label="输出目录">
            <div style="display: flex; width: 100%; gap: 8px;">
              <el-input 
                :value="pathDisplay.outputDir" 
                readonly
                :placeholder="defaultPaths.outputDir"
              />
              <el-button @click="selectPath('outputDir')">选择</el-button>
              <el-button 
                v-if="isCustomPath.outputDir" 
                @click="resetPath('outputDir')"
                type="warning"
              >
                恢复默认
              </el-button>
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              {{ isCustomPath.outputDir ? '自定义路径' : '默认路径' }}
            </div>
          </el-form-item>

          <el-form-item label="音乐目录">
            <div style="display: flex; width: 100%; gap: 8px;">
              <el-input 
                :value="pathDisplay.musicDir" 
                readonly
                :placeholder="defaultPaths.musicDir"
              />
              <el-button @click="selectPath('musicDir')">选择</el-button>
              <el-button 
                v-if="isCustomPath.musicDir" 
                @click="resetPath('musicDir')"
                type="warning"
              >
                恢复默认
              </el-button>
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              {{ isCustomPath.musicDir ? '自定义路径' : '默认路径' }}
            </div>
          </el-form-item>

          <el-form-item label="临时目录">
            <div style="display: flex; width: 100%; gap: 8px;">
              <el-input 
                :value="pathDisplay.tempDir" 
                readonly
                :placeholder="defaultPaths.tempDir"
              />
              <el-button @click="selectPath('tempDir')">选择</el-button>
              <el-button 
                v-if="isCustomPath.tempDir" 
                @click="resetPath('tempDir')"
                type="warning"
              >
                恢复默认
              </el-button>
            </div>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              {{ isCustomPath.tempDir ? '自定义路径' : '默认路径' }}
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="剪辑预设" name="editing">
        <el-form :model="settings.editing" label-width="140px">
          <el-form-item label="默认视频倍速">
            <el-slider 
              v-model="settings.editing.defaultSpeed" 
              :min="0.5" 
              :max="2.0" 
              :step="0.1" 
              show-input 
            />
          </el-form-item>

          <el-form-item label="默认锐化强度">
            <el-slider 
              v-model="settings.editing.defaultSharpen" 
              :min="0" 
              :max="1" 
              :step="0.01" 
              show-input 
            />
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              建议值：0.1（10%锐化）
            </div>
          </el-form-item>

          <el-form-item label="默认CRF质量">
            <el-slider 
              v-model="settings.editing.defaultCRF" 
              :min="0" 
              :max="51" 
              :step="1" 
              show-input 
            />
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              数值越小质量越好但文件越大（0=无损，16=超高质量，23=标准，51=最低质量）
            </div>
          </el-form-item>

          <el-form-item label="编码预设">
            <el-select v-model="settings.editing.defaultPreset">
              <el-option label="ultrafast（最快，画质差）" value="ultrafast" />
              <el-option label="superfast（超快）" value="superfast" />
              <el-option label="veryfast（很快）" value="veryfast" />
              <el-option label="faster（较快）" value="faster" />
              <el-option label="fast（快）" value="fast" />
              <el-option label="medium（中等）" value="medium" />
              <el-option label="slow（慢，质量好）" value="slow" />
              <el-option label="slower（很慢，质量更好）" value="slower" />
              <el-option label="veryslow（极慢，最高画质）" value="veryslow" />
            </el-select>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              veryslow = 最高画质（速度最慢但质量最好）
            </div>
          </el-form-item>

          <el-form-item label="默认镜像翻转">
            <el-radio-group v-model="settings.editing.defaultFlip">
              <el-radio value="none">无</el-radio>
              <el-radio value="h">左右翻转</el-radio>
              <el-radio value="v">上下翻转</el-radio>
            </el-radio-group>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              设置默认的镜像翻转方式，批量输入时会自动读取此配置
            </div>
          </el-form-item>

          <el-form-item label="静音原音频">
            <el-switch v-model="settings.editing.muteOriginalAudio" />
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              开启后将自动静音原视频音频
            </div>
          </el-form-item>

          <el-form-item label="随机背景音乐">
            <el-switch v-model="settings.editing.randomMusic" />
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              开启后将从音乐目录随机选择背景音乐
            </div>
          </el-form-item>

          <el-divider content-position="left">画质增强设置</el-divider>

          <el-form-item label="输出分辨率">
            <el-select v-model="settings.editing.defaultResolution">
              <el-option label="原始分辨率（不改变）" value="" />
              <el-option label="1920x1080 (1080p)" value="1920x1080" />
              <el-option label="2560x1440 (2K)" value="2560x1440" />
              <el-option label="3840x2160 (4K)" value="3840x2160" />
            </el-select>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              选择输出视频的分辨率，空值表示保持原始分辨率
            </div>
          </el-form-item>

          <el-form-item label="输出帧率">
            <el-input-number 
              v-model="settings.editing.defaultFps" 
              :min="0" 
              :max="120" 
              :step="1"
            />
            <span style="margin-left: 8px;">fps</span>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              0表示保持原始帧率，推荐值：60（高帧率）、30（标准）
            </div>
          </el-form-item>

          <el-form-item label="视频码率">
            <el-input v-model="settings.editing.defaultVideoBitrate" placeholder="例如: 20000k">
              <template #append>kbps</template>
            </el-input>
            <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
              视频码率，数值越大画质越好文件越大。空值使用自动码率。推荐：20000k (20Mbps)
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="日志配置" name="logging">
        <el-form :model="settings.logging" label-width="140px">
          <el-form-item label="日志级别">
            <el-select v-model="settings.logging.level">
              <el-option label="错误" value="error" />
              <el-option label="警告" value="warn" />
              <el-option label="信息" value="info" />
              <el-option label="调试" value="debug" />
            </el-select>
          </el-form-item>

          <el-form-item label="单个日志文件大小">
            <el-input-number 
              v-model="settings.logging.maxFileSize" 
              :min="1" 
              :max="100"
            />
            <span style="margin-left: 8px;">MB</span>
          </el-form-item>

          <el-form-item label="日志保留时间">
            <el-input-number 
              v-model="settings.logging.maxFiles" 
              :min="1" 
              :max="3650"
            />
            <span style="margin-left: 8px;">天</span>
          </el-form-item>

          <el-form-item label="控制台输出">
            <el-switch v-model="settings.logging.consoleOutput" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="关于" name="about">
        <div class="about-content">
          <h1>AutoCutVideo</h1>
          <p>版本 1.0.0</p>
          <el-descriptions :column="1" border style="margin-top: 20px;">
            <el-descriptions-item label="应用名称">AutoCutVideo</el-descriptions-item>
            <el-descriptions-item label="版本号">1.0.0</el-descriptions-item>
            <el-descriptions-item label="描述">自动化视频剪辑工具</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="action-bar" style="margin-top: 24px; text-align: center;">
      <el-button size="large" @click="resetSettings">重置为默认</el-button>
      <el-button type="primary" size="large" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('general')

const settings = ref({
  general: {
    language: 'zh-CN',
    theme: 'auto' as 'light' | 'dark' | 'auto',
    startOnBoot: false,
    minimizeToTray: true
  },
  paths: {
    downloadDir: '',
    outputDir: '',
    musicDir: '',
    tempDir: '',
    customDownloadDir: undefined as string | undefined,
    customOutputDir: undefined as string | undefined,
    customMusicDir: undefined as string | undefined,
    customTempDir: undefined as string | undefined
  },
  editing: {
    defaultSpeed: 1.2,
    defaultSharpen: 0.1,
    defaultCRF: 0,  // CRF值越小画质越好，0为无损质量
    defaultPreset: 'veryslow',  // veryslow为最高画质的编码预设
    defaultFlip: 'none' as 'none' | 'h' | 'v',
    muteOriginalAudio: true,
    randomMusic: true,
    // 画质增强配置
    defaultResolution: '2560x1440',  // 2K分辨率
    defaultFps: 60,                   // 60帧
    defaultVideoBitrate: '20000k'     // 20Mbps
  },
  logging: {
    level: 'info' as 'error' | 'warn' | 'info' | 'debug',
    maxFileSize: 20,
    maxFiles: 365,
    consoleOutput: true
  }
})

const defaultPaths = ref({
  downloadDir: '',
  outputDir: '',
  musicDir: '',
  tempDir: ''
})

const isCustomPath = ref({
  downloadDir: false,
  outputDir: false,
  musicDir: false,
  tempDir: false
})

// 显示的路径
const pathDisplay = computed(() => ({
  downloadDir: isCustomPath.value.downloadDir 
    ? (settings.value.paths.customDownloadDir || defaultPaths.value.downloadDir)
    : defaultPaths.value.downloadDir,
  outputDir: isCustomPath.value.outputDir 
    ? (settings.value.paths.customOutputDir || defaultPaths.value.outputDir)
    : defaultPaths.value.outputDir,
  musicDir: isCustomPath.value.musicDir 
    ? (settings.value.paths.customMusicDir || defaultPaths.value.musicDir)
    : defaultPaths.value.musicDir,
  tempDir: isCustomPath.value.tempDir 
    ? (settings.value.paths.customTempDir || defaultPaths.value.tempDir)
    : defaultPaths.value.tempDir
}))

// 加载设置
const loadSettings = async () => {
  try {
    const result = await window.api.invoke('settings:get')
    if (result.success) {
      settings.value = result.data
    }
    
    // 加载默认路径
    const defaultResult = await window.api.invoke('settings:paths:defaults')
    if (defaultResult.success) {
      defaultPaths.value = defaultResult.data
    }
    
    // 检查各个路径是否为自定义
    const pathTypes = ['downloadDir', 'outputDir', 'musicDir', 'tempDir'] as const
    for (const pathType of pathTypes) {
      const customResult = await window.api.invoke('settings:paths:isCustom', pathType)
      if (customResult.success) {
        isCustomPath.value[pathType] = customResult.data
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error('加载设置失败')
  }
}

// 选择路径
const selectPath = async (pathType: string) => {
  try {
    const result = await window.api.invoke('settings:paths:select', pathType)
    if (result.success) {
      ElMessage.success('路径已更新')
      // 重新加载设置
      await loadSettings()
    }
  } catch (error) {
    console.error('选择路径失败:', error)
    ElMessage.error('选择路径失败')
  }
}

// 恢复默认路径
const resetPath = async (pathType: string) => {
  try {
    const result = await window.api.invoke('settings:paths:resetToDefault', pathType)
    if (result.success) {
      ElMessage.success('已恢复为默认路径')
      // 重新加载设置
      await loadSettings()
    }
  } catch (error) {
    console.error('恢复默认路径失败:', error)
    ElMessage.error('恢复默认路径失败')
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    // 准备要保存的设置，排除 paths（路径单独管理）
    // 使用 JSON.parse(JSON.stringify()) 确保对象可以被克隆
    const settingsToSave = JSON.parse(JSON.stringify({
      general: settings.value.general,
      editing: settings.value.editing,
      logging: settings.value.logging
    }))
    
    const result = await window.api.invoke('settings:set', settingsToSave)
    if (result.success) {
      ElMessage.success('设置已保存')
    } else {
      ElMessage.error(result.error || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 重置设置
const resetSettings = async () => {
  try {
    const result = await window.api.invoke('settings:reset')
    if (result.success) {
      ElMessage.success('已重置为默认设置')
      await loadSettings()
    } else {
      ElMessage.error(result.error || '重置失败')
    }
  } catch (error) {
    console.error('重置设置失败:', error)
    ElMessage.error('重置设置失败')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.about-content {
  text-align: center;
  padding: 40px;

  h1 {
    margin: 0;
    font-size: 32px;
  }

  p {
    color: var(--el-text-color-secondary);
  }
}
</style>
