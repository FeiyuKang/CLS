# 🍒 CherryChain - 冷链物流数字孪生平台

跨海冷链物流教育模拟平台：模拟智利樱桃到中国的 20,000+ 公里旅程

## 快速开始

### 环境要求
- **Rust** 1.70+ ([安装](https://rustup.rs/))
- **Node.js** 18+ ([安装](https://nodejs.org/))

### 启动项目

#### Windows
```powershell
.\start-dev.ps1
```

#### Linux/Mac
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### 手动启动
```bash
# 终端 1: 后端
cargo run --bin api-server

# 终端 2: 前端
cd frontend && npm run dev
```

访问: http://localhost:5173

## 项目状态

✅ **Section 1 完成** (6/81 任务)
- Rust 后端工作区
- React + Three.js 前端
- WebSocket 实时通信架构
- CI/CD 流水线

📋 **下一步**: Sprint 1 - MVP 开发

## 文档

- [CODE_REVIEW.md](CODE_REVIEW.md) - 代码检查报告 ⭐ **先看这个**
- [start-check.md](start-check.md) - 启动检查清单
- [dev-setup.md](dev-setup.md) - 开发环境配置
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 项目结构

## 技术栈

**后端**
- Rust + Axum (Web 服务器)
- ECS 架构 (模拟引擎)
- WebSocket (实时更新)

**前端**
- React + TypeScript
- Three.js + React-Three-Fiber (3D 渲染)
- Vite (构建工具)

## 许可证

MIT
