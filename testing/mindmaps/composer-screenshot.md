---
linked_code:
  ai:
    - path: apps/desktop/src/app/components/composer/ComposerScreenshotAnnotator.tsx
      confidence: high
      by: ai
    - path: apps/desktop/src/app/components/composer/ComposerScreenshotInlineOverlay.tsx
      confidence: high
      by: ai
    - path: apps/desktop/src/app/components/composer/ComposerAttachMenuIcon.tsx
      confidence: high
      by: ai
    - path: apps/desktop/src/app/lib/composer-screenshot-session.ts
      confidence: high
      by: ai
    - path: apps/desktop/src/app/lib/composer-screenshot-coords.ts
      confidence: high
      by: ai
    - path: apps/desktop/src/app/lib/composer-screenshot-annotator.ts
      confidence: high
      by: ai
---

# composer-screenshot 测试用例

## 测试点摘要

| 编号 | 用例标题 | 维度 | 优先级 | 平台 | 测试标签 |
|------|---------|------|--------|------|---------|
| CSHOT-001 | Tauri 环境下调用 prepare 成功启动截图会话 | 正常场景 | P0 | desktop | 接口测试 |
| CSHOT-002 | 截图会话完成后窗口恢复 | 正常场景 | P1 | desktop | - |
| CSHOT-003 | 从左上到右下拖拽框选有效区域 | 正常场景 | P1 | desktop | - |
| CSHOT-004 | 从右下到左上反向拖拽框选 | 正常场景 | P1 | desktop | - |
| CSHOT-005 | 框选区域尺寸 >= 32x32 像素通过校验 | 正常场景 | P1 | desktop | - |
| CSHOT-006 | 选区尺寸 badge 在上方 32px 处显示 | 正常场景 | P1 | desktop | - |
| CSHOT-007 | 选区靠近顶部时 badge 不超出屏幕 | 正常场景 | P1 | desktop | - |
| CSHOT-008 | 未框选时显示半透明提示与蒙层 | 正常场景 | P1 | desktop | - |
| CSHOT-009 | 选择矩形工具并绘制矩形标注 | 正常场景 | P1 | desktop | - |
| CSHOT-010 | 选择箭头工具并绘制箭头标注 | 正常场景 | P1 | desktop | - |
| CSHOT-011 | 选择文字工具并输入文字标注 | 正常场景 | P1 | desktop | - |
| CSHOT-012 | 文字标注 input 失焦时自动确认 | 正常场景 | P0 | desktop | - |
| CSHOT-013 | 切换标注颜色为红色（#E53935） | 正常场景 | P1 | desktop | - |
| CSHOT-014 | 切换标注颜色为黄色（#F9A825） | 正常场景 | P1 | desktop | - |
| CSHOT-015 | 切换标注颜色为蓝色（#1E88E5） | 正常场景 | P1 | desktop | - |
| CSHOT-016 | 绘制标注后撤销（Cmd+Z） | 正常场景 | P1 | desktop | - |
| CSHOT-017 | 撤销后重做（Cmd+Shift+Z） | 正常场景 | P1 | desktop | - |
| CSHOT-018 | 撤销按钮点击生效 | 正常场景 | P1 | desktop | - |
| CSHOT-019 | 重做按钮点击生效 | 正常场景 | P1 | desktop | - |
| CSHOT-020 | 完成标注并点击确认按钮 | 正常场景 | P0 | desktop | - |
| CSHOT-021 | 无标注直接确认 | 正常场景 | P0 | desktop | - |
| CSHOT-022 | 标注器内按 Esc 取消 | 正常场景 | P1 | desktop | - |
| CSHOT-023 | 覆盖层内按 Esc 取消 | 正常场景 | P1 | desktop | - |
| CSHOT-024 | 覆盖层内右键取消 | 正常场景 | P1 | desktop | - |
| CSHOT-025 | 标注器点击取消按钮 | 正常场景 | P1 | desktop | - |
| CSHOT-026 | 覆盖层与显示器尺寸一致时映射无缩放 | 正常场景 | P1 | desktop | 兼容性测试 |
| CSHOT-027 | 覆盖层小于显示器时放大映射 | 正常场景 | P1 | desktop | - |
| CSHOT-028 | Canvas 物理尺寸与 DOM 尺寸一致 | 正常场景 | P1 | desktop | - |
| CSHOT-029 | Canvas 物理尺寸大于 DOM（高 DPI） | 正常场景 | P1 | desktop | 兼容性测试 |
| CSHOT-030 | 当前时间生成文件名 | 正常场景 | P1 | desktop | - |
| CSHOT-031 | 文件名拼接完整 | 正常场景 | P1 | desktop | - |
| CSHOT-032 | 传入有效 icon key 渲染图标 | 正常场景 | P1 | desktop | - |
| CSHOT-033 | 非 Tauri 环境下调用截图返回 null | 异常场景 | P1 | desktop | 接口测试 |
| CSHOT-034 | 截图进行中重复调用被拦截 | 异常场景 | P1 | desktop | - |
| CSHOT-035 | prepare_composer_screenshot_capture 调用失败 | 异常场景 | P1 | desktop | - |
| CSHOT-036 | capture_screen_region 裁剪失败 | 异常场景 | P1 | desktop | 接口测试 |
| CSHOT-037 | 框选区域宽度 < 32 像素被拒绝 | 异常场景 | P1 | desktop | - |
| CSHOT-038 | 框选区域高度 < 32 像素被拒绝 | 异常场景 | P1 | desktop | - |
| CSHOT-039 | 框选区域宽高均 < 32 被拒绝 | 异常场景 | P1 | desktop | - |
| CSHOT-040 | 矩形宽度 < 4 像素被丢弃 | 异常场景 | P1 | desktop | - |
| CSHOT-041 | 矩形高度 < 4 像素被丢弃 | 异常场景 | P1 | desktop | - |
| CSHOT-042 | 文字 input 纯空格被丢弃 | 异常场景 | P1 | desktop | - |
| CSHOT-043 | 文字 input 空字符串被丢弃 | 异常场景 | P1 | desktop | - |
| CSHOT-044 | canvas.toDataURL 失败 | 异常场景 | P1 | desktop | - |
| CSHOT-045 | canvas.getContext('2d') 返回 null | 异常场景 | P1 | desktop | - |
| CSHOT-046 | baseImageSrc 无效导致 image.onload 不触发 | 异常场景 | P1 | desktop | - |
| CSHOT-047 | 120 秒内未完成框选自动取消 | 异常场景 | P1 | desktop | - |
| CSHOT-048 | 覆盖层关闭时 keydown 监听被移除 | 异常场景 | P1 | desktop | - |
| CSHOT-049 | 标注器关闭时 keydown 监听被移除 | 异常场景 | P1 | desktop | - |
| CSHOT-050 | 覆盖层卸载时 requestAnimationFrame 被取消 | 异常场景 | P1 | desktop | - |
| CSHOT-051 | pointerUp 丢失导致指针被锁定 | 异常场景 | P1 | desktop | - |
| CSHOT-052 | Rust 端返回 Error 对象 | 异常场景 | P1 | desktop | - |
| CSHOT-053 | Rust 端返回字符串错误 | 异常场景 | P1 | desktop | - |
| CSHOT-054 | Rust 端返回未知类型错误 | 异常场景 | P1 | desktop | - |
| CSHOT-055 | 选区宽度恰好 32 像素通过校验 | 边界值 | P1 | desktop | - |
| CSHOT-056 | 选区高度恰好 32 像素通过校验 | 边界值 | P1 | desktop | - |
| CSHOT-057 | 选区宽度 31 像素被拒绝 | 边界值 | P2 | desktop | - |
| CSHOT-058 | 选区高度 31 像素被拒绝 | 边界值 | P2 | desktop | - |
| CSHOT-059 | 选区宽度等于 display.width | 边界值 | P2 | desktop | - |
| CSHOT-060 | 选区高度等于 display.height | 边界值 | P2 | desktop | - |
| CSHOT-061 | 选区超出显示器边界被裁剪 | 边界值 | P2 | desktop | 接口测试 |
| CSHOT-062 | 矩形宽度恰好 4 像素计入 ops | 边界值 | P1 | desktop | - |
| CSHOT-063 | 矩形高度恰好 4 像素计入 ops | 边界值 | P1 | desktop | - |
| CSHOT-064 | 矩形宽度 3 像素被丢弃 | 边界值 | P2 | desktop | - |
| CSHOT-065 | 矩形高度 3 像素被丢弃 | 边界值 | P2 | desktop | - |
| CSHOT-066 | overlay 和 display 尺寸相同 | 边界值 | P2 | desktop | - |
| CSHOT-067 | overlay 是 display 的一半 | 边界值 | P2 | desktop | - |
| CSHOT-068 | overlay 是 display 的两倍（理论情况） | 边界值 | P2 | desktop | - |
| CSHOT-069 | overlay.width = 0 时避免除零 | 边界值 | P1 | desktop | - |
| CSHOT-070 | overlay.height = 0 时避免除零 | 边界值 | P1 | desktop | - |
| CSHOT-071 | 选区 y = 32 时 badge.top = 0 | 边界值 | P2 | desktop | - |
| CSHOT-072 | 选区 y = 31 时 badge.top = 12（最小值） | 边界值 | P2 | desktop | - |
| CSHOT-073 | 选区 y = 0 时 badge.top = 12 | 边界值 | P2 | desktop | - |
| CSHOT-074 | 119 秒内完成不触发超时 | 边界值 | P2 | desktop | - |
| CSHOT-075 | 120 秒未操作触发超时 | 边界值 | P2 | desktop | - |
| CSHOT-076 | 文字标注使用 fontSize=16 | 边界值 | P2 | desktop | - |
| CSHOT-077 | 输入 1000 字符的文字标注 | 边界值 | P2 | desktop | - |
| CSHOT-078 | strokeWidth=3 时箭头头部 size=9 | 边界值 | P2 | desktop | - |
| CSHOT-079 | strokeWidth=1 时箭头头部 size=8（最小值） | 边界值 | P2 | desktop | - |
| CSHOT-080 | 主显示器（isPrimary=true）捕获 | 兼容性 | P2 | desktop | 接口测试,兼容性测试 |
| CSHOT-081 | 副显示器（isPrimary=false）捕获 | 兼容性 | P2 | desktop | 接口测试,兼容性测试 |
| CSHOT-082 | 副显示器 x/y 偏移量正确映射 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-083 | 100% 缩放（scaleFactor=1.0） | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-084 | 125% 缩放（scaleFactor=1.25） | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-085 | 150% 缩放（scaleFactor=1.5） | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-086 | 200% 缩放（scaleFactor=2.0） | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-087 | macOS 下 Cmd+Z 撤销生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-088 | Windows 下 Ctrl+Z 撤销生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-089 | macOS 下 Cmd+Shift+Z 重做生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-090 | Windows 下 Ctrl+Shift+Z 重做生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-091 | 现代浏览器 getContext('2d') 成功 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-092 | 标注合成导出 PNG 成功 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-093 | 触摸屏设备 pointerDown/Move/Up 生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-094 | 鼠标设备 pointerDown/Move/Up 生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-095 | Escape 键在标注器和覆盖层均生效 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-096 | 右键菜单被阻止并触发取消 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-097 | 覆盖层成功挂载到 document.body | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-098 | SSR 环境下 document undefined 不报错 | 兼容性 | P2 | desktop | 兼容性测试 |
| CSHOT-099 | 4K 分辨率（3840x2160）截图标注合成 | 性能 | P1 | desktop | 性能测试 |
| CSHOT-100 | 8K 分辨率（7680x4320）截图标注合成 | 性能 | P2 | desktop | 性能测试 |
| CSHOT-101 | 快速拖拽时 requestAnimationFrame 防抖生效 | 性能 | P2 | desktop | 性能测试 |
| CSHOT-102 | 绘制 100 个标注后重绘性能 | 性能 | P1 | desktop | 性能测试 |
| CSHOT-103 | 绘制 500 个标注后重绘性能 | 性能 | P2 | desktop | 性能测试 |
| CSHOT-104 | 多次打开关闭覆盖层后内存稳定 | 性能 | P2 | desktop | 性能测试,性能测试 |
| CSHOT-105 | 多次打开关闭标注器后内存稳定 | 性能 | P2 | desktop | 性能测试,性能测试 |
| CSHOT-106 | 覆盖层快速打开关闭不遗留定时器 | 性能 | P2 | desktop | 性能测试 |
| CSHOT-107 | 文字标注包含 HTML 标签被转义 | 安全 | P1 | desktop | 安全测试 |
| CSHOT-108 | 文字标注包含特殊字符正常渲染 | 安全 | P1 | desktop | 安全测试 |
| CSHOT-109 | baseImageSrc 仅接受 data:image/png 格式 | 安全 | P1 | desktop | 安全测试 |
| CSHOT-110 | Rust 端错误消息本地化或泛化 | 安全 | P1 | desktop | 安全测试 |
| CSHOT-111 | icon key 包含 "../" 被阻止 | 安全 | P1 | desktop | 安全测试 |
| CSHOT-112 | 多个截图会话串行执行不互相干扰 | 安全 | P1 | desktop | 安全测试,并发测试 |
| CSHOT-113 | 截图 base64 不上传外部服务器 | 安全 | P1 | desktop | 安全测试 |

