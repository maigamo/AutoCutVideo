<template>
  <div class="export-page">
    <el-card class="config-card" shadow="hover">
      <template #header>
        <span>⚙️ 导出配置</span>
      </template>

      <el-form :model="exportConfig" label-width="120px">
        <el-form-item label="导出目录">
          <el-input v-model="exportConfig.outputDir" readonly>
            <template #append>
              <el-button @click="selectDir">选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="重命名规则">
          <el-radio-group v-model="exportConfig.renameRule">
            <el-radio value="keep">保持原名</el-radio>
            <el-radio value="timestamp">添加时间戳</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="压缩为ZIP">
          <el-switch v-model="exportConfig.compress" />
        </el-form-item>
        
        <el-form-item label="导出后操作">
          <el-checkbox v-model="exportConfig.deleteSource">删除源文件</el-checkbox>
          <div style="margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary);">
            ⚠️ 谨慎操作：删除后无法恢复
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="videos-card" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>📦 待导出视频列表（{{ selectedVideos.length }} 个）</span>
          <div>
            <el-button type="primary" size="small" @click="selectFromLibrary">从视频库选择</el-button>
            <el-button type="text" @click="clearVideos">清空</el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="selectedVideos.length === 0" description="暂无待导出视频，点击上方按钮从视频库选择" />

      <el-table v-else :data="selectedVideos" max-height="400">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_edited ? 'success' : 'info'" size="small">
              {{ row.is_edited ? '剪辑后' : '原视频' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" size="small" link @click="removeVideo($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="selectedVideos.length > 0" style="margin-top: 16px; padding: 12px; background: var(--el-fill-color-light); border-radius: 4px;">
        <div style="display: flex; justify-content: space-between;">
          <span>总文件数：<strong>{{ selectedVideos.length }}</strong> 个</span>
          <span>总大小：<strong>{{ totalSize }}</strong></span>
        </div>
      </div>
    </el-card>

    <div class="action-bar" style="margin-top: 24px; text-align: center;">
      <el-button 
        type="primary" 
        size="large" 
        :disabled="selectedVideos.length === 0 || !exportConfig.outputDir" 
        :loading="exporting"
        @click="startExport"
      >
        {{ exporting ? '导出中...' : '开始导出' }}
      </el-button>
      <el-button size="large" @click="resetConfig">重置配置</el-button>
    </div>
    
    <!-- 视频选择对话框 -->
    <el-dialog v-model="selectDialogVisible" title="选择要导出的视频" width="80%" :close-on-click-modal="false">
      <el-table :data="allVideos" @selection-change="handleSelectionChange" max-height="500">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_edited ? 'success' : 'info'" size="small">
              {{ row.is_edited ? '剪辑后' : '原视频' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确定（已选 {{ tempSelection.length }} 个）</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const exportConfig = ref({
  outputDir: '',
  renameRule: 'keep',
  compress: false,
  deleteSource: false
})

const selectedVideos = ref<any[]>([])
const allVideos = ref<any[]>([])
const selectDialogVisible = ref(false)
const tempSelection = ref<any[]>([])
const exporting = ref(false)

// 计算总大小
const totalSize = computed(() => {
  const totalBytes = selectedVideos.value.reduce((sum, video) => sum + (video.file_size || 0), 0)
  return formatFileSize(totalBytes)
})

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// 选择导出目录
const selectDir = async () => {
  try {
    const result = await window.api.invoke('file:dialog:open', { type: 'folder' })
    if (result.success && result.data && result.data.length > 0) {
      exportConfig.value.outputDir = result.data[0]
    }
  } catch (error) {
    console.error('选择目录失败:', error)
    ElMessage.error('选择目录失败')
  }
}

// 加载所有视频
const loadAllVideos = async () => {
  try {
    const result = await window.api.invoke('database:videos:list')
    if (result.success) {
      allVideos.value = result.data.map((v: any) => ({
        ...v,
        size: formatFileSize(v.file_size)
      }))
    }
  } catch (error) {
    console.error('加载视频列表失败:', error)
    ElMessage.error('加载视频列表失败')
  }
}

// 从视频库选择
const selectFromLibrary = async () => {
  await loadAllVideos()
  selectDialogVisible.value = true
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  tempSelection.value = selection
}

// 确认选择
const confirmSelection = () => {
  // 合并已选视频，避免重复
  const existingIds = new Set(selectedVideos.value.map(v => v.id))
  const newVideos = tempSelection.value.filter(v => !existingIds.has(v.id))
  selectedVideos.value.push(...newVideos)
  
  selectDialogVisible.value = false
  ElMessage.success(`已添加 ${newVideos.length} 个视频`)
}

// 移除视频
const removeVideo = (index: number) => {
  selectedVideos.value.splice(index, 1)
}

// 清空视频列表
const clearVideos = () => {
  selectedVideos.value = []
  ElMessage.info('已清空待导出列表')
}

// 重置配置
const resetConfig = () => {
  exportConfig.value = {
    outputDir: '',
    renameRule: 'keep',
    compress: false,
    deleteSource: false
  }
  ElMessage.info('配置已重置')
}

// 开始导出
const startExport = async () => {
  if (!exportConfig.value.outputDir) {
    ElMessage.warning('请先选择导出目录')
    return
  }
  
  if (selectedVideos.value.length === 0) {
    ElMessage.warning('请先选择要导出的视频')
    return
  }
  
  // 如果选择了删除源文件，需要二次确认
  if (exportConfig.value.deleteSource) {
    try {
      await ElMessageBox.confirm(
        '确定要在导出后删除源文件吗？此操作无法撤销！',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }
  
  exporting.value = true
  
  try {
    const result = await window.api.invoke('export:task:create', {
      videos: selectedVideos.value.map(v => ({ id: v.id, file_path: v.file_path })),
      config: exportConfig.value
    })
    
    if (result.success) {
      ElMessage.success('导出任务已创建')
      // 启动导出任务
      const startResult = await window.api.invoke('export:task:start', result.data.id)
      if (startResult.success) {
        ElMessage.success('导出已开始')
        // 清空已导出的视频
        selectedVideos.value = []
      } else {
        ElMessage.error(startResult.error || '启动导出失败')
      }
    } else {
      ElMessage.error(result.error || '创建导出任务失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  // 可以从路由参数获取预选的视频
})
</script>

<style scoped lang="scss">
.export-page {
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
