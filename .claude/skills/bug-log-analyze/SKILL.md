---
name: bug-log-analyze
description: 当用户输入 /bug-log-analyze 或 /bug-log-analyze <ID> 时使用。智能分析日志文件，快速定位 bug 根因，支持本地开发环境和正式安装包。
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion]
---
# /bug-log-analyze — 日志诊断分析

## 触发场景
用户运行 `/bug-log-analyze` 或 `/bug-log-analyze <ID>` 时激活。

## 设计原则
1. **快速响应**：8-15 秒完成分析
2. **零确认**：环境自动判断，智能采样
3. **精准定位**：只读相关日志（100-200 行）

## 执行流程

### 输入模式判断

**有参数模式：`/bug-log-analyze BUG-0042`**
- 读取 `bugs/snapshots/BUG-0042.yml`
- 从 environment 字段判断环境类型
- 跳转到"日志收集"

**无参数模式：`/bug-log-analyze`**
- 提示用户：
  ```
  请上传截图或描述问题现象（或两者都提供）：
  ```
- 用户可以：
  - 上传截图
  - 输入文字描述
  - 或同时提供
- 跳转到"环境判断"

---

## 第一步：环境自动判断

**优先级策略**（99% 情况无需询问用户）：

1. **关键词判断**
   - 本地开发：`pnpm dev` / `本地` / `开发环境` / `localhost`
   - 正式安装包：`安装` / `下载` / `安装包` / `dmg` / `exe`

2. **截图分析**
   - 终端窗口 / Terminal / pnpm 命令 → 本地开发
   - 应用程序文件夹 / Applications → 正式安装包

3. **路径探测**
   - 读取 `.claude/config/testcase-workflow.yml` 获取 `dev_repo`
   - 检查 `<dev_repo>/logs` 是否存在 → 本地开发
   - 检查 `~/Library/Application Support/{app_name}` → 正式安装包（macOS）
   - 检查 `%APPDATA%/{app_name}` → 正式安装包（Windows）

4. **最后才询问**（<1% 情况）：
   ```
   无法自动判断环境类型，请选择：
     [1] 本地开发环境
     [2] 正式安装包（macOS）
     [3] 正式安装包（Windows）
   ```

**环境判断结果**：`local_dev` / `production_macos` / `production_windows`

---

## 第二步：问题类型识别

根据用户描述或截图内容，识别问题类型：

| 关键词 | 问题类型 | 
|--------|---------|
| 启动/打不开/无法启动/起不来 | 启动失败 |
| 崩溃/闪退/crash/挂了/卡死 | 运行时崩溃 |
| 聊天/对话/AI/回复/发送 | 对话问题 |
| skill/技能/导入/插件 | Skill问题 |
| 慢/卡/缓存/加载慢 | 性能问题 |
| 其他 | 通用扫描 |

---

## 第三步：智能采样日志

### 本地开发环境采样策略

```
正在分析...

✓ 识别问题类型：<问题类型>
✓ 判断环境：本地开发环境
✓ 读取相关日志...
```

**采样规则**：

| 问题类型 | 读取日志 | 读取量 |
|---------|---------|--------|
| 启动失败 | logs/tauri.log, nohup.out | 50+30 行 |
| 运行时崩溃 | 进程日志(tauri), 进程日志(api) | 50+30 行 |
| 对话问题 | 进程日志(api) | 50 行 |
| Skill问题 | logs/skill-import.log | 50 行 |
| 性能问题 | logs/api.log | 50 行 |
| 通用扫描 | 每个日志文件 | 20 行/文件 |

**日志收集步骤**：

1. **查找日志文件**（最近 1 小时）：
   ```bash
   find <dev_repo>/logs -name "*.log" -mmin -60 -type f
   ```

2. **查找运行进程**（只查关键进程）：
   ```bash
   ps aux | grep -E "pnpm.*dev:(control-plane|api|tauri)" | grep -v grep
   ```

3. **获取进程日志**：
   ```bash
   # 对每个进程获取文件描述符
   lsof -p <PID> | grep -E "\.log$"
   ```

4. **读取日志内容**：
   ```bash
   tail -n 50 <log_file>
   ```

**如果找不到日志**：
```
未能自动收集到日志。可能的原因：
1. 服务未在运行
2. 日志输出仅在终端显示（未重定向到文件）

建议操作：
[1] 截图包含错误信息的终端窗口
[2] 重启服务并重定向日志：
    cd <dev_repo>
    mkdir -p logs
    pnpm dev:control-plane > logs/control-plane.log 2>&1 &
    pnpm dev:api > logs/api.log 2>&1 &
    pnpm dev:tauri > logs/tauri.log 2>&1 &
[3] 手动提供日志片段
```

### 正式安装包采样策略

```
正在分析...

✓ 识别问题类型：<问题类型>
✓ 判断环境：正式安装包 (macOS/Windows)
✓ 读取相关日志...
```

**日志路径**：

- **macOS**: `~/Library/Application Support/{app_name}/openclaw/logs/`
- **Windows**: `%APPDATA%/{app_name}/openclaw/logs/`

**日志文件**：
- `desktop-bootstrap.log` - 启动日志
- `sidecar-stdout.log` - 标准输出
- `sidecar-stderr.log` - 标准错误
- `skill-import.log` - Skill 日志
- `llm-diagnostics.jsonl` - LLM 诊断（JSONL 格式）
- `cache-diagnostics.jsonl` - 缓存诊断（JSONL 格式）

