import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('api', {
  // 统一的invoke方法
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  
  // 事件订阅
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  },
  
  // 发送消息
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  }
})

