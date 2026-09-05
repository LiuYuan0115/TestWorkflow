# Pages 层

页面层负责封装单个页面的操作。

## 示例

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string) {
    await this.withFallback({
      label: "输入用户名",
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiInput(username, "用户名输入框");
      },
      aiOnly: true,
    });
    
    // 更多操作...
  }
}
```

查看 `.claude/skills/ui-automation/` 了解完整的四层架构规范。