**采样规则**：

| 问题类型 | 读取日志 | 读取量 |
|---------|---------|--------|
| 启动失败 | desktop-bootstrap.log, sidecar-stderr.log | 50+30 行 |
| 运行时崩溃 | sidecar-stderr.log, sidecar-stdout.log | 50+30 行 |
| 对话问题 | llm-diagnostics.jsonl, sidecar-stderr.log | 10条+30行 |
| Skill问题 | skill-import.log, sidecar-stderr.log | 50+30 行 |
| 性能问题 | cache-diagnostics.jsonl | 20 条 |
| 通用扫描 | 每个日志文件 | 20 行/文件 |

**JSONL 文件处理**：
```python
# 读取最后 N 条 JSON 记录
tail -n <N> <file>.jsonl | while read line; do
    echo "$line" | jq '.'
done
```

**如果找不到日志**：
```
未找到日志目录或日志文件。可能的原因：
1. 应用未正确安装
2. app_name 不正确

请提供以下信息之一：
   - 正式安装包：`~/Library/Logs/<AppName>/` / `%APPDATA%/<AppName>/logs/`
[2] 日志文件的完整路径
[3] 截图显示应用安装位置
```

---

## 第四步：日志分析

**分析策略**：

1. **识别错误关键字**：
   - `error` / `Error` / `ERROR`
   - `exception` / `Exception`
   - `fatal` / `Fatal` / `FATAL`
   - `crash` / `Crash`
   - `failed` / `Failed`
   - `timeout` / `Timeout`
   - `ENOENT` / `EACCES`
   - `null pointer` / `undefined`

2. **提取错误栈**：
   - 识别完整的错误堆栈信息
   - 定位错误发生的文件和行号

3. **时间序列分析**：
   - 问题发生前后的日志序列
   - 识别触发条件

4. **关联分析**：
   - 多个日志文件的关联事件
   - 级联错误的追踪

---

## 第五步：输出诊断结果

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUG 日志诊断分析（耗时 <X> 秒）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 问题概述
<问题标题或描述>

🔍 关键日志

[<log_file>:<line>]
<错误信息>

[<log_file>:<line>]
<错误栈>

📊 根本原因分析
<基于日志的推断>

💡 可能的解决方案
1. <方案1>
2. <方案2>

🎯 问题分类：<问题类型> - <子分类>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**如果未找到明显错误**：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
初步分析未发现明显错误

可能的原因：
1. 问题在其他日志文件中
2. 需要更长的日志历史
3. 日志信息不足以定位

建议操作：
[1] 截图包含错误信息的终端/弹窗
[2] 手动提供完整错误日志片段
[3] 尝试 /bug-analyze 进行代码层面分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 第六步：询问是否创建 bug 记录

```
是否根据此诊断创建 bug 记录？
  [1] 是，调用 /bug-report
  [2] 否，结束
```

**如果用户选择 [1]**：
- 自动调用 `/bug-report` skill
- 传递以下信息作为上下文：
  ```yaml
  context_from_log_analyze:
    title: <从日志中提取>
    module: <从日志推测>
    reproduce_steps: <用户描述 + 日志关键点>
    actual: <日志中的错误信息>
    environment:
      platform: <判断的环境类型>
      os: <操作系统>
    linked_logs:
      - file: <log_file>
        line: <line>
        content: <错误信息>
    error_type: <error type>
    analysis_time: <timestamp>
  ```
- `/bug-report` 将预填充这些信息供用户确认

**如果用户选择 [2]**：
- 结束流程

---

## 错误处理

### 日志目录不存在
```
错误：日志目录不存在

处理：
1. 提示可能的 app_name 列表
2. 引导用户提供实际路径
3. 或截图文件浏览器中的日志目录
```

### 环境判断失败
```
错误：无法自动判断环境

处理：询问用户选择环境类型
  [1] 本地开发环境
  [2] 正式安装包（macOS）
  [3] 正式安装包（Windows）
```

### 未找到相关日志
```
错误：智能采样未找到错误信息

处理：提供兜底建议（见"第五步"）
```

---

## 技术细节

### 问题类型识别实现

```python
PROBLEM_PATTERNS = {
    "启动失败": ["启动", "打不开", "无法启动", "起不来", "打开闪退"],
    "运行时崩溃": ["崩溃", "闪退", "crash", "挂了", "卡死"],
    "对话问题": ["聊天", "对话", "AI", "回复", "发送"],
    "Skill问题": ["skill", "技能", "导入", "插件", "安装skill"],
    "性能问题": ["慢", "卡", "缓存", "加载慢", "响应慢"],
}

def identify_problem(description):
    for problem_type, keywords in PROBLEM_PATTERNS.items():
        if any(kw in description for kw in keywords):
            return problem_type
    return "通用扫描"
```

### app_name 自动检测

```bash
# 从 testcase-workflow.yml 或其他配置中读取
# 或根据开发仓库名称推测
# 示例应用名称：myapp / testapp / yourapp
```

---

## 性能指标

- **日志收集**：< 5 秒
- **分析输出**：< 15 秒
- **总时间**：< 20 秒
- **日志读取量**：100-200 行（vs 全量的 2500-3000 行）
- **用户确认次数**：1 次（只在最后询问是否创建 bug）

