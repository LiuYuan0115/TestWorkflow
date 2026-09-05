---
name: testcase-coverage
description: 当用户输入 /testcase-coverage 时使用。展示各模块测试用例覆盖情况，标出未覆盖模块和缺失维度。
allowed-tools: [Read, Bash, AskUserQuestion]
---
# /testcase-coverage — 测试覆盖率报告

## 触发场景
用户运行 `/testcase-coverage` 或提到"测试覆盖率"、"哪些模块没有用例"、"覆盖情况"时激活。

## 配置读取
启动时读取 `.claude/config/testcase-workflow.yml`，获取：
- `project.module_map`：所有已配置模块；`testable: false` 的模块不纳入覆盖率统计（属于开发侧单元测试范畴）
- `experience.path`：经验库路径（用于统计经验条数）

## 执行流程

1. 读取 `testing/index.yml`，获取已有用例的模块列表和统计数据
2. 对比 `module_map` 中 `testable` 不为 `false` 的模块，找出未覆盖模块
3. 对已覆盖模块，读取对应 `testing/testcases/<模块>.yml`，统计维度分布（按 `dimension` 字段分组）
4. 输出覆盖率报告

## 输出格式

```
测试覆盖率报告（YYYY-MM-DD）

已覆盖模块（N / M）：
┌─────────────────────┬──────┬────┬────┬────┬──────┬──────┬──────┐
│ 模块                │ 总计 │ P0 │ P1 │ P2 │ 安全 │ 性能 │ 兼容 │
├─────────────────────┼──────┼────┼────┼────┼──────┼──────┼──────┤
│ auth                │  18  │  6 │  8 │  4 │  3   │  1   │  2   │
│ payment             │  12  │  4 │  6 │  2 │  2   │  0 ⚠ │  1   │
└─────────────────────┴──────┴────┴────┴────┴──────┴──────┴──────┘

⚠️ 警告：
  · payment：无性能场景（支付类功能建议补充）

未覆盖模块（N 个）：
  · control-plane
  · data-sync
  · admin-web
  （共 N 个模块，建议优先覆盖核心业务模块）

经验库：testing/experience.md（N 条漏测记录 / N 个模板）

下一步建议：
  · 优先为未覆盖模块运行 /testcase-design
  · 为有警告的模块补充对应场景：/testcase-update
```

## 警告规则
- auth、payment、security-center 模块：无安全场景时警告
- 任意模块：无 P0 用例时警告
- 任意模块：无性能场景且模块名含 list/search/upload/market/sync 时警告

## testing/index.yml 不存在时的处理
输出：
```
尚未生成任何测试用例。
已配置模块（共 N 个）：<列出 module_map 中所有模块名>
运行 /testcase-design --module <模块名> 开始生成。
```