**统计**：总 113 个 | P0: 4 | P1: 65 | P2: 44
**维度**：正常场景 32 | 异常场景 22 | 边界值 25 | 兼容性 19 | 性能 8 | 安全 7

## 正常场景

### 截图会话启动

#### 会话准备与窗口控制

##### Tauri 环境下调用 prepare 成功启动截图会话
###### 前置条件
- 应用运行在 Tauri 桌面环境
- 无其他截图会话正在进行
###### 测试步骤
1. 调用 runComposerScreenshotSession
2. 观察 Tauri invoke 'prepare_composer_screenshot_capture' 调用
3. 观察窗口是否最小化
###### 预期结果
- prepare 成功返回 display 信息和 background base64
- 应用窗口最小化，显示覆盖层
- 会话进入 capturing 状态

##### 截图会话完成后窗口恢复
###### 前置条件
- 截图会话已启动并完成（确认或取消）
###### 测试步骤
1. 完成截图标注并确认，或按 Esc 取消
2. 观察 finalize 调用
###### 预期结果
- Tauri invoke 'finalize_composer_screenshot_capture' 调用，restore=true
- 应用窗口恢复到前台
- 会话状态回到 idle

### 内联覆盖层交互

#### 区域框选

##### 从左上到右下拖拽框选有效区域
###### 前置条件
- 截图覆盖层已打开，背景图已加载
###### 测试步骤
1. 在覆盖层上 pointerDown（左上角）
2. 拖拽到右下角，pointerMove 触发多次
3. pointerUp 释放鼠标
###### 预期结果
- 拖拽中实时显示选区边框和尺寸 badge
- 四块 mask（top/bottom/left/right）正确定位
- 尺寸 badge 显示 "宽度 x 高度"

