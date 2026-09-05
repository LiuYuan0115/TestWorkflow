---
name: experience-add
description: 当用户输入 /experience-add 时使用。将漏测场景或测试模板写入 testing/experience.md 经验库。
allowed-tools: [Read, Write, Edit, Bash, AskUserQuestion]
---
# /experience-add — 写入经验库

## 触发场景
用户运行 `/experience-add` 或提到"写入经验库"、"记录漏测"、"沉淀经验"时激活。

## 配置读取
启动时读取 `.claude/config/testcase-workflow.yml`，获取：
- `experience.path`：经验库路径（默认 `testing/experience.md`）

## 输入方式

### 直接模式（带参数）
```
/experience-add --bug BUG-0042          # 从 bug 记录提取经验
/experience-add --module auth           # 为指定模块补充测试模板
/experience-add --template auth         # 为指定模块补充优质用例模板
/experience-add                         # 交互模式
```

### 交互模式（无参数）
```
请选择写入类型：
  [1] 漏测场景（关联 Bug）—— 记录本次测试遗漏的场景
  [2] 测试模板补充 —— 为某类功能补充通用测试点
  [3] 优质用例模板 —— 从已通过的用例中提炼可复用片段
```

## 执行流程

### 写入类型 [1]：漏测场景

```
Skill：关联的 Bug ID（如 BUG-0042，输入 ? 跳过）：
Skill：漏测场景描述（一句话）：
Skill：教训（下次生成此类用例时需要注意什么）：
Skill：所属模块（输入 ? 跳过，或从以下选择）：
  从 `.claude/config/testcase-workflow.yml` 的 `module_map` 动态读取，按分组展示完整编号列表（格式同 /testcase-design），最后一项为手动输入，不得省略任何模块。
```

写入格式（追加到 `testing/experience.md` 的"历史漏测场景"节）：
```markdown
- **YYYY-MM-DD BUG-XXXX**：<漏测场景描述>
  - 教训：<教训内容>
  - 模块：<模块名>
```

### 写入类型 [2]：测试模板补充

```
Skill：功能类型（如"文件上传类"、"权限管理类"）：
Skill：补充的测试点（逐行输入，空行结束）：
```

写入格式（追加到 `testing/experience.md` 的"常见测试模板"节）：
```markdown
### <功能类型>
<用户输入的测试点列表>
```

### 写入类型 [3]：优质用例模板

```
Skill：功能类型（如"登录类"、"文件上传类"）：
Skill：用例标题（一句话，≤30字）：
Skill：亮点（为什么这条用例值得复用，一句话）：
Skill：适用场景（什么时候可以套用这个模板）：
（可继续添加，输入空行结束）
```

写入格式（追加到 `testing/experience.md` 的"优质用例模板"节）：
```markdown
### <功能类型>（YYYY-MM-DD）
| 用例标题 | 亮点 | 适用场景 |
|---------|------|---------|
| <标题> | <亮点> | <适用场景> |
```

## 完成后输出

```
已写入 testing/experience.md：
· 类型：漏测场景 / 测试模板 / 优质用例模板
· 关联：BUG-XXXX（如有）
· 位置：testing/experience.md → <节名>

下一步：运行 /testcase-design --module <模块> --with-experience 生成用例时将自动参考此经验。
```

## 文件不存在时的处理
如果 `testing/experience.md` 不存在，将 `assets/experience-template.md` 内容复制到该路径，再追加内容。
