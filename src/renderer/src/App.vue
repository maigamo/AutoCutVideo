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
import { Upload, VideoCamera, Download, Setting } from '@element-plus/icons-vue'

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

