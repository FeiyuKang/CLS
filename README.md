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

## 核心功能

### ✅ 已实现
- **实时 3D 可视化**: 使用 Three.js 渲染地球和移动的集装箱
- **WebSocket 通信**: 后端与前端 1Hz 实时同步
- **ECS 架构**: 高性能实体组件系统模拟引擎
- **路径模拟**: 从智利到中国的货运路线跟踪
- **连接管理**: 自动重连、状态指示器

### 🚧 开发中
- 地球纹理贴图和光照效果
- 大圆航线渲染
- 实例化渲染（支持 1000+ 集装箱）
- 温度衰减模型（Arrhenius 算法）

## 项目状态

✅ **Sprint 1 完成** (17/143 任务)
- ✅ 项目脚手架和基础设施 (6/6)
- ✅ MVP 核心功能 - 互联世界 (11/11)
  - 后端: ECS 架构、移动系统、WebSocket 广播
  - 前端: 3D 地球、实时容器渲染、连接状态
  - 验证: 端到端测试通过、重连机制正常

🚀 **当前进度**: Sprint 2 - 可视化升级
- 3D 资源和样式 (0/5)
- 渲染优化 (0/3)
- UI 美化 (0/2)

📋 **后续规划**:
- Sprint 3: 核心模拟（时间与衰减）
- Sprint 4: 游戏循环（运营与挑战）
- Sprint 5+: 文档、部署、测试

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