##### 从右下到左上反向拖拽框选
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 从右下角 pointerDown
2. 拖拽到左上角
3. pointerUp
###### 预期结果
- normalizeDragRect 归一化坐标，选区正确显示
- 边框和 mask 定位正确，无负宽高

##### 框选区域尺寸 >= 32x32 像素通过校验
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 拖拽框选一个 32x32 像素的区域
2. 释放鼠标
###### 预期结果
- isValidRegionSize 返回 true
- 触发裁剪，显示"处理中..."
- 成功捕获区域并进入标注器

#### 覆盖层 UI 反馈

##### 选区尺寸 badge 在上方 32px 处显示
###### 前置条件
- 拖拽框选中，选区 y >= 32
###### 测试步骤
1. 在屏幕中部拖拽框选
2. 观察 badge 位置
###### 预期结果
- badge.style.top = `${y - 32}px`
- badge 显示 "{width} x {height}"

##### 选区靠近顶部时 badge 不超出屏幕
###### 前置条件
- 拖拽框选，选区 y < 32
###### 测试步骤
1. 在屏幕顶部（y=10）拖拽框选
2. 观察 badge 位置
###### 预期结果
- badge.style.top = `${Math.max(12, y - 32)}px`
- badge 不被裁剪，可见

##### 未框选时显示半透明提示与蒙层
###### 前置条件
- 截图覆盖层已打开，未开始拖拽
###### 测试步骤
1. 观察覆盖层 UI
###### 预期结果
- dim 层 display: block
- 提示文字"拖拽框选区域，Esc 或右键取消"可见
- mask 和 border 为 display: none

### 标注器交互

#### 工具选择与标注绘制

##### 选择矩形工具并绘制矩形标注
###### 前置条件
- 标注器已打开，默认工具为 arrow
###### 测试步骤
1. 点击矩形工具按钮
2. 在画布上拖拽绘制矩形
3. 释放鼠标
###### 预期结果
- tool 状态切换为 'rect'
- 矩形工具按钮 data-active="true"
- 画布上绘制矩形，strokeWidth=2, fillAlpha=0.15
- 矩形计入 state.ops

##### 选择箭头工具并绘制箭头标注
###### 前置条件
- 标注器已打开
###### 测试步骤
1. 确认箭头工具已选中（默认）
2. 拖拽绘制箭头
3. 释放鼠标
###### 预期结果
- 箭头从起点到终点绘制，strokeWidth=3
- 箭头头部 size = strokeWidth * 3 = 9
- 箭头计入 state.ops

##### 选择文字工具并输入文字标注
###### 前置条件
- 标注器已打开
###### 测试步骤
1. 点击文字工具按钮
2. 点击画布某位置
3. 在弹出的 input 中输入"测试文字"
4. 按 Enter 确认
###### 预期结果
- pendingText 状态创建，input 自动聚焦
- input 位置 left=点击x, top=点击y
- 按 Enter 后 input 消失，文字标注计入 ops，fontSize=16

##### 文字标注 input 失焦时自动确认
###### 前置条件
- 文字工具已选中，input 已弹出并输入内容
###### 测试步骤
1. 点击画布其他区域（触发 input blur）
###### 预期结果
- handleConfirmText 触发
- 文字标注计入 ops
- input 消失

#### 颜色选择

##### 切换标注颜色为红色（#E53935）
###### 前置条件
- 标注器已打开，默认颜色为红色
###### 测试步骤
1. 确认红色按钮 data-active="true"
2. 绘制一个标注
###### 预期结果
- 标注 color 为 '#E53935'

##### 切换标注颜色为黄色（#F9A825）
###### 前置条件
- 标注器已打开
###### 测试步骤
1. 点击黄色按钮
2. 绘制一个标注
###### 预期结果
- color 状态切换为 '#F9A825'
- 黄色按钮 data-active="true"，其他颜色 false
- 新标注使用黄色

