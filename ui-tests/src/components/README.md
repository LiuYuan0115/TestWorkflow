# Components 层

组件层负责封装可复用的 UI 控件原子操作。

## 示例

```typescript
import { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class ButtonComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async clickByText(text: string) {
    await this.withFallback({
      label: `点击按钮: ${text}`,
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiTap(`包含文字"${text}"的按钮`);
      },
      aiOnly: true,
    });
  }
}
```

查看 `.claude/skills/ui-automation/` 了解完整的四层架构规范。
