# 测试生命周期管理

## 概述

测试运行时会自动管理应用的生命周期，确保测试环境就绪。

## 生命周期流程

### 1. 测试前（Global Setup）

执行顺序：

```
1. 启动应用 (start-app.js)
   ├─ 控制平面 (npm run dev:control-plane)
   ├─ API 网关 (npm run dev:api)
   └─ 前端 Web (npm run dev:web)

2. 等待应用就绪 (check-app-ready.js)
   ├─ 检查前端服务 (127.0.0.1:1520)
   └─ 检查 API 网关 (127.0.0.1:2130, 可选)

3. 预热 AI 连接 (warmup-ai.js)
   └─ 发送测试请求到 AI API，缓存连接

4. 清理测试报告目录
   ├─ allure-results/
   └─ test-results/fallback-events.log

5. 检查认证状态
   └─ 读取 .auth-state.json 中的 Cookie
```

### 2. 测试运行

所有测试用例按配置顺序执行。

### 3. 测试后（Global Teardown）

```
1. 停止应用 (stop-app.js)
   └─ 读取 .app.pids 并发送 SIGTERM 信号

2. 保留认证状态
   └─ .auth-state.json 不删除，供下次运行复用
```

## 配置文件

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    globalSetup: ["src/setup/globalSetup.ts"],  // 启用生命周期管理
    // ...
  },
});
```

### src/setup/globalSetup.ts

核心实现文件，导出：
- `setup()` — 测试前钩子
- `teardown()` — 测试后钩子

## 脚本说明

| 脚本 | 功能 | 超时 |
|------|------|------|
| `start-app.js` | 后台启动应用，保存 PID 到 `.app.pids` | - |
| `check-app-ready.js` | 轮询检查端口就绪状态，最多 30 次 × 2 秒 | 120 秒 |
| `warmup-ai.js` | 发送测试请求预热 AI API 连接 | 30 秒 |
| `stop-app.js` | 读取 PID 文件并停止所有进程 | 10 秒 |

## 手动管理

如果需要手动控制应用生命周期：

```bash
# 启动应用
npm run start:app

# 检查应用状态
npm run check:app

# 停止应用
npm run stop:app
```

## 故障排查

### 应用启动失败

**症状**：`check-app-ready.js` 超时（120 秒）

**原因**：
- 项目路径不存在
- npm/pnpm 未安装
- 端口 1520/2130 被占用

**解决**：
1. 检查项目路径是否正确
2. 安装依赖管理器
3. 检查端口占用：`lsof -i :1520`

### 应用停止失败

**症状**：`stop-app.js` 报错 "未找到运行中的服务 PID 文件"

**原因**：
- 应用未通过 `start-app.js` 启动
- `.app.pids` 文件被手动删除

**解决**：
手动查找并停止进程：
```bash
ps aux | grep "npm dev"
kill <PID>
```

### AI 预热失败

**症状**：`warmup-ai.js` 返回非零状态码

**影响**：非致命，测试继续运行（首次 AI 调用可能稍慢）

**原因**：
- AI API 密钥无效
- 网络连接问题
- API 配额耗尽

**解决**：
1. 检查 `.env` 中的 API 密钥配置
2. 检查网络连接
3. 等待 API 配额恢复

## 优势

✅ **零配置运行**：`npm test` 即可，无需手动启动应用  
✅ **环境隔离**：每次测试前启动全新应用实例  
✅ **自动清理**：测试结束后自动停止应用，避免遗留进程  
✅ **连接预热**：减少首次 AI 调用延迟  
✅ **健壮性**：超时保护 + 错误处理，避免挂起

## 性能影响

| 阶段 | 耗时 | 说明 |
|------|------|------|
| 应用启动 | ~15-30 秒 | 取决于机器性能 |
| 健康检查 | ~2-5 秒 | 轮询等待 |
| AI 预热 | ~1-3 秒 | 单次请求 |
| 应用停止 | ~1-2 秒 | SIGTERM 信号 |
| **总开销** | ~20-40 秒 | 仅在测试套件启动/结束时产生一次 |

对于单个测试运行，开销可忽略；对于大型测试套件（数十个用例），相对于总执行时间（数分钟）占比很小。

## 禁用自动管理

如果需要禁用自动生命周期管理（例如开发调试时应用已手动启动）：

**方案 1：注释 globalSetup**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // globalSetup: ["src/setup/globalSetup.ts"],  // 禁用
  },
});
```

**方案 2：环境变量控制**

```typescript
// globalSetup.ts
export async function setup() {
  if (process.env.SKIP_APP_LIFECYCLE === 'true') {
    console.log("[globalSetup] SKIP_APP_LIFECYCLE=true，跳过应用启动");
    return;
  }
  // ...
}
```

运行时：
```bash
SKIP_APP_LIFECYCLE=true npm test
```
