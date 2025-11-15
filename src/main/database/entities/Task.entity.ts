export interface Task {
  id?: number
  batch_id?: number
  type: 'download' | 'edit' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  url?: string
  platform?: string
  input_path?: string
  output_path?: string
  config?: string // JSON格式
  progress: number
  error_message?: string
  created_at?: string
  started_at?: string
  completed_at?: string
}