##### 切换标注颜色为蓝色（#1E88E5）
###### 前置条件
- 标注器已打开
###### 测试步骤
1. 点击蓝色按钮
2. 绘制一个标注
###### 预期结果
- color 状态切换为 '#1E88E5'
- 新标注使用蓝色

#### 撤销与重做

##### 绘制标注后撤销（Cmd+Z）
###### 前置条件
- 标注器已打开，已绘制至少 1 个标注
###### 测试步骤
1. 按 Cmd+Z（Mac）或 Ctrl+Z（Windows）
###### 预期结果
- 最后一个标注从画布消失
- state.ops 移除最后一项
- undoStack 弹出，redoStack 压入

##### 撤销后重做（Cmd+Shift+Z）
###### 前置条件
- 已撤销至少 1 次
###### 测试步骤
1. 按 Cmd+Shift+Z（Mac）或 Ctrl+Shift+Z（Windows）
###### 预期结果
- 刚撤销的标注重新出现
- state.ops 恢复
- redoStack 弹出，undoStack 压入

##### 撤销按钮点击生效
###### 前置条件
- 标注器已打开，已绘制标注
###### 测试步骤
1. 点击工具栏撤销按钮（IconUndo）
###### 预期结果
- 与快捷键效果一致，最后标注被撤销

##### 重做按钮点击生效
###### 前置条件
- 已撤销至少 1 次
###### 测试步骤
1. 点击工具栏重做按钮（IconRedo）
###### 预期结果
- 与快捷键效果一致，标注恢复

#### 标注确认与导出

##### 完成标注并点击确认按钮
###### 前置条件
- 标注器已打开，已绘制标注
###### 测试步骤
1. 点击工具栏确认按钮（IconConfirm）
2. 观察 flattenScreenshotAnnotations 调用
###### 预期结果
- busy 状态置为 true，所有按钮禁用
- canvas.toDataURL('image/png') 成功
- onConfirm 回调触发，传递 { dataUrl, mimeType: 'image/png' }
- busy 恢复 false

##### 无标注直接确认
###### 前置条件
- 标注器已打开，state.ops 为空
###### 测试步骤
1. 点击确认按钮
###### 预期结果
- 合成原始图片（无标注层）
- 导出成功

#### 取消操作

##### 标注器内按 Esc 取消
###### 前置条件
- 标注器已打开，未在文字输入状态
###### 测试步骤
1. 按 Escape 键
###### 预期结果
- onCancel 回调触发
- 标注器关闭
- 会话进入 finalizing

##### 覆盖层内按 Esc 取消
###### 前置条件
- 内联覆盖层已打开
###### 测试步骤
1. 按 Escape 键
###### 预期结果
- onCancel 触发，onLog 记录 'inline overlay cancel escape'
- 覆盖层关闭
- 会话 finalize

##### 覆盖层内右键取消
###### 前置条件
- 内联覆盖层已打开
###### 测试步骤
1. 在覆盖层上右键点击（触发 contextmenu）
###### 预期结果
- contextmenu 默认行为阻止
- onCancel 触发，onLog 记录 'inline overlay cancel contextmenu'
- 覆盖层关闭

##### 标注器点击取消按钮
###### 前置条件
- 标注器已打开
###### 测试步骤
1. 点击工具栏取消按钮（IconClose）
###### 预期结果
- onCancel 触发
- 标注器关闭

### 坐标计算与映射

#### 覆盖层坐标到图像坐标映射

##### 覆盖层与显示器尺寸一致时映射无缩放
###### 前置条件
- display.width = window.innerWidth, display.height = window.innerHeight
###### 测试步骤
1. 框选区域 x=100, y=100, width=200, height=150
2. 触发裁剪
###### 预期结果
- scaleX = 1.0, scaleY = 1.0
- imageRect = { x: 100, y: 100, width: 200, height: 150 }

##### 覆盖层小于显示器时放大映射
###### 前置条件
- display.width = 2560, window.innerWidth = 1280（缩小 50%）
###### 测试步骤
1. 框选区域 x=100, y=100, width=200, height=150
2. 计算 mapOverlayRectToImageRect
###### 预期结果
- scaleX = 2.0, scaleY = 2.0
- imageRect = { x: 200, y: 200, width: 400, height: 300 }

#### 标注画布坐标到物理像素映射

##### Canvas 物理尺寸与 DOM 尺寸一致
###### 前置条件
- canvas.width = 800, rect.width = 800
###### 测试步骤
1. 在 DOM clientX=400 处点击
2. 计算 canvasPoint
###### 预期结果
- scaleX = 1.0
- canvas x = 400

##### Canvas 物理尺寸大于 DOM（高 DPI）
###### 前置条件
- canvas.width = 1600, rect.width = 800（2x DPI）
###### 测试步骤
1. 在 DOM clientX=400 处点击
2. 计算 canvasPoint
###### 预期结果
- scaleX = 2.0
- canvas x = 800

### 截图文件名生成

#### 时间戳格式化

##### 当前时间生成文件名
###### 前置条件
- 当前时间 2026-07-08 14:35:20
###### 测试步骤
1. 调用 formatScreenshotTimestamp()
###### 预期结果
- 返回 "20260708-143520"

##### 文件名拼接完整
###### 前置条件
- 截图捕获成功
###### 测试步骤
1. 调用 createComposerScreenshotLabel()
###### 预期结果
- 返回 "screenshot-YYYYMMDD-HHmmss.png"

### 附件菜单图标显示

#### 图标资源解析

##### 传入有效 icon key 渲染图标
###### 前置条件
- icon='camera'（假设为有效 key）
###### 测试步骤
1. 渲染 ComposerAttachMenuIcon 组件
###### 预期结果
- resolveComposerAttachMenuIconUrl 返回 URL
- img src 正确设置
- img draggable=false

## 异常场景

### 会话准备失败

#### Tauri 环境检测

##### 非 Tauri 环境下调用截图返回 null
###### 前置条件
- 应用运行在浏览器环境（非 Tauri）
###### 测试步骤
1. 调用 runComposerScreenshotSession
2. 观察返回值
###### 预期结果
- isTauriRuntime() 返回 false
- runComposerScreenshotSession 立即返回 null
- 显示"请在桌面客户端使用截图上传"提示

#### 会话并发冲突

