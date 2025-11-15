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

