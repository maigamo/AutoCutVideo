export interface Video {
  id?: number
  batch_id?: number
  filename: string
  file_path: string
  file_size?: number
  duration?: number
  resolution?: string
  thumbnail_path?: string
  is_edited: boolean
  source_task_id?: number
  created_at?: string
}

