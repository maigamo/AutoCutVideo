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

