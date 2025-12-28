# CherryChain 开发环境启动脚本 (Windows PowerShell)

Write-Host "🍒 CherryChain 开发环境启动" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 检查 Rust 是否安装
Write-Host "检查环境..." -ForegroundColor Yellow
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    $rustVersion = cargo --version
    Write-Host "✅ Rust: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "❌ 错误: 未找到 Rust/Cargo" -ForegroundColor Red
    Write-Host "请访问 https://rustup.rs/ 安装 Rust" -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js 是否安装
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ 错误: 未找到 Node.js" -ForegroundColor Red
    Write-Host "请访问 https://nodejs.org/ 安装 Node.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "启动后端服务器..." -ForegroundColor Yellow

# 启动后端（在新窗口中）
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; cargo run --bin api-server"

Write-Host "✅ 后端启动中 (新窗口)" -ForegroundColor Green
Write-Host "等待后端初始化..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "启动前端开发服务器..." -ForegroundColor Yellow

# 启动前端
Set-Location "$PSScriptRoot\frontend"
npm run dev

Write-Host ""
Write-Host "🎉 开发环境已启动！" -ForegroundColor Green
Write-Host "前端: http://localhost:5173" -ForegroundColor Cyan
Write-Host "后端: http://localhost:3000" -ForegroundColor Cyan
