---
name: bug-trend
description: 当用户输入 /bug-trend 时使用。统计本周/本月 Bug 新增、关闭、重开等趋势指标，输出模块分布和平均修复周期。
allowed-tools: [Read, Bash, AskUserQuestion]
---
# /bug-trend — 趋势报告

## 触发场景
用户运行 `/bug-trend`、`/bug-trend --week` 或 `/bug-trend --month` 时激活。

## 时间范围
- 无参数或 `--week`：本周（周一至今）
- `--month`：本月（1日至今）

## 数据来源
扫描 `bugs/snapshots/` 目录下所有 YAML 文件（包括终态），根据 `created_at` 和 `status_history` 中的时间戳筛选时间范围内的数据。

## 统计指标

计算以下指标（仅统计时间范围内发生的事件）：

- **新增数**：`created_at` 在范围内的 bug 数量
- **关闭数**：`status_history` 中有 `status: closed` 且时间在范围内的数量
- **重开数**：`status_history` 中有 `status: reopened` 且时间在范围内的数量
- **重开率**：重开数 / 关闭数（关闭数为 0 时显示 N/A）
- **P0/P1 占比**：新增 bug 中 P0+P1 数量 / 新增总数（新增为 0 时显示 N/A）
- **各模块分布**：按模块统计新增数量
- **平均修复周期**：已关闭 bug 的 `created_at` 到 `closed` 状态时间的平均天数（无已关闭 bug 时显示 N/A）

## 输出格式

```markdown
## Bug 趋势报告（<时间范围>）

| 指标 | 数值 |
|------|------|
| 新增 | N |
| 关闭 | N |
| 重开 | N |
| 重开率 | N% |
| P0/P1 占比 | N% |
| 平均修复周期 | N 天 |

### 模块分布（新增）
| 模块 | 数量 |
|------|------|
| auth | N |
| payment | N |

### 待关注
- 重开率 > 20%：<列出重开的 bug ID，无则显示"无">
- P0 未关闭：<列出 P0 open/reopened bug ID，无则显示"无">
```
