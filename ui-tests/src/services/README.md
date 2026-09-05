# Services 层

服务层负责封装跨页面的业务流程。

## 示例

```typescript
import { Page } from '@playwright/test';
import { BaseService } from './BaseService';
import { LoginPage } from '../pages/LoginPage';

export class AuthService extends BaseService {
  private loginPage: LoginPage;

  constructor(page: Page) {
    super(page);
    this.loginPage = new LoginPage(page);
  }

  async login(username: string, password: string) {
    await this.loginPage.goto('/login');
    await this.loginPage.login(username, password);
    // 验证登录成功...
  }
}
```

查看 `.claude/skills/ui-automation/` 了解完整的四层架构规范。
