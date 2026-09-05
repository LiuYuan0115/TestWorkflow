---
name: test-recommend
description: 当用户输入 /test-recommend 时使用。默认读取本项目 docs/pull-records/ 最新拉取记录（pull-record）推荐用例；亦支持 main / pull / HEAD~N / commit range 等 base 模式，可选生成执行清单 YAML。
allowed-tools: [Read, Bash, AskUserQuestion]
---
# /test-recommend — 精准测试推荐

## 触发场景
用户运行 `/test-recommend`、`/test-recommend <base>` 或 `/test-recommend <base> --save` 时激活。

## 参数解析

| 调用方式 | base | save |
|---------|------|------|
| `/test-recommend` | **pull-record（默认，读 docs/pull-records/ 最新文件）** | 交互询问 |
| `/test-recommend pull-record` | 同上（显式） | 交互询问 |
| `/test-recommend main` | main | 交互询问 |
| `/test-recommend pull` | ORIG_HEAD..HEAD | 交互询问 |
| `/test-recommend HEAD~3` | HEAD~3 | 交互询问 |
| `/test-recommend abc..def` | abc..def | 交互询问 |
| 任意模式 + `--save` | 同上 | 直接保存 |

## 执行流程

### 步骤 1：读取配置
读取 `.claude/config/testcase-workflow.yml`，取 `project.dev_repo`。

若路径不存在，报错并结束：
```
错误：开发仓路径不存在：<dev_repo>
请检查 .claude/config/testcase-workflow.yml 的 project.dev_repo 字段。
```

### 步骤 2：确定 base

**无参数 / `pull-record`（默认）**：进入 pull-record 流程：
1. 拼出目录 `docs/pull-records/`。
2. 取**最新记录文件**：列出目录下所有 `*.md`，**排除 `EXAMPLE.md`**，按文件名字典序取最大者（文件名时间前缀保证字典序 == 时间序）。
   ```bash
   ls docs/pull-records/*.md 2>/dev/null | grep -v '/EXAMPLE\.md$' | sort | tail -1
   ```
3. 用 Read 读取该文件，解析 YAML frontmatter：
   - `base` / `head` → 组成 base 标识 `<base> -> <head>`。
   - `files.modified` → modified 清单；`files.added` → added 清单；`files.deleted` → deleted 清单（**pull-record 现已区分 A/M/D**）。
   - `modules` → 缓存为「记录内模块 key 列表」，供步骤 6.5 直接复用（免重复匹配）。
4. 带三组文件清单进入步骤 5（用 modified + added 参与用例匹配；deleted 供步骤 7 废弃提示）。
5. **pull-record 模式跳过步骤 4 的 [Y/n] 确认**（记录即确定交接物），展示变更后直接推荐。

**pull-record 边界处理**（在上面第 1~3 步定位/解析时判断，命中即结束，不进入步骤 5）：
- `docs/pull-records/` 目录不存在，或除 `EXAMPLE.md` 外无任何 `*.md` → 提示并结束：
  ```
  暂无拉取记录。请先运行"拉取最新代码"(qa-pull-latest)，
  或改用 /test-recommend pull（按 git ORIG_HEAD..HEAD 对比）。
  ```
- 最新文件 frontmatter 缺字段或解析失败 → 报错并指出文件路径：
  `错误：拉取记录解析失败：<path>（frontmatter 缺字段）。`

**`pull`**：转换为 `ORIG_HEAD..HEAD`（git diff 模式）。
**`main` / `HEAD~N` / `abc..def`**：直接使用传入值（git diff 模式）。
**git diff 模式保留步骤 4 的 [Y/n] 确认**（base 可能为临时指定）。

### 步骤 3：运行 git diff
```bash
git -C <dev_repo> diff --name-status <base>...HEAD
```
pull 模式：
```bash
git -C <dev_repo> diff --name-status ORIG_HEAD..HEAD
```

**异常处理**：
- ORIG_HEAD 不存在 → 报错：`ORIG_HEAD 不存在，请先在开发仓执行 git pull，或改用其他 base（如 main / HEAD~N）。`
- 变更文件为 0 → 输出：`当前无代码变更（对比 <base>）。` 并结束。

解析输出，按类型分组（`R` 归入 modified）：
- `M` → modified（功能变更）
- `A` → added（新增文件）
- `D` → deleted（删除文件）

### 步骤 4：展示变更文件，询问确认
```
📂 代码变更分析（对比 <base>）
  🔄 功能变更（N 个）：file1, file2 ...
  🆕 新增文件（N 个）：file3 ...
  ❌ 删除文件（N 个）：file4 ...

继续推荐？[Y/n]
```
用户输入 n 则结束。

