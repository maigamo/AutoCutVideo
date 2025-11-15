<template>
  <div class="video-management-page">
    <div class="filter-bar">
      <el-radio-group v-model="viewMode" size="large">
        <el-radio-button value="all">全部视频</el-radio-button>
        <el-radio-button value="raw">仅原视频</el-radio-button>
        <el-radio-button value="edited">仅剪辑后</el-radio-button>
        <el-radio-button value="compare">对比模式</el-radio-button>
      </el-radio-group>

      <div class="filter-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px; margin-right: 8px;"
          @change="handleDateRangeChange"
        />
        <el-input v-model="searchKeyword" placeholder="搜索文件名" clearable style="width: 200px;" />
        <el-button @click="refreshList">刷新</el-button>
      </div>
    </div>

    <div v-if="viewMode === 'compare'" class="compare-view">
      <div class="compare-column">
        <div class="column-header">
          <h3>📥 原视频</h3>
          <el-tag>{{ rawVideos.length }} 个</el-tag>
        </div>
        <el-table :data="rawVideos" height="calc(100vh - 240px)">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="filename" label="文件名" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="downloadVideo(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="compare-column">
        <div class="column-header">
          <h3>✂️ 剪辑后视频</h3>
          <el-tag type="success">{{ editedVideos.length }} 个</el-tag>
        </div>
        <el-table :data="editedVideos" height="calc(100vh - 240px)">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="filename" label="文件名" />
          <el-table-column prop="size" label="大小" width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="downloadVideo(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-table v-else :data="paginatedVideos" height="calc(100vh - 300px)" style="margin-top: 16px;">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="filename" label="文件名" />
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_edited ? 'success' : 'info'">
            {{ row.is_edited ? '剪辑后' : '原视频' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="downloadVideo(row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div v-if="viewMode !== 'compare'" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredVideos.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const viewMode = ref('compare')
const searchKeyword = ref('')
const videos = ref<any[]>([])
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)

const rawVideos = computed(() => videos.value.filter((v: any) => !v.is_edited))
const editedVideos = computed(() => videos.value.filter((v: any) => v.is_edited))

const filteredVideos = computed(() => {
  let result = videos.value
  
  // 根据查看模式过滤
  if (viewMode.value === 'raw') {
    result = result.filter((v: any) => !v.is_edited)
  } else if (viewMode.value === 'edited') {
    result = result.filter((v: any) => v.is_edited)
  }
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    result = result.filter((v: any) => 
      v.filename.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  // 根据日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter((v: any) => {
      if (!v.created_at) return false
      const videoDate = new Date(v.created_at)
      return videoDate >= startDate && videoDate <= endDate
    })
  }
  
  return result
})

// 分页后的数据
const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredVideos.value.slice(start, end)
})

// 加载视频列表
const loadVideos = async () => {
  try {
    const result = await window.api.invoke('database:videos:list')
    if (result.success) {
      videos.value = result.data.map((v: any) => ({
        ...v,
        size: formatFileSize(v.file_size)
      }))
    }
  } catch (error) {
    console.error('加载视频列表失败:', error)
    ElMessage.error('加载视频列表失败')
  }
}

// 刷新列表
const refreshList = async () => {
  await loadVideos()
  ElMessage.success('列表已刷新')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  currentPage.value = 1  // 重置到第一页
  loadVideos()
}

// 处理分页大小变化
const handleSizeChange = () => {
  currentPage.value = 1  // 重置到第一页
}

// 处理当前页变化
const handleCurrentChange = () => {
  // 页码已经通过 v-model 自动更新
}

// 下载视频文件
const downloadVideo = async (video: any) => {
  try {
    const result = await window.api.invoke('video:download', { videoId: video.id })
    if (result.success) {
      ElMessage.success('视频已保存到下载文件夹')
    } else {
      ElMessage.error(result.error || '下载失败')
    }
  } catch (error) {
    console.error('下载视频失败:', error)
    ElMessage.error('下载视频失败')
  }
}

// 监听事件更新
const handleEvent = (payload: any) => {
  const { type } = payload
  
  if (type === 'download:completed' || type === 'edit:completed') {
    // 自动刷新列表
    loadVideos()
    
    if (type === 'edit:completed') {
      ElMessage.success('视频剪辑完成')
    } else {
      ElMessage.success('视频下载完成')
    }
  }
}

onMounted(() => {
  // 加载视频列表
  loadVideos()
  
  // 监听事件
  if (window.api && window.api.on) {
    window.api.on('event:notification', handleEvent)
  }
})

onUnmounted(() => {
  // 取消事件监听
  if (window.api && window.api.off) {
    window.api.off('event:notification', handleEvent)
  }
})
</script>

<style scoped lang="scss">
.video-management-page {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.compare-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.compare-column {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);

  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 16px 0;
}
</style>
