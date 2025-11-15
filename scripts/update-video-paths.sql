-- 更新数据库中的视频文件路径
-- 将 AppData 路径替换为项目根目录路径

-- 更新 videos 表中的文件路径
UPDATE videos 
SET file_path = REPLACE(
  file_path, 
  'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron',
  'C:\open_workspace\AutoCutVideo-dev'
)
WHERE file_path LIKE 'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron%';

-- 更新 tasks 表中的输出路径
UPDATE tasks 
SET output_path = REPLACE(
  output_path, 
  'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron',
  'C:\open_workspace\AutoCutVideo-dev'
)
WHERE output_path LIKE 'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron%';

-- 更新 tasks 表中的输入路径
UPDATE tasks 
SET input_path = REPLACE(
  input_path, 
  'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron',
  'C:\open_workspace\AutoCutVideo-dev'
)
WHERE input_path LIKE 'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron%';

-- 验证更新结果
SELECT COUNT(*) as updated_videos FROM videos 
WHERE file_path LIKE 'C:\open_workspace\AutoCutVideo-dev%';

SELECT COUNT(*) as remaining_appdata_videos FROM videos 
WHERE file_path LIKE 'C:\Users\Administrator\AppData\Roaming\autocutvideo-electron%';

