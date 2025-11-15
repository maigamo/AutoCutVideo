import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import { logger } from '../utils/logger'

export type EventType = 
  | 'task:created'
  | 'task:started'
  | 'task:progress'
  | 'task:completed'
  | 'task:failed'
  | 'task:cancelled'
  | 'download:started'
  | 'download:progress'
  | 'download:completed'
  | 'download:failed'
  | 'edit:started'
  | 'edit:progress'
  | 'edit:completed'
  | 'edit:failed'
  | 'export:started'
  | 'export:progress'
  | 'export:completed'
  | 'export:failed'

export interface EventPayload {
  type: EventType
  data: any
  timestamp: number
}

class EventBus extends EventEmitter {
  constructor() {
    super()
    this.setMaxListeners(50) // 增加最大监听器数量
  }
  
  // 发布事件
  publish(type: EventType, data: any): void {
    const payload: EventPayload = {
      type,
      data,
      timestamp: Date.now()
    }
    
    logger.debug('事件发布', { module: 'eventbus', type, data })
    
    // 触发内部监听器
    this.emit(type, payload)
    
    // 发送到渲染进程
    this.sendToRenderer(type, payload)
  }
  
  // 订阅事件
  subscribe(type: EventType, handler: (payload: EventPayload) => void): void {
    this.on(type, handler)
  }
  
  // 取消订阅
  unsubscribe(type: EventType, handler: (payload: EventPayload) => void): void {
    this.off(type, handler)
  }
  
  // 发送事件到渲染进程
  private sendToRenderer(type: EventType, payload: EventPayload): void {
    try {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('event:notification', payload)
        }
      })
    } catch (error) {
      logger.error('发送事件到渲染进程失败', { module: 'eventbus', error })
    }
  }
}

export const eventBus = new EventBus()

