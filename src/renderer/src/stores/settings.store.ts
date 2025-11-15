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

