# Midscene 缓存使用指南

## 📖 什么是 Midscene 缓存

Midscene 缓存机制会将 AI 视觉模型的响应结果缓存到本地文件系统，当遇到相同的输入（页面截图 + AI 描述）时，直接返回缓存结果，避免重复调用 AI 模型。

## ✅ 缓存的好处

1. **节省 API 成本**：减少重复的 AI 调用
2. **加快测试速度**：缓存命中时响应时间从秒级降到毫秒级
3. **提高稳定性**：避免频繁调用导致的限流（429 错误）
4. **调试友好**：测试失败重跑时，前面成功的步骤直接命中缓存

## 🔧 配置方法

### 1. 环境变量配置（推荐）

在 `.env` 文件中添加：

```bash
# 启用缓存（默认 false）
MIDSCENE_CACHE_ENABLED=true

# 缓存目录（默认 .midscene_cache）
MIDSCENE_CACHE_DIR=.midscene_cache

# 缓存有效期（秒，推荐 90 天 = 7776000）
# 说明：页面结构变更后手动清理缓存即可，无需频繁过期
MIDSCENE_CACHE_TTL=7776000
```

### 推荐的 TTL 配置

| 场景 | TTL（秒） | TTL（天数） | 说明 |
|------|-----------|------------|------|
| **推荐配置** | `7776000` | 90 天 | 页面稳定期长，手动清理更高效 |
| 快速迭代期 | `2592000` | 30 天 | 页面改版频繁时的折中方案 |
| 短期调试 | `86400` | 1 天 | 临时验证功能时使用 |
| 永久缓存 | `31536000` | 365 天 | 稳定页面长期复用 |

**最佳实践**：设置较长的 TTL（90 天），在以下情况手动清理缓存：
- 页面 UI 改版
- 元素位置/样式变更
- 发现缓存命中但结果不正确时

```bash
# 手动清理缓存
rm -rf .midscene_cache/
```

### 2. 代码级配置（可选）

在初始化 PlaywrightAgent 时传入配置：

```typescript
import { PlaywrightAgent } from '@midscene/web/playwright';

const agent = new PlaywrightAgent(page, {
  cache: {
    enabled: true,
    dir: '.midscene_cache',
    ttl: 7776000, // 90 天
  },
});
```

## 📊 缓存生效验证

运行测试后，检查项目根目录是否生成 `.midscene_cache/` 目录：

```bash
ls -la .midscene_cache/
```

缓存文件结构：
```
.midscene_cache/
├── aiTap_<hash>.json       # aiTap 调用的缓存
├── aiInput_<hash>.json     # aiInput 调用的缓存
├── aiAssert_<hash>.json    # aiAssert 调用的缓存
└── aiQuery_<hash>.json     # aiQuery 调用的缓存
```

## 🎯 使用场景

### ✅ 适合开启缓存的场景

1. **本地开发调试**：反复运行同一个测试用例
2. **测试失败重跑**：前面成功的步骤可以命中缓存
3. **稳定页面测试**：页面结构不变时，缓存命中率高
4. **API 限流保护**：避免短时间内大量 AI 调用

### ❌ 不适合开启缓存的场景

1. **动态页面测试**：页面内容频繁变化（如实时数据展示）
2. **CI/CD 环境**：每次构建应该是独立的，避免缓存污染
3. **压力测试**：需要测试真实的 AI 响应性能

## 🧹 缓存管理

### 清空缓存

```bash
# 手动删除缓存目录
rm -rf .midscene_cache/

# 或在测试脚本中添加清理逻辑
npm run test:clean-cache
```

### 查看缓存统计

```bash
# 查看缓存文件数量
find .midscene_cache -type f | wc -l

# 查看缓存占用空间
du -sh .midscene_cache
```

## 🔍 缓存命中判断逻辑

Midscene 使用以下因素计算缓存 key：

1. **AI 方法名**：aiTap / aiInput / aiAssert 等
2. **AI 描述文本**：传入的元素描述字符串
3. **页面截图哈希**：当前页面的视觉内容

**缓存命中条件**：
- AI 方法相同
- 描述文本相同
- 页面视觉内容相同（截图哈希匹配）

**缓存失效条件**：
- 超过 TTL（推荐配置 90 天）
- 页面视觉内容变化（即使描述相同）
- 手动删除缓存目录

**建议**：设置较长的 TTL，通过手动清理控制缓存更新时机，而非依赖自动过期。

## ⚙️ 高级配置

### 按环境开启/关闭缓存

```bash
# 开发环境 - 开启缓存
MIDSCENE_CACHE_ENABLED=true npm run test

# CI 环境 - 关闭缓存
MIDSCENE_CACHE_ENABLED=false npm run test

# 快速调试 - 短 TTL
MIDSCENE_CACHE_TTL=3600 npm run test  # 1 小时
```

### 禁用特定调用的缓存

在代码中通过 `cacheable: false` 禁用：

```typescript
// 默认使用缓存
await agent.aiTap('提交按钮');

// 强制不使用缓存（每次都调用 AI）
await agent.aiTap('提交按钮', { cacheable: false });
```

## 📈 性能对比

| 场景 | 无缓存 | 有缓存（命中） | 提升 |
|------|--------|----------------|------|
| aiTap 调用 | ~2-5s | ~50-100ms | **40-100x** |
| aiInput 调用 | ~3-6s | ~50-100ms | **60-120x** |
| aiAssert 调用 | ~2-4s | ~50-100ms | **40-80x** |
| 完整测试用例（10 步） | ~30-50s | ~5-10s | **5-10x** |

## 🚨 注意事项

1. **缓存目录已加入 `.gitignore`**，不会提交到 Git
2. **多人协作时**，每个开发者维护自己的本地缓存
3. **页面改版后**，建议手动清空缓存，避免旧缓存干扰
4. **敏感数据**：缓存文件包含页面截图，注意保护隐私

## 🔗 相关文档

- [Midscene 官方文档 - 缓存机制](https://midscenejs.com/zh/docs/caching)
- [项目配置文件](.env.example)
- [BaseComponent 懒加载实现](src/components/BaseComponent.ts)