##### 截图进行中重复调用被拦截
###### 前置条件
- 已启动一个截图会话，处于 capturing 状态
###### 测试步骤
1. 再次调用 runComposerScreenshotSession
###### 预期结果
- active 标志为 true
- 抛出异常 "截屏进行中"
- 第二次调用不触发 prepare

#### Tauri invoke 失败

##### prepare_composer_screenshot_capture 调用失败
###### 前置条件
- Tauri 后端服务异常或权限不足
###### 测试步骤
1. 调用 runComposerScreenshotSession
2. Tauri invoke 返回错误
###### 预期结果
- prepare 失败，active 标志恢复 false
- finalize 仍被调用（finally 块）
- 会话返回 null

##### capture_screen_region 裁剪失败
###### 前置条件
- 框选完成，调用 Tauri 裁剪接口
###### 测试步骤
1. Tauri 后端裁剪失败（磁盘满/权限不足）
###### 预期结果
- cropBackgroundViaCachedRegion catch 错误
- onLog 记录 'inline overlay submit error'
- onCancel 触发，覆盖层关闭

### 选区校验失败

#### 选区尺寸过小

##### 框选区域宽度 < 32 像素被拒绝
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 拖拽框选宽度 31px，高度 50px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize 返回 false
- currentRectRef.current 置 null
- paintSelection(null) 清空选区
- onLog 记录 'inline overlay selection too small'

##### 框选区域高度 < 32 像素被拒绝
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 拖拽框选宽度 50px，高度 31px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize 返回 false
- 选区不触发裁剪

##### 框选区域宽高均 < 32 被拒绝
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 拖拽框选 20x20 区域
2. pointerUp 释放
###### 预期结果
- isValidRegionSize 返回 false
- hasSelection 恢复 false

### 标注操作异常

#### 矩形标注过滤

##### 矩形宽度 < 4 像素被丢弃
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制宽度 3px 的矩形
2. pointerUp 释放
###### 预期结果
- draftRect 被丢弃，不计入 ops
- dragStartRef.current 置 null

##### 矩形高度 < 4 像素被丢弃
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制高度 3px 的矩形
2. pointerUp 释放
###### 预期结果
- draftRect 被丢弃

#### 文字标注过滤

##### 文字 input 纯空格被丢弃
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 点击画布弹出 input
2. 输入"   "（多个空格）
3. 按 Enter 或 blur
###### 预期结果
- pendingText.value.trim() 为空
- handleConfirmText 不计入 ops
- setPendingText(null) 关闭 input

##### 文字 input 空字符串被丢弃
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 点击画布弹出 input
2. 不输入任何内容
3. 按 Enter
###### 预期结果
- pendingText.value.trim() 为空
- 不计入 ops

#### 标注合成失败

##### canvas.toDataURL 失败
###### 前置条件
- 标注器已打开，已绘制标注
- Canvas context 异常（内存不足等）
###### 测试步骤
1. 点击确认按钮
2. flattenScreenshotAnnotations 内部 toDataURL 抛异常
###### 预期结果
- handleConfirm finally 块执行，busy 恢复 false
- 用户看到按钮重新可点击，但无错误提示

##### canvas.getContext('2d') 返回 null
###### 前置条件
- 浏览器环境不支持 2D canvas（极端情况）
###### 测试步骤
1. 调用 flattenScreenshotAnnotations
2. ctx = canvas.getContext('2d') 返回 null
###### 预期结果
- Promise reject，错误消息 'canvas context unavailable'

#### 背景图加载失败

##### baseImageSrc 无效导致 image.onload 不触发
###### 前置条件
- 标注器打开，baseImageSrc 格式错误或数据损坏
###### 测试步骤
1. 等待 image.onload
###### 预期结果
- onload 永不触发，imageRef.current 保持 null
- 标注器 canvas 无法渲染，无超时兜底

### 事件监听异常

#### 超时自动取消

##### 120 秒内未完成框选自动取消
###### 前置条件
- 截图会话已启动，覆盖层显示
###### 测试步骤
1. 等待 120 秒不操作
###### 预期结果
- setTimeout 触发
- invoke('cancel_composer_screenshot_capture')
- waitForComposerScreenshotCaptureEvent 返回 null

#### 事件监听清理

##### 覆盖层关闭时 keydown 监听被移除
###### 前置条件
- 覆盖层已打开，keydown 监听已注册
###### 测试步骤
1. 覆盖层 open 置 false（组件卸载或关闭）
2. 按 Escape 键
###### 预期结果
- useEffect cleanup 执行
- window.removeEventListener('keydown') 调用
- Escape 不再触发 onCancel

##### 标注器关闭时 keydown 监听被移除
###### 前置条件
- 标注器已打开，快捷键监听已注册
###### 测试步骤
1. 标注器 open 置 false
2. 按 Cmd+Z
###### 预期结果
- cleanup 执行，监听移除
- 快捷键无响应

##### 覆盖层卸载时 requestAnimationFrame 被取消
###### 前置条件
- 覆盖层已打开，pendingFrameRef 有待执行帧
###### 测试步骤
1. 组件卸载（open 置 false）
###### 预期结果
- useEffect cleanup 执行
- cancelAnimationFrame(pendingFrameRef.current)
- 不再触发 paintSelection

### 指针捕获异常

#### 指针捕获释放失败

##### pointerUp 丢失导致指针被锁定
###### 前置条件
- 覆盖层拖拽中，setPointerCapture 已调用
- 窗口失焦或切换应用
###### 测试步骤
1. 拖拽中按 Cmd+Tab 切换应用
2. 返回应用
###### 预期结果
- pointerUp 未触发
- releasePointerCapture 未调用
- 鼠标移动仍触发 pointerMove（指针被锁）

### 错误消息处理

#### Tauri 错误消息归一化

##### Rust 端返回 Error 对象
###### 前置条件
- Tauri invoke 失败，返回 Error
###### 测试步骤
1. normalizeErrorMessage(error) 处理
###### 预期结果
- 返回 error.message 字符串

##### Rust 端返回字符串错误
###### 前置条件
- Tauri invoke 返回 string 类型错误
###### 测试步骤
1. normalizeErrorMessage(error) 处理
###### 预期结果
- 直接返回该字符串

##### Rust 端返回未知类型错误
###### 前置条件
- Tauri invoke 返回数字、对象等非预期类型
###### 测试步骤
1. normalizeErrorMessage(error) 处理
###### 预期结果
- String(error) 转换为字符串

