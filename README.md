# 待办清单 · Vue 3

Vue 3 + TypeScript + Vite 前端，连接 [demo-backend](https://github.com/jty0420/demo-backend) API。

## 功能

- 增删改查、完成标记
- 筛选（全部 / 进行中 / 已完成）
- 优先级、截止日期、深色模式
- 对接 `http://localhost:4000` REST API

## 开发

**1. 启动后端**

```bash
cd ../todolist-api   # 或 clone demo-backend
npm install
npm run dev
```

**2. 启动本前端**

```bash
npm install
cp .env.example .env   # 可选
npm run dev
```

浏览器打开 http://localhost:5173

## 环境变量

| 变量 | 默认值 |
|------|--------|
| `VITE_API_URL` | `http://localhost:4000` |

## 构建

```bash
npm run build
npm run preview
```
