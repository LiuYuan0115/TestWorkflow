---
name: testcase-ui-generate
description: 当用户输入 /testcase-ui-generate 时使用。从功能测试用例筛选 P0/P1 并转换为适合 UI 自动化的测试用例。
allowed-tools: [Read, Write, Bash, AskUserQuestion]
---
# /testcase-ui-generate — UI 自动化测试用例生成

## 触发场景

用户运行 `/testcase-ui-generate` 或提到"将功能用例转换为 UI 自动化用例"、"生成 UI 自动化测试用例"时激活。

## 配置读取

启动时执行：
1. 用 `Bash` 运行 `pwd` 获取工作目录，记为 `$WORKDIR`，后续所有文件路径均拼接为绝对路径
2. 读取 `$WORKDIR/.claude/config/testcase-workflow.yml`，获取：
   - `project.module_map`：模块名到功能用例文件路径的映射

## 输入方式

### 直接模式（带参数）

```
/testcase-ui-generate --module <模块名>
/testcase-ui-generate --from <路径>
/testcase-ui-generate --module <模块名> --update
/testcase-ui-generate --from <路径> --update
```

参数说明：
- `--module <模块名>`：从 `testing/testcases/<模块名>.yml` 读取功能测试用例
- `--from <路径>`：直接读取指定 YAML 文件路径（相对于 `$WORKDIR`）
- `--update`：增量更新模式，仅处理 `testing/ui-testcases/<模块名>.yml` 中尚未包含的源用例（通过 `source_testcase` 字段对比去重）

### 交互模式（无参数）

无参数时，用 `AskUserQuestion` 引导用户选择：

```
请选择功能测试用例来源：
  [1] 从模块名读取（推荐）—— 自动定位 testing/testcases/<模块>.yml
  [2] 指定文件路径 —— 直接读取任意 YAML 文件
```

选 [1] 时，展示 `module_map` 中所有模块列表供用户选择。
选 [2] 时，提示用户输入文件路径。

## 执行流程

### 步骤 1：读取源用例

- `--module`：读取 `$WORKDIR/testing/testcases/<模块名>.yml`
- `--from`：读取指定路径
- 若文件不存在，提示错误并终止：
  ```
  ❌ 未找到文件：<路径>
  请先运行 /testcase-build 生成 YAML 文件，或使用 --from 指定其他路径。
  ```
- 记录源文件的模块名（从文件 `metadata.module` 字段读取，若无则从文件名推断）

### 步骤 2：智能筛选

对源用例按以下规则过滤，分为三组：

**推荐转换（全部满足）：**
- 优先级为 P0 或 P1
- 步骤数 ≤ 10
- 不包含不可自动化关键词（见下方列表）

**需要拆分（满足前两条但步骤数 > 10）：**
- 优先级为 P0 或 P1，但步骤数 > 10
- 提示用户手动拆分后重新导入

**不适合自动化（含不可自动化步骤或优先级 P2+）：**
- 步骤中含以下关键词：数据库、SQL、接口返回值、人工审核、物理设备、扫码、NFC、短信验证、后台、运营
- 优先级为 P2 或更低

不可自动化关键词列表（含中英文）：
`数据库`, `database`, `SQL`, `query`, `人工审核`, `manual review`, `物理设备`, `扫码`, `NFC`, `短信验证`, `后台`, `admin console`, `运营`, `联系`, `接口日志`, `server log`

### 步骤 3：用户确认

用 `AskUserQuestion` 分组展示筛选结果，格式如下：

```
筛选完成，共 <N> 个源用例，分析结果：

✅ 推荐转换（<N> 个）
  · TC-001  发送文本消息并收到回复  [P0]
  · TC-003  创建新对话  [P1]
  ...

⚠️  需要拆分（<N> 个，步骤数 > 10，建议手动拆分后重新导入）
  · TC-007  完整注册登录流程  [P0]  (步骤数: 14)
  ...

❌ 不适合自动化（<N> 个）
  · TC-012  数据库写入校验  [P1]  (含不可自动化步骤)
  · TC-015  人工审核通过后状态变更  [P2]
  ...

是否继续转换「推荐转换」的 <N> 个用例？[y/n]
（如需调整，请输入 [edit] 手动指定要转换的用例 ID 列表）
```

用户输入 `edit` 时，提示输入逗号分隔的用例 ID 列表。

### 步骤 4：调用 AI 转换

1. 读取 `$WORKDIR/.claude/skills/testcase-ui-generate/prompt-ui-testcase.md` 作为转换 prompt 模板
2. 将待转换的用例逐批（每批 ≤ 10 个）传入 prompt，格式：
   ```
   [源用例]
   <源用例 YAML 内容>
   [/源用例]
   ```
3. 按 prompt 模板的规则，生成 UI 自动化测试用例 YAML
4. 对生成结果执行基础校验：
   - 每个用例包含 `id`、`title`、`priority`、`steps`、`expected` 字段
   - `steps` 数量在 3～10 之间
   - `expected` 不含"数据库"、"后台"等不可 UI 验证的描述
   - 若校验失败，自动重试一次；重试后仍失败则跳过该用例并记录警告

### 步骤 5：写入文件

- 输出路径：`$WORKDIR/testing/ui-testcases/<模块名>.yml`
- 若目录不存在，先创建：`mkdir -p $WORKDIR/testing/ui-testcases/`
- **增量模式（`--update`）：**
  - 读取现有文件，获取已有的 `source_testcase` ID 集合
  - 仅追加新增用例，不覆盖已有内容
  - 更新文件头部 `metadata.total` 计数
- **全量模式（默认）：**
  - 直接写入，覆盖同路径已有文件（写入前提示用户确认）

文件结构：
```yaml
metadata:
  source_module: <模块名>
  generated_at: <YYYY-MM-DD>
  total: <用例总数>
  platform: web
  note: "由功能测试用例转换，保留 P0/P1，适用于 Midscene AI 自动化"

cases:
  - ...
```

### 步骤 6：输出确认

写入完成后展示结果摘要：

```
✅ 转换完成！

· 输出文件：testing/ui-testcases/<模块名>.yml
· 转换用例数：<N> 个（源用例 <M> 个，转换率 <N/M*100>%）
· 优先级分布：P0: <N> | P1: <N>
· 跳过用例：<N> 个（不适合自动化）
· 需要拆分：<N> 个（步骤数超限，建议手动处理）

下一步建议：
1. 审查生成的用例文件：testing/ui-testcases/<模块名>.yml
2. 运行 UI 自动化测试：/ui-automation --from-yaml testing/ui-testcases/<模块名>.yml
3. 将需要拆分的用例手动拆分后重新运行：/testcase-ui-generate --module <模块名> --update
```

## 注意事项

- 转换不会修改源功能测试用例文件，源文件只读
- `--update` 模式通过 `source_testcase` 字段去重，确保同一源用例不会重复转换
- 如果功能用例中没有 `id` 字段，使用行号作为临时 ID（如 `ROW-001`），并在输出时提示用户补全 ID
- 生成的用例 ID 格式为 `UI-<模块缩写大写>-<三位序号>`，模块缩写从模块名取前 4 个字母大写（如 `chat` → `CHAT`，`chat-composer` → `CHCO`）
- 若模块缩写冲突，追加数字区分（如 `CHAT1`、`CHAT2`）
