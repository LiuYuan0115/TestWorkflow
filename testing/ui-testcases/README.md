# UI 测试用例

## 与功能测试用例的区别

| 维度 | 功能测试用例 | UI 测试用例 |
|------|-------------|------------|
| **目录** | testing/testcases/ | testing/ui-testcases/ |
| **用途** | 手工测试执行 | UI 自动化代码生成 |
| **覆盖范围** | 全面（正常/异常/边界/权限） | 核心流程（P0/P1） |
| **步骤格式** | 自然描述 | 标准化格式（含元素描述） |
| **优先级** | P0-P3 | P0-P1 |

## 生成方式

```bash
# 从功能用例生成 UI 用例
/testcase-ui-generate --module chat-ui

# 从 UI 用例生成自动化代码
/ui-automation --from-yaml testing/ui-testcases/chat-ui.yml
```

## YAML 结构

```yaml
metadata:
  source_file: testing/testcases/chat-ui.yml
  generated_at: "2026-06-05"
  generated_by: testcase-ui-generate
  total_cases: 8

- id: UI-CU-001
  title: 发送问题后 AI 返回纯文本消息正常渲染
  priority: P0
  platform: desktop
  source_testcase: CU-001
  preconditions:
    - 已登录并进入聊天界面
  steps:
    - action: "在聊天输入框中输入\"你好\""
    - action: "点击蓝色发送按钮，位于输入框右侧"
    - action: "等待3秒"
  expected:
    - "AI 回复以气泡形式出现在对话区"
  tags:
    - 核心流程
  metadata:
    last_enhanced: "2026-06-05"
    enhanced_steps: []
    automation_status: pending
    test_file: ""
```

## 步骤格式规范

步骤描述必须遵循以下格式：
- 点击操作: "点击[目标元素，含位置/特征]"
- 输入操作: "在[目标输入框]中输入[具体值]"
- 滚动操作: "向[方向]滚动[目标区域]"
- 按键操作: "按下[按键名]"
- 悬停操作: "悬停在[目标元素]"
- 等待操作: "等待[N]秒" 或 "等待[条件]出现"
- 导航操作: "跳转到[URL]"

每步只包含一个操作，步骤 50 字以内。

## 维护规则

1. **不要手动编辑**：UI 用例由 `/testcase-ui-generate` 生成和维护
2. **双向同步**：`/ui-automation --from-yaml` 代码生成时的步骤优化会自动回写
3. **定期更新**：功能用例变更后使用 `--update` 参数增量更新
4. **质量优化**：使用 `/testcase-ui-enhance` 批量检查和补充步骤描述
