# Tests 层

测试层仅调用 Service 层，只写断言。

## 示例

```typescript
import { describe, it, expect } from 'vitest';
import { usePlaywrightWithAuth } from '../../fixtures/playwright.fixture';
import { AuthService } from '../../services/AuthService';

describe('登录功能', () => {
  it('用户可以成功登录', async () => {
    const { page } = await usePlaywrightWithAuth();
    const authService = new AuthService(page);
    
    await authService.login('testuser', 'password123');
    
    // 断言
    expect(page.url()).toContain('/dashboard');
  });
});
```

使用 `/ui-automation` skill 自动生成测试代码。
