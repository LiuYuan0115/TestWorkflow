---
name: bug-list
description: 当用户输入 /bug-list 时使用。查看 Bug 列表，支持按状态/模块/严重度筛选，支持 /bug-list <ID> 查看单条详情。
allowed-tools: [Read, Bash, AskUserQuestion]
---
# /bug-list — Bug 列表查看

## 触发场景
用户运行 `/bug-list`、`/bug-list <参数>` 或 `/bug-list <ID>` 时激活。

## 数据来源
读取 `bugs/snapshots/index.yml`（活跃 bug）和 `bugs/snapshots/` 目录下的 YAML 文件。

## 模式

### 详情模式（/bug-list BUG-0042）
读取 `bugs/snapshots/BUG-0042.yml`，输出完整字段：
```
BUG-0042
  标题：<title>
  状态：<status>
  严重度：<severity>
  模块：<module>
  创建日期：<created_at>
  更新日期：<updated_at>
  复现步骤：
    1. <step>
  预期：<expected>
  实际：<actual>
  环境：<platform> / <os> / <app_version>
  关联代码：<linked_code 或 无>
  关联用例：<linked_testcases 或 无>
  复测备注：<verify_note 或 无>
  处理原因：<resolution 或 无>
```

### 筛选模式（带参数）
```
/bug-list status=open
/bug-list status=open module=auth
/bug-list status=open module=auth severity=P1
```

支持的 status 值：open / fixed / ready_for_test / reopened / closed / rejected / deferred

closed/rejected/deferred 需扫描 `bugs/snapshots/` 目录下所有 YAML（不在 index.yml 中）。

### 交互模式（无参数）
```
筛选条件（直接回车跳过，显示全部活跃 bug）：
  状态？[open / fixed / ready_for_test / reopened / 全部活跃]
  模块？（从 module_map 读取，展示完整列表）
    [1] auth            [2] settings        [3] payment
    [4] extensions      [5] im-bots         [6] investment-experts
    [7] knowledge-library  [8] learning-flywheel  [9] lobster-store
    [10] market         [11] mcp-store       [12] memory
    [13] notifications  [14] security-center [15] skill-store
    [16] cron-presets   [17] data-connections [18] home-web
    [19] admin-web      [20] extension       [21] control-plane
    [22] data-sync      [23] data-connector  [24] openclaw
    [25] agent-browser  [26] fingpt          [27] nano-banana
    [28] market-sync-core  [29] sdk          [30] shared
    输入编号或模块名，直接回车显示全部：
  严重度？[P0 / P1 / P2 / P3 / 全部]
```

## 输出格式（列表视图）
```
Bug 列表（共 N 条）
─────────────────────────────────────────────
BUG-0042  [P1][open]           auth     登录后首页白屏
BUG-0043  [P2][ready_for_test] payment  支付金额显示错误
─────────────────────────────────────────────
P0: N | P1: N | P2: N | P3: N
open: N | ready_for_test: N | reopened: N
```