## 边界值

### 选区尺寸边界

#### 最小尺寸 32 像素

##### 选区宽度恰好 32 像素通过校验
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 框选宽度 32px，高度 50px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize(32, 50) 返回 true
- 触发裁剪

##### 选区高度恰好 32 像素通过校验
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 框选宽度 50px，高度 32px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize(50, 32) 返回 true
- 触发裁剪

##### 选区宽度 31 像素被拒绝
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 框选宽度 31px，高度 50px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize(31, 50) 返回 false
- 选区被清空

##### 选区高度 31 像素被拒绝
###### 前置条件
- 截图覆盖层已打开
###### 测试步骤
1. 框选宽度 50px，高度 31px
2. pointerUp 释放
###### 预期结果
- isValidRegionSize(50, 31) 返回 false
- 选区被清空

#### 最大尺寸为显示器边界

##### 选区宽度等于 display.width
###### 前置条件
- 截图覆盖层已打开，display.width = 1920
###### 测试步骤
1. 框选全宽 1920px
2. pointerUp 释放
###### 预期结果
- clampSelectionToDisplay 不截断
- imageRect.width = display.width

##### 选区高度等于 display.height
###### 前置条件
- 截图覆盖层已打开，display.height = 1080
###### 测试步骤
1. 框选全高 1080px
2. pointerUp 释放
###### 预期结果
- clampSelectionToDisplay 不截断
- imageRect.height = display.height

##### 选区超出显示器边界被裁剪
###### 前置条件
- 截图覆盖层已打开，display = 1920x1080
###### 测试步骤
1. 拖拽起点 x=1900，终点 x=2000（超出 1920）
2. pointerUp 释放
###### 预期结果
- clampSelectionToDisplay 裁剪 width
- 最终 width = 1920 - 1900 = 20

### 矩形标注尺寸边界

#### 最小尺寸 4 像素

##### 矩形宽度恰好 4 像素计入 ops
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制宽度 4px，高度 20px
2. pointerUp 释放
###### 预期结果
- draftRect.width = 4, height = 20
- commitDraft 调用，计入 state.ops

##### 矩形高度恰好 4 像素计入 ops
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制宽度 20px，高度 4px
2. pointerUp 释放
###### 预期结果
- draftRect.height = 4
- 计入 state.ops

##### 矩形宽度 3 像素被丢弃
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制宽度 3px，高度 20px
2. pointerUp 释放
###### 预期结果
- width < 4 判断为 true
- setDraftRect(null)，不计入 ops

##### 矩形高度 3 像素被丢弃
###### 前置条件
- 标注器已打开，矩形工具已选
###### 测试步骤
1. 拖拽绘制宽度 20px，高度 3px
2. pointerUp 释放
###### 预期结果
- height < 4 判断为 true
- 不计入 ops

### 坐标映射缩放比例边界

#### 缩放比例 1.0（无缩放）

##### overlay 和 display 尺寸相同
###### 前置条件
- display = 1920x1080, window.innerWidth = 1920, innerHeight = 1080
###### 测试步骤
1. 框选 x=100, y=100, width=200, height=150
2. 计算 mapOverlayRectToImageRect
###### 预期结果
- scaleX = 1920/1920 = 1.0, scaleY = 1080/1080 = 1.0
- imageRect = { x: 100, y: 100, width: 200, height: 150 }

#### 缩放比例 2.0

##### overlay 是 display 的一半
###### 前置条件
- display = 2560x1440, window.innerWidth = 1280, innerHeight = 720
###### 测试步骤
1. 框选 x=100, y=100, width=200, height=150
2. 计算 mapOverlayRectToImageRect
###### 预期结果
- scaleX = 2560/1280 = 2.0, scaleY = 1440/720 = 2.0
- imageRect = { x: 200, y: 200, width: 400, height: 300 }

#### 缩放比例 0.5

##### overlay 是 display 的两倍（理论情况）
###### 前置条件
- display = 1280x720, window.innerWidth = 2560, innerHeight = 1440
###### 测试步骤
1. 框选 x=200, y=200, width=400, height=300
2. 计算 mapOverlayRectToImageRect
###### 预期结果
- scaleX = 1280/2560 = 0.5, scaleY = 720/1440 = 0.5
- imageRect = { x: 100, y: 100, width: 200, height: 150 }

#### 除数为 0 保护

##### overlay.width = 0 时避免除零
###### 前置条件
- overlay.width = 0（异常情况）
###### 测试步骤
1. 计算 scaleX = image.width / Math.max(1, overlay.width)
###### 预期结果
- Math.max(1, 0) = 1
- scaleX = image.width / 1
- 不抛异常

##### overlay.height = 0 时避免除零
###### 前置条件
- overlay.height = 0（异常情况）
###### 测试步骤
1. 计算 scaleY = image.height / Math.max(1, overlay.height)
###### 预期结果
- Math.max(1, 0) = 1
- scaleY = image.height / 1
- 不抛异常

### badge 定位边界

#### badge 上方 32px 边界

##### 选区 y = 32 时 badge.top = 0
###### 前置条件
- 拖拽框选，选区 y = 32
###### 测试步骤
1. 观察 badge 位置计算
###### 预期结果
- badge.style.top = `${32 - 32}px` = "0px"

##### 选区 y = 31 时 badge.top = 12（最小值）
###### 前置条件
- 拖拽框选，选区 y = 31
###### 测试步骤
1. 观察 badge 位置计算
###### 预期结果
- badge.style.top = `${Math.max(12, 31 - 32)}px` = "12px"

##### 选区 y = 0 时 badge.top = 12
###### 前置条件
- 拖拽框选，选区 y = 0（贴顶）
###### 测试步骤
1. 观察 badge 位置计算
###### 预期结果
- badge.style.top = `${Math.max(12, 0 - 32)}px` = "12px"

### 超时时间边界

#### 120 秒超时边界

##### 119 秒内完成不触发超时
###### 前置条件
- 截图会话已启动
###### 测试步骤
1. 等待 119 秒后完成框选
###### 预期结果
- setTimeout 未触发
- 正常完成捕获

##### 120 秒未操作触发超时
###### 前置条件
- 截图会话已启动
###### 测试步骤
1. 等待 120 秒
###### 预期结果
- setTimeout 触发
- invoke('cancel_composer_screenshot_capture')
- waitForComposerScreenshotCaptureEvent 返回 null

