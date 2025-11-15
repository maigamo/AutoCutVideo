# AutoCutVideo Log Verification Script
# Set output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AutoCutVideo Log Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Log directory path (项目根目录下的logs文件夹)
$logDir = Join-Path $PSScriptRoot "logs"

Write-Host "[1/4] Checking log directories..." -ForegroundColor Yellow

# Check project logs
if (Test-Path $logDir) {
    Write-Host "  Found log directory: $logDir" -ForegroundColor Green
    
    $logFiles = Get-ChildItem $logDir -Filter "*.log" -ErrorAction SilentlyContinue
    $logCount = ($logFiles | Measure-Object).Count
    
    if ($logCount -gt 0) {
        Write-Host "  Found $logCount log files" -ForegroundColor Green
    } else {
        Write-Host "  Log directory exists but no log files" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Log directory not found: $logDir" -ForegroundColor Yellow
    Write-Host "  Note: Directory will be created on first run" -ForegroundColor Gray
}

Write-Host ""

# List recent log files
Write-Host "[2/4] Recent log files..." -ForegroundColor Yellow

if (Test-Path $logDir) {
    $latestLogs = Get-ChildItem $logDir -Filter "*.log" -ErrorAction SilentlyContinue | 
                  Sort-Object LastWriteTime -Descending | 
                  Select-Object -First 5
    
    if ($latestLogs) {
        foreach ($log in $latestLogs) {
            $sizeKB = [math]::Round($log.Length / 1KB, 2)
            $time = $log.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  $($log.Name)" -ForegroundColor Cyan
            Write-Host "     Size: ${sizeKB}KB | Modified: $time" -ForegroundColor Gray
        }
    } else {
        Write-Host "  No log files found" -ForegroundColor Gray
    }
} else {
    Write-Host "  Log directory not found" -ForegroundColor Gray
}

Write-Host ""

# Show latest log content
Write-Host "[3/4] Latest log preview..." -ForegroundColor Yellow

if (Test-Path $logDir) {
    $latestLog = Get-ChildItem $logDir -Filter "app-*.log" -ErrorAction SilentlyContinue | 
                 Sort-Object LastWriteTime -Descending | 
                 Select-Object -First 1
    
    if ($latestLog) {
        Write-Host "  File: $($latestLog.Name)" -ForegroundColor Cyan
        Write-Host "  ----------------------------------------" -ForegroundColor Gray
        
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
                    Write-Host "  $line" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  Log file is empty" -ForegroundColor Gray
        }
        
        Write-Host "  ----------------------------------------" -ForegroundColor Gray
    } else {
        Write-Host "  No application log files found" -ForegroundColor Gray
    }
} else {
    Write-Host "  Log directory not found" -ForegroundColor Gray
}

Write-Host ""

# Log statistics
Write-Host "[4/4] Log statistics..." -ForegroundColor Yellow

if (Test-Path $logDir) {
    $allLogs = Get-ChildItem $logDir -Filter "*.log" -ErrorAction SilentlyContinue
    
    if ($allLogs) {
        $totalSize = ($allLogs | Measure-Object -Property Length -Sum).Sum
        $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
        
        $appLogs = $allLogs | Where-Object { $_.Name -like "app-*.log" }
        $errorLogs = $allLogs | Where-Object { $_.Name -like "error-*.log" }
        $downloadLogs = $allLogs | Where-Object { $_.Name -like "download-*.log" }
        
        Write-Host "  Total files: $($allLogs.Count)" -ForegroundColor Cyan
        Write-Host "  Total size: ${totalSizeMB}MB" -ForegroundColor Cyan
        Write-Host "  ----------------------------------------" -ForegroundColor Gray
        Write-Host "  App logs: $($appLogs.Count)" -ForegroundColor Gray
        Write-Host "  Error logs: $($errorLogs.Count)" -ForegroundColor Gray
        Write-Host "  Download logs: $($downloadLogs.Count)" -ForegroundColor Gray
    } else {
        Write-Host "  No log files" -ForegroundColor Gray
    }
} else {
    Write-Host "  Log directory not found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verification Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Show commands for real-time log viewing
if (Test-Path $logDir) {
    Write-Host "Commands for real-time log viewing:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "# View app logs (last 20 lines, live updates)" -ForegroundColor Gray
    Write-Host "Get-Content '.\logs\app-*.log' -Tail 20 -Wait -Encoding UTF8" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# View error logs" -ForegroundColor Gray
    Write-Host "Get-Content '.\logs\error-*.log' -Tail 20 -Wait -Encoding UTF8" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# View download logs" -ForegroundColor Gray
    Write-Host "Get-Content '.\logs\download-*.log' -Tail 20 -Wait -Encoding UTF8" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Note: Logs will be created at:" -ForegroundColor Yellow
    Write-Host $logDir -ForegroundColor Cyan
    Write-Host ""
}