### 步骤 5：扫描用例库
遍历 `testing/testcases/**/*.yml`，对每个文件：
1. 读取 `linked_code` 字段（数组）
2. 检查是否有任意 `path` 与 modified 文件列表中的任一文件有路径包含关系（后缀匹配，如 `src/auth/login.tsx` 匹配 `login.tsx`）
3. 匹配则收集：`id`、`title`、`priority`、`platforms`

若 `testing/testcases/` 不存在或为空，输出：
```
尚无测试用例。请先运行 /testcase-design 生成用例。
```
并结束。

### 步骤 6：输出推荐结果
按 P0 → P1 → P2 → P3 排序：
```
🎯 推荐测试用例（共 N 个）

  【P0 必测 — N 个】
  · AUTH-001  邮箱+正确密码登录
  · AUTH-004  密码错误提示

  【P1 建议测 — N 个】
  · PAY-001   支付流程

  ⏱️  预计耗时：约 N 分钟（P0 约 N 分钟）
```
耗时估算：P0 每条 5 分钟，P1 每条 10 分钟，P2/P3 每条 15 分钟。

若匹配用例为 0：
```
未找到关联用例。
受影响文件：<modified 文件列表>
建议：为上述文件对应的模块补充 linked_code 字段，或运行 /testcase-design 生成用例。
```

### 步骤 6.5：模块富化（可选，如果存在模块映射文档）

如果本项目 `docs/` 目录下存在模块代码映射文档，可对变更文件附加测试导向富信息：

1. **归类业务模块**：
   - pull-record 模式直接用步骤 2 缓存的「记录内模块 key 列表」，据 key 从 module_map 反查 path、再据 §1/§2 取业务模块中文名与 UI 入口（免重复匹配变更文件）。
   - git diff 模式按映像 §2「路径前缀 → 模块」表，将变更文件归类到业务模块。
2. **附 UI 入口**：对每个命中模块，从 §1「主要 UI 入口」列取测试入口。
3. **附跨模块告警**：变更文件命中 §3「大文件/跨模块告警」表中任一文件时，输出该行「测试注意」，提示扩大回归面。
4. **附运行链路**：命中模块出现在 §4 端到端链路中时，提示该链路一并冒烟。

输出（置于步骤 6 推荐清单之后）：
```
📍 模块测试入口（来自模块映射文档）
  · <业务模块> → <§1 UI 入口>；<简要测试动作>
  ⚠️ 命中跨模块告警：<文件> → <§3 测试注意>
  🔗 运行链路：<§4 链路名> 建议一并冒烟
```

无映像文件或无命中时，跳过本步骤（不报错，不影响步骤 6 已出的推荐）。
即使步骤 5 匹配用例为 0（"未找到关联用例"），**本步骤仍照常展示模块 UI 入口**，便于手工探索测试。

### 步骤 7：输出新增/删除提示

> **pull-record 模式现已支持 A/D 提示**：记录文件 frontmatter 的 `files.added`/`files.deleted` 已区分文件类型，本步骤对 pull-record 与 git diff 两种模式**一致执行**。

**新增文件（A 类）**，若有：
```
🆕 新增文件无关联用例，建议补充：
  · <file> → 运行 /testcase-design 为 <模块> 模块补充用例
```
模块名从文件路径推断（匹配 module_map 路径关键词；无法推断则显示"对应模块"）。

**删除文件（D 类）**，若有：
扫描用例库，找 `linked_code.path` 包含已删除文件的用例：
```
⚠️  删除文件关联用例，请确认是否废弃：
  · <ID>  <title>（linked: <deleted_file>）
```

### 步骤 8：询问是否保存
**已带 `--save`**：直接执行步骤 9，不再询问。

**交互模式**：
```
生成执行清单？[y/N]
```
用户输入 y 则执行步骤 9。

### 步骤 9：写执行清单 YAML
路径：`testing/exec-plans/YYYYMMDD.yml`
同一天多次运行追加序号：`20260519-2.yml`。

```yaml
generated_at: YYYY-MM-DD
diff_base: <base>
dev_repo: <dev_repo>

changed_files:
  modified:
    - <file>
  added:
    - <file>
  deleted:
    - <file>

recommended:
  - id: <ID>
    title: <title>
    priority: <P0/P1/P2/P3>
    status: pending    # pending / passed / failed

no_coverage:
  - file: <added_file>
    reason: 新增文件，无关联用例
    suggestion: /testcase-design <模块>

deprecated_candidates:
  - id: <ID>
    title: <title>
    reason: 关联文件已删除
```

> pull-record 模式下 `diff_base` 记为 `pull-record (<base> -> <head>)`，取自记录文件 frontmatter，可追溯到具体拉取记录文件。

`no_coverage` 和 `deprecated_candidates` 为空时省略对应字段。

输出确认：
```
✅ 执行清单已保存：testing/exec-plans/<filename>.yml
```
