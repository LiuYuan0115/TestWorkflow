import { BaseService } from "./BaseService";
import { ChatComposerPage } from "../pages/ChatComposerPage";

export interface SendMessageResult {
  success: boolean;
  response?: string;
}

/**
 * 对话服务：封装 Chat Composer 业务流程
 */
export class ChatService extends BaseService {
  private chatPage = new ChatComposerPage(this.page);

  /**
   * 发送消息并等待响应
   */
  async sendMessage(text: string): Promise<SendMessageResult> {
    await this.step("导航到对话页面", async () => {
      await this.chatPage.goto();
    });

    await this.step("等待页面加载", async () => {
      const loaded = await this.chatPage.isLoaded();
      if (!loaded) {
        await this.wait(2000);
      }
    });

    await this.step(`输入消息: "${text.slice(0, 30)}..."`, async () => {
      await this.chatPage.fillInput(text);
    });

    await this.step("点击发送", async () => {
      await this.chatPage.clickSend();
    });

    // 等待 AI 响应
    await this.wait(5000);

    const response = await this.step("获取最新响应", async () => {
      return await this.chatPage.getLastMessage();
    });

    return { success: true, response };
  }

  /**
   * 获取最新一条响应消息
   */
  async getLastResponse(): Promise<string> {
    return await this.step("获取最新响应", async () => {
      return await this.chatPage.getLastMessage();
    });
  }
}
