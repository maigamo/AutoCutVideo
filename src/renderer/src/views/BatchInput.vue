<template>
  <div class="batch-input-page">
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

    <el-card class="config-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>⚙️ 自动剪辑配置</span>
          <el-button type="text" @click="loadPreset">加载预设</el-button>
        </div>
      </template>

      <el-form :model="editConfig" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频倍速">
              <el-slider v-model="editConfig.speed" :min="0.5" :max="2.0" :step="0.1" show-input />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="锐化强度">
              <el-slider v-model="editConfig.sharpen" :min="0" :max="100" show-input />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="镜像翻转">
              <el-radio-group v-model="editConfig.flip">
                <el-radio value="none">无</el-radio>
                <el-radio value="h">左右</el-radio>
                <el-radio value="v">上下</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原音频">
              <el-switch v-model="editConfig.muteOriginal" active-text="静音" inactive-text="保留" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="links-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>📥 批量输入视频链接</span>
          <el-button type="text" @click="clearLinks">清空</el-button>
        </div>
      </template>

      <el-input
        v-model="linksText"
        type="textarea"
        :rows="10"
        placeholder="每行输入一个视频链接，支持抖音、小红书、Twitter、YouTube等平台"
      />

      <div class="links-info" style="margin-top: 16px;">
        <el-tag type="info">{{ linkCount }} 个链接</el-tag>
      </div>
    </el-card>

    <div class="action-bar" style="margin-top: 24px; text-align: center;">
      <el-button type="primary" size="large" :loading="processing" :disabled="linkCount === 0" @click="startProcess">
        开始批量处理
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '../stores/task.store'

const taskStore = useTaskStore()

const editConfig = ref({
  speed: 1.2,
  sharpen: 0.1,
  flip: 'none',
  muteOriginal: true,
  randomMusic: true,
  // 画质增强配置
  resolution: '2560x1440',  // 2K分辨率
  fps: 60,                   // 60帧
  videoBitrate: '20000k',    // 20Mbps
  crf: 0,                    // 无损质量
  preset: 'veryslow'         // 最高画质预设
})

const linksText = ref('')
const processing = ref(false)

const linkCount = computed(() => {
  return linksText.value.split('\n').filter(line => line.trim()).length
})

// 页面初始化时加载预设配置
onMounted(async () => {
  await loadPreset()
})

// 从设置中加载预设配置
const loadPreset = async () => {
  try {
    // 检查 API 是否可用
    if (!window.api) {
      console.warn('Electron API 未就绪，使用默认配置')
      return
    }
    
    const result = await window.api.invoke('settings:get')
    if (result.success && result.data.editing) {
      const editing = result.data.editing
      editConfig.value = {
        speed: editing.defaultSpeed || 1.2,
        sharpen: editing.defaultSharpen * 100 || 10, // 转换为0-100的范围
        flip: editing.defaultFlip || 'none', // 读取镜像翻转配置
        muteOriginal: editing.muteOriginalAudio !== false,
        randomMusic: editing.randomMusic !== false,
        // 画质增强配置
        resolution: editing.defaultResolution || '2560x1440',
        fps: editing.defaultFps || 60,
        videoBitrate: editing.defaultVideoBitrate || '20000k',
        crf: editing.defaultCRF !== undefined ? editing.defaultCRF : 0,
        preset: editing.defaultPreset || 'veryslow'
      }
      ElMessage.success('已加载预设配置')
    }
  } catch (error) {
    console.error('加载预设配置失败:', error)
    ElMessage.warning('加载预设配置失败，使用默认配置')
  }
}

const clearLinks = () => {
  linksText.value = ''
}

// 开始批量处理
const startProcess = async () => {
  if (linkCount.value === 0) {
    ElMessage.warning('请先输入视频链接')
    return
  }

  // 检查 API 是否可用
  if (!window.api) {
    ElMessage.error('系统未就绪，请稍后重试')
    return
  }

  processing.value = true
  
  try {
    // 解析链接
    const links = linksText.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    console.log('开始处理视频链接:', links)
    ElMessage.info(`开始处理 ${links.length} 个视频`)
    
    // 转换为普通对象（避免 Vue 响应式对象序列化问题）
    const plainEditConfig = JSON.parse(JSON.stringify(editConfig.value))
    
    // 创建批次
    const batchResult = await window.api.invoke('db:batch:create', {
      name: `批次_${new Date().toLocaleString('zh-CN')}`,
      total_count: links.length,
      edit_config: plainEditConfig
    })
    
    if (!batchResult.success) {
      throw new Error(batchResult.error || '创建批次失败')
    }
    
    const batchId = batchResult.data.id
    console.log('批次创建成功:', batchId)
    
    // 为每个链接创建下载任务
    let successCount = 0
    let failCount = 0
    
    for (const url of links) {
      try {
        console.log('创建下载任务:', url)
        const taskResult = await window.api.invoke('download:task:create', {
          batchId,
          url,
          editConfig: plainEditConfig
        })
        
        if (taskResult.success) {
          console.log('下载任务创建成功:', taskResult.data)
          // 立即启动下载任务
          const startResult = await window.api.invoke('download:task:start', taskResult.data.id)
          if (startResult.success) {
            successCount++
            console.log('下载任务已启动:', taskResult.data.id)
          } else {
            failCount++
            console.error('启动下载任务失败:', startResult.error)
          }
        } else {
          failCount++
          console.error('创建下载任务失败:', taskResult.error)
        }
      } catch (error) {
        failCount++
        console.error('处理链接失败:', url, error)
      }
    }
    
    // 显示结果
    if (successCount > 0) {
      ElMessage.success(`成功启动 ${successCount} 个下载任务`)
    }
    if (failCount > 0) {
      ElMessage.warning(`${failCount} 个任务启动失败`)
    }
    
    // 清空输入
    linksText.value = ''
    
  } catch (error: any) {
    console.error('批量处理失败:', error)
    ElMessage.error(`批量处理失败: ${error.message}`)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped lang="scss">
.batch-input-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
