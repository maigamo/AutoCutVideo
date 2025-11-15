# AutoCutVideo 日志功能验证脚本
# 设置输出编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================"
Write-Host "  AutoCutVideo 日志功能验证"
Write-Host "========================================"
Write-Host ""

# 日志目录路径
$appDataLogDir = Join-Path $env:APPDATA "autocutvideo-electron\logs"
$projectLogDir = "logs"

Write-Host "[1/4] 检查日志目录..." -ForegroundColor Yellow

# 检查应用数据目录中的日志
if (Test-Path $appDataLogDir) {
    Write-Host "找到日志目录: $appDataLogDir" -ForegroundColor Green
    
    $logFiles = Get-ChildItem $appDataLogDir -Filter "*.log" -ErrorAction SilentlyContinue
    $logCount = ($logFiles | Measure-Object).Count
    
    if ($logCount -gt 0) {
        Write-Host "找到 $logCount 个日志文件" -ForegroundColor Green
    } else {
        Write-Host "日志目录存在但没有日志文件" -ForegroundColor Yellow
    }
} else {
    Write-Host "日志目录不存在: $appDataLogDir" -ForegroundColor Yellow
    Write-Host "提示: 日志目录会在应用首次运行时自动创建"
}

# 检查项目目录中的日志
if (Test-Path $projectLogDir) {
    Write-Host "找到项目日志目录: $projectLogDir" -ForegroundColor Green
    $projectLogCount = (Get-ChildItem $projectLogDir -Filter "*.log" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "项目日志文件数: $projectLogCount"
}

Write-Host ""

# 列出最新的日志文件
Write-Host "[2/4] 最新日志文件..." -ForegroundColor Yellow

if (Test-Path $appDataLogDir) {
    $latestLogs = Get-ChildItem $appDataLogDir -Filter "*.log" -ErrorAction SilentlyContinue | 
                  Sort-Object LastWriteTime -Descending | 
                  Select-Object -First 5
    
    if ($latestLogs) {
        foreach ($log in $latestLogs) {
            $sizeKB = [math]::Round($log.Length / 1KB, 2)
            $time = $log.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  $($log.Name)" -ForegroundColor Cyan
            Write-Host "     大小: ${sizeKB}KB | 最后修改: $time" -ForegroundColor Gray
        }
    } else {
        Write-Host "  暂无日志文件"
    }
}

Write-Host ""

# 显示最新日志内容
Write-Host "[3/4] 最新日志内容预览..." -ForegroundColor Yellow

if (Test-Path $appDataLogDir) {
    $latestLog = Get-ChildItem $appDataLogDir -Filter "app-*.log" -ErrorAction SilentlyContinue | 
                 Sort-Object LastWriteTime -Descending | 
                 Select-Object -First 1
    
    if ($latestLog) {
        Write-Host "  文件: $($latestLog.Name)" -ForegroundColor Cyan
        Write-Host "  ----------------------------------------"
        
        $content = Get-Content $latestLog.FullName -Tail 15 -ErrorAction SilentlyContinue
        if ($content) {
            foreach ($line in $content) {
                if ($line -match '\[ERROR\]') {
                    Write-Host "  $line" -ForegroundColor Red
                } elseif ($line -match '\[WARN\]') {
                    Write-Host "  $line" -ForegroundColor Yellow
                } elseif ($line -match '\[INFO\]') {
                    Write-Host "  $line" -ForegroundColor Green
                } elseif ($line -match '\[DEBUG\]') {
                    Write-Host "  $line" -ForegroundColor Cyan
                } else {
                    Write-Host "  $line"
                }
            }
        } else {
            Write-Host "  日志文件为空"
        }
        
        Write-Host "  ----------------------------------------"
    } else {
        Write-Host "  未找到应用日志文件"
    }
}

Write-Host ""

# 日志统计
Write-Host "[4/4] 日志统计..." -ForegroundColor Yellow

if (Test-Path $appDataLogDir) {
    $allLogs = Get-ChildItem $appDataLogDir -Filter "*.log" -ErrorAction SilentlyContinue
    
    if ($allLogs) {
        $totalSize = ($allLogs | Measure-Object -Property Length -Sum).Sum
        $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
        
        $appLogs = $allLogs | Where-Object { $_.Name -like "app-*.log" }
        $errorLogs = $allLogs | Where-Object { $_.Name -like "error-*.log" }
        $downloadLogs = $allLogs | Where-Object { $_.Name -like "download-*.log" }
        
        Write-Host "  总文件数: $($allLogs.Count)" -ForegroundColor Cyan
        Write-Host "  总大小: ${totalSizeMB}MB" -ForegroundColor Cyan
        Write-Host "  ----------------------------------------"
        Write-Host "  应用日志: $($appLogs.Count) 个"
        Write-Host "  错误日志: $($errorLogs.Count) 个"
        Write-Host "  下载日志: $($downloadLogs.Count) 个"
    } else {
        Write-Host "  暂无日志文件"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  验证完成"
Write-Host "========================================"
Write-Host ""

# 提供实时查看日志的命令
if (Test-Path $appDataLogDir) {
    Write-Host "实时查看日志命令：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# 查看应用日志（最新20行，实时更新）"
    Write-Host "Get-Content '$appDataLogDir\app-*.log' -Tail 20 -Wait" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# 查看错误日志"
    Write-Host "Get-Content '$appDataLogDir\error-*.log' -Tail 20 -Wait" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# 查看下载日志"
    Write-Host "Get-Content '$appDataLogDir\download-*.log' -Tail 20 -Wait" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "提示：运行应用后日志会自动生成在:" -ForegroundColor Yellow
    Write-Host $appDataLogDir -ForegroundColor Cyan
    Write-Host ""
}
