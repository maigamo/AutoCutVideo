export interface BatchTask {
  id?: number
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_videos: number
  completed_videos: number
  failed_videos: number
  edit_config: string // JSON格式
  created_at?: string
  started_at?: string
  completed_at?: string
}