### 文字标注边界

#### fontSize 固定 16

##### 文字标注使用 fontSize=16
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 输入文字确认
###### 预期结果
- AnnotationOp text 的 fontSize = 16

#### 文字长度无上限

##### 输入 1000 字符的文字标注
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 输入 1000 字符长文本
2. 确认
###### 预期结果
- 文字计入 ops，无长度截断
- 渲染可能超出画布边界

### 箭头标注边界

#### 箭头头部尺寸计算

##### strokeWidth=3 时箭头头部 size=9
###### 前置条件
- 标注器已打开，箭头工具已选
###### 测试步骤
1. 绘制箭头标注
2. 观察 drawArrowHead size 参数
###### 预期结果
- size = Math.max(8, 3 * 3) = 9

##### strokeWidth=1 时箭头头部 size=8（最小值）
###### 前置条件
- 标注器已打开，假设修改 strokeWidth=1
###### 测试步骤
1. 绘制箭头
2. 观察 drawArrowHead size 参数
###### 预期结果
- size = Math.max(8, 1 * 3) = 8

## 兼容性

### 多显示器环境

#### 显示器识别

##### 主显示器（isPrimary=true）捕获
###### 前置条件
- 系统连接多个显示器，主显示器标记为 primary
###### 测试步骤
1. 在主显示器上触发截图
2. 观察 display.isPrimary 字段
###### 预期结果
- display.isPrimary = true
- displayId 正确识别主显示器

##### 副显示器（isPrimary=false）捕获
###### 前置条件
- 系统连接多个显示器
###### 测试步骤
1. 在副显示器上触发截图
2. 观察 display.isPrimary 字段
###### 预期结果
- display.isPrimary = false
- displayId 正确识别当前显示器

#### 显示器坐标偏移

##### 副显示器 x/y 偏移量正确映射
###### 前置条件
- 主显示器 1920x1080，副显示器位于右侧 x=1920
###### 测试步骤
1. 在副显示器上截图
2. 观察 display.x, display.y
###### 预期结果
- display.x = 1920, display.y = 0
- 坐标映射正确

### 高 DPI 缩放

#### 不同缩放比例

##### 100% 缩放（scaleFactor=1.0）
###### 前置条件
- 系统显示缩放设置为 100%
###### 测试步骤
1. 触发截图
2. 观察 display.scaleFactor
###### 预期结果
- scaleFactor = 1.0
- 坐标映射无缩放

##### 125% 缩放（scaleFactor=1.25）
###### 前置条件
- 系统显示缩放设置为 125%
###### 测试步骤
1. 触发截图
2. 观察 display.scaleFactor
###### 预期结果
- scaleFactor = 1.25
- 坐标映射考虑缩放比例

##### 150% 缩放（scaleFactor=1.5）
###### 前置条件
- 系统显示缩放设置为 150%
###### 测试步骤
1. 触发截图
2. 观察 display.scaleFactor
###### 预期结果
- scaleFactor = 1.5
- 坐标映射正确

##### 200% 缩放（scaleFactor=2.0）
###### 前置条件
- 系统显示缩放设置为 200%（Retina）
###### 测试步骤
1. 触发截图
2. 观察 display.scaleFactor 和 canvas 坐标计算
###### 预期结果
- scaleFactor = 2.0
- canvasPoint scaleX/scaleY 正确计算物理像素

### 操作系统兼容性

#### 平台特定快捷键

##### macOS 下 Cmd+Z 撤销生效
###### 前置条件
- 应用运行在 macOS
- 标注器已打开，已绘制标注
###### 测试步骤
1. 按 Cmd+Z
###### 预期结果
- event.metaKey 为 true
- undoAnnotation 触发

##### Windows 下 Ctrl+Z 撤销生效
###### 前置条件
- 应用运行在 Windows
- 标注器已打开，已绘制标注
###### 测试步骤
1. 按 Ctrl+Z
###### 预期结果
- event.ctrlKey 为 true
- undoAnnotation 触发

##### macOS 下 Cmd+Shift+Z 重做生效
###### 前置条件
- 应用运行在 macOS，已撤销标注
###### 测试步骤
1. 按 Cmd+Shift+Z
###### 预期结果
- event.metaKey 和 event.shiftKey 为 true
- redoAnnotation 触发

##### Windows 下 Ctrl+Shift+Z 重做生效
###### 前置条件
- 应用运行在 Windows，已撤销标注
###### 测试步骤
1. 按 Ctrl+Shift+Z
###### 预期结果
- event.ctrlKey 和 event.shiftKey 为 true
- redoAnnotation 触发

### 浏览器 Canvas 兼容性

#### Canvas 2D context 可用性

##### 现代浏览器 getContext('2d') 成功
###### 前置条件
- Chrome/Edge/Firefox/Safari 最新版本
###### 测试步骤
1. 调用 canvas.getContext('2d')
###### 预期结果
- 返回 CanvasRenderingContext2D 对象
- 标注绘制正常

#### Canvas toDataURL 支持

##### 标注合成导出 PNG 成功
###### 前置条件
- 标注器已打开，已绘制标注
###### 测试步骤
1. 点击确认按钮
2. 调用 canvas.toDataURL('image/png')
###### 预期结果
- 返回 "data:image/png;base64,..." 格式 dataUrl
- onConfirm 接收到 { dataUrl, mimeType: 'image/png' }

### 事件监听兼容性

#### 指针事件支持

##### 触摸屏设备 pointerDown/Move/Up 生效
###### 前置条件
- 设备支持触摸（触摸屏 PC/平板）
###### 测试步骤
1. 用手指在覆盖层拖拽框选
###### 预期结果
- pointerDown/Move/Up 事件正确触发
- 选区正常显示

##### 鼠标设备 pointerDown/Move/Up 生效
###### 前置条件
- 传统鼠标输入
###### 测试步骤
1. 用鼠标在覆盖层拖拽框选
###### 预期结果
- pointerDown/Move/Up 事件正确触发
- 选区正常显示

#### 键盘事件兼容性

##### Escape 键在标注器和覆盖层均生效
###### 前置条件
- 标注器或覆盖层已打开
###### 测试步骤
1. 按 Escape 键
###### 预期结果
- keydown 事件触发
- event.key === 'Escape' 判断为 true
- 取消操作执行

