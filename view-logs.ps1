# View Logs Script - 实时查看日志
# Set UTF-8 encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$logDir = Join-Path $PSScriptRoot "logs"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AutoCutVideo Log Viewer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $logDir)) {
    Write-Host "Log directory not found: $logDir" -ForegroundColor Red
    Write-Host "Please run the application first to generate logs." -ForegroundColor Yellow
    exit 1
}

Write-Host "Log directory: $logDir" -ForegroundColor Green
Write-Host ""
Write-Host "Select log type to view:" -ForegroundColor Yellow
Write-Host "  1. Application logs (all)" -ForegroundColor Cyan
Write-Host "  2. Error logs only" -ForegroundColor Red
Write-Host "  3. Download logs only" -ForegroundColor Cyan
Write-Host "  4. Run verification script" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Viewing application logs (Press Ctrl+C to stop)..." -ForegroundColor Green
        Write-Host ""
        Start-Sleep -Milliseconds 500
        Get-Content "$logDir\app-*.log" -Tail 20 -Wait -Encoding UTF8
    }
    "2" {
        Write-Host ""
        Write-Host "Viewing error logs (Press Ctrl+C to stop)..." -ForegroundColor Red
        Write-Host ""
        Start-Sleep -Milliseconds 500
        Get-Content "$logDir\error-*.log" -Tail 20 -Wait -Encoding UTF8
    }
    "3" {
        Write-Host ""
        Write-Host "Viewing download logs (Press Ctrl+C to stop)..." -ForegroundColor Cyan
        Write-Host ""
        Start-Sleep -Milliseconds 500
        Get-Content "$logDir\download-*.log" -Tail 20 -Wait -Encoding UTF8
    }
    "4" {
        Write-Host ""
        & "$PSScriptRoot\test-logs.ps1"
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

