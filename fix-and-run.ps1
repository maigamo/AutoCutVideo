# 设置UTF-8编码，解决中文乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AutoCutVideo 修复并启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 重新编译 better-sqlite3
Write-Host "步骤1: 重新编译 better-sqlite3..." -ForegroundColor Yellow
npm rebuild better-sqlite3

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ better-sqlite3 编译失败" -ForegroundColor Red
    Write-Host "请确保已安装 windows-build-tools" -ForegroundColor Red
    exit 1
}

Write-Host "✓ better-sqlite3 编译成功" -ForegroundColor Green
Write-Host ""

# 步骤2: 初始化数据库（如果未初始化）
if (-not (Test-Path "data\app.db")) {
    Write-Host "步骤2: 初始化数据库..." -ForegroundColor Yellow
    npm run db:init
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 数据库初始化失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ 数据库初始化成功" -ForegroundColor Green
} else {
    Write-Host "步骤2: 数据库已存在，跳过初始化" -ForegroundColor Gray
}

Write-Host ""

# 步骤3: 启动开发服务器
Write-Host "步骤3: 启动开发服务器..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "可通过以下地址访问:" -ForegroundColor Cyan
Write-Host "  本地: http://localhost:10031" -ForegroundColor White
Write-Host "  网络: http://192.168.x.x:10031" -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

npm run dev

