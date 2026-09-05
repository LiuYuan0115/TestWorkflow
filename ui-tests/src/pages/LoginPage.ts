import { BasePage } from "./BasePage";
import { LOGIN_URL } from "../config";

/**
 * 登录页
 */
export class LoginPage extends BasePage {
  readonly url = LOGIN_URL;

  /**
   * 填写用户名/邮箱
   * AI-Only（首次实现）
   */
  async fillUsername(username: string) {
    await this.withFallback({
      label: `fillUsername("${username}")`,
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiInput("登录表单中的用户名或邮箱输入框", { value: username });
      },
      aiOnly: true,
    });
  }

  /**
   * 填写密码
   * AI-Only（首次实现）
   */
  async fillPassword(password: string) {
    await this.withFallback({
      label: "fillPassword()",
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiInput("登录表单中的密码输入框", { value: password });
      },
      aiOnly: true,
    });
  }

  /**
   * 点击登录按钮
   * AI-Only（首次实现）
   */
  async clickSubmit() {
    await this.withFallback({
      label: "clickSubmit()",
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiTap("登录表单底部的「登录」提交按钮");
      },
      aiOnly: true,
    });
    await this.wait(1500);
  }

  /**
   * 判断登录是否成功（URL 不再包含 login）
   */
  async isLoginSuccess(): Promise<boolean> {
    await this.wait(1000);
    const currentUrl = this.page.url();
    return !currentUrl.includes("/login");
  }

  /**
   * 获取登录错误提示文字
   */
  async getErrorMessage(): Promise<string> {
    const result = await this.getAgent().aiQuery<{ error: string }>(
      "提取页面上显示的登录错误提示文字，如果没有错误则返回空字符串，返回 { error: string }"
    );
    return result.error;
  }
}
