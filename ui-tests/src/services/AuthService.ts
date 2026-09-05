import { BaseService } from "./BaseService";
import { LoginPage } from "../pages/LoginPage";

export interface LoginResult {
  success: boolean;
  errorMessage?: string;
}

/**
 * 认证服务：封装登录/登出相关流程
 */
export class AuthService extends BaseService {
  private loginPage = new LoginPage(this.page);

  /**
   * 使用用户名和密码登录
   */
  async login(username: string, password: string): Promise<LoginResult> {
    await this.step("导航到登录页", async () => {
      await this.loginPage.goto();
    });

    await this.step(`填写用户名: ${username}`, async () => {
      await this.loginPage.fillUsername(username);
    });

    await this.step("填写密码", async () => {
      await this.loginPage.fillPassword(password);
    });

    await this.step("点击登录", async () => {
      await this.loginPage.clickSubmit();
    });

    const success = await this.step("检查登录结果", async () => {
      return await this.loginPage.isLoginSuccess();
    });

    if (!success) {
      const errorMessage = await this.loginPage.getErrorMessage();
      return { success: false, errorMessage };
    }

    return { success: true };
  }

  /**
   * 检查是否处于已登录状态
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.step("检查登录状态", async () => {
      return await this.getAgent().aiBoolean(
        "页面上是否存在用户头像或用户名（表示已登录状态）"
      );
    });
  }
}
