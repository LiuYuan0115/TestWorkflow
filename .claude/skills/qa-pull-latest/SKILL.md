---
name: qa-pull-latest
description: 测试感知工作流（测试项目版）。当测试人员说"拉取最新代码"或"更新变更记录"时使用。从本项目 .claude/config/testcase-workflow.yml 读取 dev_repo，对开发仓自动安全拉取（保护本地改动与启动环境、补装新依赖），按模块归类增量提交并展示提交/内容/涉及层/提交人/注意事项，确认后写入本项目 docs/pull-records/ 独立拉取记录文件（frontmatter 分 A/M/D 文件与 risk_level，供 test-recommend 读取）。
allowed-tools: [Bash, Read, Edit]
user-invocable: true
---

# 与开发项目内同名 skill 的差异

本 skill 是 `qa-pull-latest` 的**测试项目版**，运行在测试仓 `cctestcode`，但**操作对象是开发仓**：

- **开发仓路径不写死**：从本项目 `.claude/config/testcase-workflow.yml` 的 `project.dev_repo` 读取，记为 `<dev_repo>`。
- **所有 git / pnpm / 文件操作都针对 `<dev_repo>`**：git 用 `git -C <dev_repo> ...`，pnpm 用 `pnpm -C <dev_repo> ...`，读写文件用 `<dev_repo>/...` 绝对路径。**不要**在测试仓自身执行 git 拉取。
- **变更记录写回本项目 docs/**：`docs/pull-records/` 独立拉取记录，写入测试仓本地（test-recommend 从本项目 docs/pull-records/ 读取）。
- **阶段 9 的模块名取自本测试项目** `.claude/config/testcase-workflow.yml` 的 `module_map`——`/testcase-update --diff pull --modules <...>` 的模块参数必须是测试项目 module_map 中的 key，否则 testcase-update 无法识别。

# 步骤 0：定位开发仓（必做，最先执行）

读取本项目 `.claude/config/testcase-workflow.yml`，取 `project.dev_repo` 作为 `<dev_repo>`。

```bash
test -d "<dev_repo>/.git" || echo "❌ dev_repo 不是 git 仓库"
```
- 路径不存在或非 git 仓库：报错并结束，提示检查 `.claude/config/testcase-workflow.yml` 的 `project.dev_repo`。

后文所有 `git ...` / `pnpm ...` / 相对路径，一律以 `<dev_repo>` 为工作目录（`git -C <dev_repo>` / `pnpm -C <dev_repo>` / `<dev_repo>/...` 绝对路径）。

# 设计原则

- **全程不向测试人员提问**：拉取、保护、补装依赖、分析、写入记录全部自动完成，一次性输出结果。不要用 AskUserQuestion 询问拉取方式、是否 stash、是否安装依赖、是否写入等——直接按下面的安全流程执行。
- **保证启动不受影响**：拉取不得让前端/服务因缺依赖或脚本被覆盖而起不来。本地未提交改动先 stash 备份；与新代码冲突时**以拉取的最新代码为准**，被覆盖项保留在 stash 中可找回。
- **快进优先**：开发仓本地通常无自有提交，落后远程，使用 `--ff-only` 快进；本地未提交改动用 stash 隔离再恢复。

# 阶段 A：安全拉取（自动，不提问）

1. **fetch 并评估**：
   ```bash
   git -C <dev_repo> fetch origin dev
   git -C <dev_repo> rev-list --left-right --count HEAD...origin/dev   # 输出 "ahead<TAB>behind"（左=本地领先，右=落后）
   git -C <dev_repo> log --oneline HEAD..origin/dev                      # 远程新增提交
   ```
   - 拉取前先记录当前 HEAD：`git -C <dev_repo> rev-parse --short HEAD`（后续依赖检测与 pull-records base hash 用）。
   - 若 behind=0：已是最新，直接告知测试人员"已是最新代码"，跳到阶段 C 之前无新增可分析（结束）。
   - 若 ahead>0（本地有自有提交）：不能纯快进，**停止并告知测试人员开发仓本地领先 N 个提交**，列出这些提交，等待指示（不要擅自 rebase/merge）。

2. **预检冲突面**（决定是否需要 stash、是否有风险）：
   ```bash
   git -C <dev_repo> status --short                          # 本地未提交改动
   git -C <dev_repo> diff --name-only HEAD..origin/dev       # 新提交改了哪些文件
   ```
   - 用上面两份清单做交集，确认新提交是否触碰本地未提交改动的文件。有交集则在最终输出里**显式提示可能冲突**，但仍按下面流程执行（stash pop 时若冲突会暴露）。

3. **stash 保护 → 快进 → 恢复**（本地有未提交改动时）：
   ```bash
   git -C <dev_repo> stash push -u -m "pull-safeguard-$(git -C <dev_repo> rev-parse --short HEAD)"
   git -C <dev_repo> merge --ff-only origin/dev
   git -C <dev_repo> stash pop
   ```
   - 本地无未提交改动时，省略 stash，直接 `git -C <dev_repo> merge --ff-only origin/dev`。
   - **`git stash pop` 若报冲突：一律以拉取的最新代码为准，自动解决，不停下等待**：
     ```bash
     git -C <dev_repo> diff --name-only --diff-filter=U          # 列出冲突文件
     # 对每个冲突文件保留已快进的最新版本（ours=拉取下来的最新代码），丢弃本地 stash 改动
     git -C <dev_repo> checkout --ours -- <冲突文件...>
     git -C <dev_repo> add <冲突文件...>
     ```
   - stash **不执行 drop**（pop 冲突时本就保留在 `git -C <dev_repo> stash list`），作为被覆盖本地改动的备份，供测试人员需要时找回。
   - 在最终「⚠️ 注意事项」中**列出被最新代码覆盖的本地文件**及 stash 备份名（`pull-safeguard-<hash>`），提示核对。

# 阶段 B：依赖与启动保护（自动）

4. **检测新增依赖**（防止前端/服务因缺包起不来）：
   ```bash
   git -C <dev_repo> diff <拉取前HEAD>..HEAD -- '**/package.json' pnpm-lock.yaml
   ```
   - 若任一 `package.json` 新增了 dependencies，或 `pnpm-lock.yaml` 变化：执行
     ```bash
     pnpm -C <dev_repo> install --frozen-lockfile
     ```
     （`--frozen-lockfile` 按锁文件安装、不改 lockfile。若 lockfile 与 package.json 不一致而失败，改用 `pnpm -C <dev_repo> install` 并在输出中说明 lockfile 被更新。）
   - 安装后校验关键新依赖确实落地（如 `ls <dev_repo>/node_modules/.pnpm/<pkg>@*`）。

5. **启动环境完好性校验**（基于开发仓当前的本地修复/回滚状态，逐项确认未被覆盖；均以 `<dev_repo>` 为根）：
   - `scripts/dev-control-plane.sh` 不含 `corepack`（历史上被合并覆盖过，会触发 `corepack: not found`）：
     `grep -c corepack <dev_repo>/scripts/dev-control-plane.sh` 应为 0。
   - OpenClaw runtime 物化产物 `<dev_repo>/services/openclaw/runtime/openclaw/` 仍存在。
   - bootstrap 配置 `<dev_repo>/apps/desktop/src-tauri/resources/config/openclaw-runtime.json` 版本为期望值（当前 `2026.3.13`）。
   - 任一项异常：在输出中**高亮告警**并给出修复建议，不要静默放过。

# 阶段 C：变更分析与展示

6. **使用拉取前的 HEAD 作为分析基线**：
   ```bash
   git -C <dev_repo> log <拉取前HEAD>..HEAD --oneline --no-merges
   ```
   对每条提交收集：摘要、作者、变更文件、涉及层。
   ```bash
   git -C <dev_repo> show --stat --format='%H%n%an%n%s' <hash>          # 作者(%an) + 摘要 + 变更文件
   ```
   按**本项目** `.claude/config/testcase-workflow.yml` 的 `module_map` 路径规则将变更文件归类到**模块**（用于展示与 docs/pull-records/ 记录的 modules 字段）；按文件路径推断**涉及层**（见下表）。

   **涉及层推断规则**（一条提交可跨多层）：
   | 路径前缀 | 涉及层 |
   |---|---|
   | `apps/desktop/src/` | 前端/桌面壳层 |
   | `apps/desktop/src-tauri/` | Tauri 桌面端（启动链路，跑 `tauri:dev` 需冒烟）|
   | `services/control-plane/` | 云控制面（认证/计费/OEM）|
   | `services/openclaw/`、`scripts/*openclaw*` | OpenClaw 运行时/集成层 |
   | `services/data-sync-service/` | 数据同步服务 |
   | `packages/sdk`、`packages/shared` | 共享层（跨服务影响面大）|
   | `scripts/dev-*.sh`、根 `package.json` scripts | 启动脚本 |
   | `admin-web/`、`home-web/`、`extension/` | 运营台/营销站/扩展 |

7. **一次性输出变更总览并直接进入阶段 D 写入记录**。输出包含两部分：

   **(1) 提交总览表**（按时间倒序，让测试人员快速看全貌）：
   ```
   ## 本次拉取：<拉取前hash> → <最新hash>（新增 N 个提交）

   | 提交 | 内容 | 涉及层 | 提交人 |
   |------|------|--------|--------|
   | `<hash>` | <中文摘要> | <层1·层2> | <作者> |
   ```

   **(2) 按模块的测试指引**：
   ```
   ### <模块名>

   #### 🐛 修复 / ✨ 新功能 / 🔧 重构 / 📦 构建 / 🧪 测试 / 📝 其它
   - <commit 中文摘要>（`<hash>`，<作者>）
     关键文件：<最多 3 个>（仅修复/新功能展示）

   #### 📋 测试指引
   **测试路径**：<据本项目 testcase-workflow.yml 的 ui_entry 生成；testable:false 模块写"无需手工测试（后端/逻辑层）"，建议跑对应 pnpm test:unit:*>
   **关键测试点**：<基于变更文件与提交类型生成 2-4 个具体验证点>
   **影响面**：<据涉及层判断：触及 Tauri/shared/sdk 为高影响；触及 scripts/services 为中影响；独立模块 UI 组件写"仅限本模块">
   ```

   **(3) ⚠️ 注意事项**（全局，置于最后，源自阶段 A/B 与跨切面观察）：
   ```
   ## ⚠️ 测试注意事项
   - <若有新增依赖>已自动 pnpm install 补装 <pkg>@<ver>；其他测试人员拉取后同样需 pnpm install，否则启动报模块缺失
   - <若 stash pop 冲突 / 本地改动有交集>开发仓本地改动与新提交涉及同一文件，已**以最新代码为准覆盖**，本地版本见 stash 备份 `pull-safeguard-<hash>`，注意核对：<文件>
   - <若启动校验有异常>启动环境告警：<项> —— <修复建议>
   - <若改动触及 Tauri/启动脚本/共享层>本批改动了 <层>，跑 <pnpm tauri:dev / dev:api / dev:admin> 需完整冒烟
   - <若改动 control-plane 数据层>建议跑 pnpm test:unit:control-plane 验证
   - 本分析基于 diff 静态判断，未实际启动验证运行时行为
   ```

   类型映射：`fix:`→🐛 / `feat:`→✨ / `refactor:`→🔧 / `build:`/`ci:`→📦 / `test:`→🧪 / 其他→📝
   规则：每模块内按类型分组，无该类型则省略；commit 摘要译中文并保留 hash 与作者引用；关键文件仅修复/新功能展示。
   未匹配模块时在所有模块后追加：
   ```
   ⚠️ 以下变更路径未匹配到 testcase-workflow.yml module_map 的任何模块：
     · <路径>
     → 如需纳入测试覆盖，请更新 .claude/config/testcase-workflow.yml 的 module_map
   ```

# 阶段 D：写入独立拉取记录（自动，不等待确认）

8. 输出变更总览后，**立即自动执行**本步骤，采集数据并生成一个独立记录文件。**不再写 `版本功能变更记录.md` 与 `模块代码映像.md §8`。**

   **8.1 采集 A/M/D 文件分组**（使用拉取前 HEAD 作为 base）：
   ```bash
   git -C <dev_repo> diff --diff-filter=A --name-only <拉取前HEAD>..HEAD   # added
   git -C <dev_repo> diff --diff-filter=M --name-only <拉取前HEAD>..HEAD   # modified
   git -C <dev_repo> diff --diff-filter=D --name-only <拉取前HEAD>..HEAD   # deleted
   ```
   （`R` 重命名若出现，并入 modified。）

   **8.2 归类 modules（取 module_map key）**：读**本项目** `.claude/config/testcase-workflow.yml` 的 `module_map`，将上面三组文件与每个模块 `path`（及 `scan_filter`）做路径包含匹配，去重得到命中的 **module_map key 列表**（如 `chat-ui`、`im-bots`）。**frontmatter.modules 只放 key，不放业务模块中文名**（正文分组仍可用中文名，见 8.4）。

   **8.3 推断 risk_level**（按优先级取最高命中）：
   | 级别 | 触发条件 |
   |---|---|
   | `high` | 触及 `apps/desktop/src-tauri/`、`packages/sdk`、`packages/shared` |
   | `medium` | 触及 `scripts/dev-*.sh`、根 `package.json` scripts、`services/*`（非上表）；或存在 A 类新增文件 |
   | `low` | 其余（仅模块内 UI 组件小改） |

   **8.4 组装并写文件**：
   - 时间戳：文件名用 `date '+%Y-%m-%d-%H%M'`；frontmatter `pulled_at` 用 `date '+%Y-%m-%d %H:%M'`。
   - 短 hash：`base` = 拉取前 HEAD 短格式，`head` = `git -C <dev_repo> rev-parse --short HEAD`。
   - 文件名：`docs/pull-records/<日期时分>__<base>-<head>.md`。
   - 目录不存在则先 `mkdir -p docs/pull-records`。
   - 内容严格按 `docs/pull-records/EXAMPLE.md` 的结构（frontmatter 字段名/层级 + 正文骨架）：
     - frontmatter：`pulled_at` / `base` / `head` / `commit_count`（阶段 C 提交数）/ `modules`（8.2 的 key 列表）/ `files.added|modified|deleted`（8.1 三组）/ `risk_level`（8.3）。
     - 正文 `## ⚠️ 风险提示`：对命中启动链路（Tauri/shared/sdk/启动脚本）的写 🟡 行，风险级别 high 时写具体受影响层。
     - 正文 `## 按模块测试指引`：沿用阶段 C 步骤 7 已生成的分组（模块名 + 提交类型图标行 + **测试路径** + **关键测试点** + **影响面**），**modules 列表里每个命中模块都要有一节，不得遗漏**，每模块末尾加 `**变更文件**：+A ~M -D` 计数。三件套生成规则与阶段 C 步骤 7 (2) 完全一致：测试路径据 `testcase-workflow.yml` 的 `ui_entry`（`testable:false` 模块写"无需手工测试（后端/逻辑层）"）；关键测试点据变更文件+类型生成 2-4 个；影响面据涉及层判断（触及 Tauri/shared/sdk 为高影响；触及 scripts/services 为中影响；独立模块 UI 组件写"仅限本模块"）。
     - 正文 `## ⚠️ 测试注意事项`（全局，置于最后）：直接落地阶段 C 步骤 7 (3) 已生成的全局注意事项（新增依赖 pnpm install、stash 覆盖备份、启动校验告警、Tauri/启动脚本/共享层冒烟建议、control-plane 数据层 test:unit 建议、"基于 diff 静态判断未实际启动"兜底行）。仅保留本批实际命中的条目，无对应情形的条目省略。
   - 提交类型图标映射（与阶段 C 一致）：`fix:`→🐛 / `feat:`→✨ / `refactor:`→🔧 / `build:`·`ci:`→📦 / `test:`→🧪 / 其他→📝。

   **8.5 约束**：仅写 `docs/pull-records/`（测试仓，可正常提交 Git）。**禁止**对 `<dev_repo>` 执行 `git add/commit/push`。

9. 完成步骤 8 后输出后续操作提示：

   a. **匹配受影响可测模块（取本测试项目 module_map）**：读**本项目** `.claude/config/testcase-workflow.yml` 的 `module_map`，遍历增量变更文件与每个模块 `path`（及 `scan_filter`）做路径包含匹配，过滤 `testable: false`，去重得到受影响可测模块列表。**输出的模块名必须是该 module_map 的 key**（如 `auth`、`chat-ui`、`im-bots`），因为 `/testcase-update --modules` 只认这些 key。

   b. **判断是否提示 testcase-update**：增量含 `feat:` 或 `fix:`，或有新增文件（git diff A 类）则提示；仅 `build:`/`ci:`/`refactor:` 且无新增文件不提示。

   c. **输出建议块**（无可测模块则跳过）：
      ```
      📦 涉及模块：<模块key1> · <模块key2> · ...

      💡 建议操作：
        · /test-recommend                                            — 默认 pull-record，读刚写入的 docs/pull-records/ 拉取记录推荐用例
        · /testcase-update --diff pull --modules <模块key1>,<模块key2> — 检测到新功能/新增文件，建议更新用例库
      ```
      不需提示 testcase-update 时只保留 `/test-recommend` 一行。
      `--modules` 的值一律用步骤 9.a 得到的本项目 module_map key（testable:false 的不放入建议）。

   d. **检测 testcase-workflow 相关变更**：若增量变更文件触及模块映射相关路径，在建议块后追加提示：本项目 `.claude/config/testcase-workflow.yml` 的 `module_map` 是否需补模块。

# 约束

- 操作对象始终是 `<dev_repo>`（开发仓）；本测试仓只读 `.claude/config/testcase-workflow.yml` 取路径与模块，不在测试仓执行 git 拉取。
- 本项目 `docs/` 属测试仓，变更记录可正常提交 Git；但禁止对开发仓 `<dev_repo>` 执行 `git add` / `git commit` / `git push`。
- 阶段 A–D 全自动、不提问；阶段 D（写入变更记录）输出变更总览后立即自动执行，无需等待确认。
- 阶段 A 的 stash/ff-only/install 属安全且可恢复操作，无需逐步征求同意；`git stash pop` 冲突按"以最新代码为准"自动解决（stash 保留作备份），不停下；仅本地领先远程（ahead>0）时必须停止并交还决策权。
- 阶段 9 为纯提示，不自动调用其他技能、不修改任何文件。
- git remote URL 内含 oauth2 token，属凭证，不要在输出中打印完整 remote 地址。
