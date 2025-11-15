# 简化版启动脚本
# 设置UTF-8编码
chcp 65001 | Out-Null

Write-Host "正在为 Electron 重新编译 better-sqlite3..." -ForegroundColor Yellow
npm run rebuild

Write-Host ""
Write-Host "启动开发服务器..." -ForegroundColor Green
npm run dev

