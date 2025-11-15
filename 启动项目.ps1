# AutoCutVideo Project Startup Script
# Set UTF-8 encoding to avoid garbled text
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 > $null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AutoCutVideo Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "[1/5] Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not installed. Please install Node.js 18.20.x" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check dependencies
Write-Host "[2/5] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Rebuild better-sqlite3
Write-Host "[3/5] Compiling better-sqlite3..." -ForegroundColor Yellow
npm run rebuild 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  WARN: better-sqlite3 compilation skipped (may already be compiled)" -ForegroundColor Yellow
} else {
    Write-Host "  better-sqlite3 compiled successfully" -ForegroundColor Green
}
Write-Host ""

# Prepare log directory
Write-Host "[4/5] Preparing log directory..." -ForegroundColor Yellow
$logDir = Join-Path $PSScriptRoot "logs"
if (Test-Path $logDir) {
    $logCount = (Get-ChildItem $logDir -Filter "*.log" -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "  Log directory: $logDir" -ForegroundColor Green
    Write-Host "  Current log files: $logCount" -ForegroundColor Gray
} else {
    Write-Host "  Log directory will be created on first run" -ForegroundColor Green
    Write-Host "  Location: .\logs\" -ForegroundColor Gray
}
Write-Host ""

# Start development server
Write-Host "[5/5] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Development server starting..." -ForegroundColor Cyan
Write-Host "  Vite: http://localhost:10031" -ForegroundColor Cyan
Write-Host "  Logs: .\logs\" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tip: View logs in real-time with:" -ForegroundColor Yellow
Write-Host "  Get-Content .\logs\app-*.log -Tail 20 -Wait -Encoding UTF8" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or run the verification script:" -ForegroundColor Yellow
Write-Host "  .\test-logs.ps1" -ForegroundColor Cyan
Write-Host ""

# Start the project
npm run dev
