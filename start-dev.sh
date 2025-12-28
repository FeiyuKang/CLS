#!/bin/bash
# CherryChain 开发环境启动脚本 (Linux/Mac)

echo "🍒 CherryChain 开发环境启动"
echo "================================"
echo ""

# 检查 Rust 是否安装
echo "检查环境..."
if command -v cargo &> /dev/null; then
    rustVersion=$(cargo --version)
    echo "✅ Rust: $rustVersion"
else
    echo "❌ 错误: 未找到 Rust/Cargo"
    echo "请访问 https://rustup.rs/ 安装 Rust"
    exit 1
fi

# 检查 Node.js 是否安装
if command -v node &> /dev/null; then
    nodeVersion=$(node --version)
    echo "✅ Node.js: $nodeVersion"
else
    echo "❌ 错误: 未找到 Node.js"
    echo "请访问 https://nodejs.org/ 安装 Node.js"
    exit 1
fi

echo ""
echo "启动后端服务器..."

# 启动后端（后台）
cargo run --bin api-server &
BACKEND_PID=$!

echo "✅ 后端启动中 (PID: $BACKEND_PID)"
echo "等待后端初始化..."
sleep 5

echo ""
echo "启动前端开发服务器..."

# 启动前端
cd frontend
npm run dev

# 清理函数
cleanup() {
    echo ""
    echo "正在关闭服务..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ 已关闭"
}

# 注册退出时清理
trap cleanup EXIT