#### contextmenu 事件阻止

##### 右键菜单被阻止并触发取消
###### 前置条件
- 覆盖层已打开
###### 测试步骤
1. 右键点击覆盖层
###### 预期结果
- event.preventDefault() 阻止默认菜单
- onCancel 触发

### React Portal 兼容性

#### document.body 可用性

##### 覆盖层成功挂载到 document.body
###### 前置条件
- 覆盖层 open=true
- document.body 存在
###### 测试步骤
1. 观察 DOM 树
###### 预期结果
- createPortal 将覆盖层挂载到 body
- 覆盖层全屏显示

##### SSR 环境下 document undefined 不报错
###### 前置条件
- 服务端渲染环境，document 未定义
###### 测试步骤
1. 覆盖层 open=true
2. 检查 typeof document === 'undefined'
###### 预期结果
- 组件返回 null
- 不抛异常

## 性能

### 大尺寸截图处理

#### 高分辨率截图合成

##### 4K 分辨率（3840x2160）截图标注合成
###### 前置条件
- 显示器分辨率 4K，截取全屏
- 已绘制多个标注
###### 测试步骤
1. 点击确认按钮
2. 观察 flattenScreenshotAnnotations 耗时
###### 预期结果
- canvas.toDataURL 在 2 秒内完成
- 内存占用不超过 200MB
- 导出成功

##### 8K 分辨率（7680x4320）截图标注合成
###### 前置条件
- 截取 8K 分辨率图片（极端情况）
- 已绘制标注
###### 测试步骤
1. 点击确认按钮
2. 观察耗时和内存
###### 预期结果
- 合成在 5 秒内完成或给出超时提示
- 浏览器不崩溃

### 标注操作性能

#### 高频 pointerMove 事件处理

##### 快速拖拽时 requestAnimationFrame 防抖生效
###### 前置条件
- 覆盖层已打开
###### 测试步骤
1. 快速拖拽鼠标（触发 100+ pointerMove/秒）
2. 观察 scheduleFrame 调用
###### 预期结果
- pendingFrameRef 防止重复 requestAnimationFrame
- 每帧最多渲染 1 次
- CPU 占用低于 30%

#### 大量标注绘制性能

##### 绘制 100 个标注后重绘性能
###### 前置条件
- 标注器已打开，已绘制 100 个矩形/箭头/文字
###### 测试步骤
1. 继续绘制新标注
2. 观察 repaint 耗时
###### 预期结果
- drawAnnotationOps 遍历 100 个 ops
- 重绘在 50ms 内完成
- 无明显卡顿

##### 绘制 500 个标注后重绘性能
###### 前置条件
- 标注器已打开，已绘制 500 个标注（极端压测）
###### 测试步骤
1. 继续绘制新标注
2. 观察 repaint 耗时
###### 预期结果
- 重绘在 200ms 内完成或有性能提示
- 浏览器不崩溃

### 内存泄漏防护

#### 事件监听清理验证

##### 多次打开关闭覆盖层后内存稳定
###### 前置条件
- 初始内存基线已测量
###### 测试步骤
1. 打开/关闭覆盖层 50 次
2. 观察内存占用
###### 预期结果
- unlisten 正确执行
- 内存增长 < 10MB
- 无明显泄漏

##### 多次打开关闭标注器后内存稳定
###### 前置条件
- 初始内存基线已测量
###### 测试步骤
1. 打开/关闭标注器 50 次
2. 观察内存占用
###### 预期结果
- keydown 监听正确移除
- imageRef/canvasRef 正确释放
- 内存增长 < 10MB

#### requestAnimationFrame 取消验证

##### 覆盖层快速打开关闭不遗留定时器
###### 前置条件
- 覆盖层打开并拖拽中
###### 测试步骤
1. 拖拽时立即关闭覆盖层
2. 检查 pendingFrameRef
###### 预期结果
- cleanup 中 cancelAnimationFrame 执行
- 不再触发 paintSelection

## 安全

### 输入注入防护

#### 文字标注注入

##### 文字标注包含 HTML 标签被转义
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 输入 "<script>alert(1)</script>"
2. 确认并导出
###### 预期结果
- Canvas fillText 自动转义
- 导出图片中为纯文本，无脚本执行

##### 文字标注包含特殊字符正常渲染
###### 前置条件
- 标注器已打开，文字工具已选
###### 测试步骤
1. 输入 "& < > \" ' \n"
2. 确认
###### 预期结果
- Canvas fillText 正常渲染
- 无注入风险

#### base64 图片来源校验

##### baseImageSrc 仅接受 data:image/png 格式
###### 前置条件
- 标注器打开前准备 baseImageSrc
###### 测试步骤
1. 传入非 data:image/png 的 URL（如外部 http URL）
2. 观察 image.onload
###### 预期结果
- 浏览器 CSP 或同源策略阻止加载
- 或仅接受 data: scheme

### 错误信息安全

#### Tauri 错误消息不泄露堆栈

##### Rust 端错误消息本地化或泛化
###### 前置条件
- Tauri invoke 失败
###### 测试步骤
1. 观察 normalizeErrorMessage 返回值
###### 预期结果
- 不包含 Rust backtrace 或文件路径
- 错误消息泛化（如"截图失败，请重试"）

### 资源访问控制

#### 附件菜单图标路径遍历防护

##### icon key 包含 "../" 被阻止
###### 前置条件
- 渲染 ComposerAttachMenuIcon
###### 测试步骤
1. 传入 icon="../../etc/passwd"
2. 观察 resolveComposerAttachMenuIconUrl
###### 预期结果
- URL 解析失败或返回默认图标
- 不访问非预期路径

### 会话劫持防护

#### 会话状态隔离

##### 多个截图会话串行执行不互相干扰
###### 前置条件
- 第一个会话进行中
###### 测试步骤
1. 尝试启动第二个会话
###### 预期结果
- active 标志阻止并发
- 抛出"截屏进行中"异常
- 第一个会话继续正常执行

### 数据泄露防护

#### 截图内容仅本地处理

##### 截图 base64 不上传外部服务器
###### 前置条件
- 完整截图流程
###### 测试步骤
1. 监控网络请求
###### 预期结果
- 无 HTTP/HTTPS 请求发送截图数据
- base64 仅在本地内存和 Tauri IPC 中传输
