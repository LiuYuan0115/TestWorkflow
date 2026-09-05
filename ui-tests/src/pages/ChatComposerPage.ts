import { BasePage } from "./BasePage";
import { BASE_URL } from "../config";

/**
 * Chat Composer 页面
 * AI-Only（首次实现）
 */
export class ChatComposerPage extends BasePage {
  readonly url = `${BASE_URL}/chat`;

  /**
   * 在对话输入框中填写文本
   */
  async fillInput(text: string) {
    await this.withFallback({
      label: `fillInput("${text.slice(0, 20)}...")`,
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiInput("页面最底部中央的白色文本输入框，通常带有占位符提示文字", { value: text });
      },
      aiOnly: true,
    });
  }

  /**
   * 点击发送按钮
   */
  async clickSend() {
    await this.withFallback({
      label: "clickSend()",
      cssAction: async () => false,
      aiFallback: async () => {
        await this.getAgent().aiTap("页面底部输入框右侧的发送按钮");
      },
      aiOnly: true,
    });
    await this.wait(1000);
  }

  /**
   * 获取最新一条消息的内容
   */
  async getLastMessage(): Promise<string> {
    const result = await this.getAgent().aiQuery<{ message: string }>(
      "提取对话列表中最后一条消息的文本内容，返回 { message: string }"
    );
    return result.message;
  }

  /**
   * 判断页面是否已加载完成
   */
  async isLoaded(): Promise<boolean> {
    return await this.getAgent().aiBoolean(
      "页面是否包含对话输入框（表示 Chat Composer 已加载完成）"
    );
  }

  /**
   * 等待 AI 回复气泡出现并完成流式输出
   * 来源：UI-CHAT-001 步骤 3
   *
   * 策略：轮询 getLastMessage()，基于"消息长度趋于稳定"判断流式结束。
   * 不要求两次文本完全相等——AI 提取的文本每次有细微抖动（措辞/截断），
   * 严格相等几乎不成立，会导致永远等到超时。改用长度变化容差更鲁棒。
   * @returns 是否成功等到稳定的非空回复（false 表示超时仍未拿到内容）
   */
  async waitForAIResponse(options?: { timeoutMs?: number }): Promise<boolean> {
    const timeout = options?.timeoutMs ?? 90000;
    const pollInterval = 5000;
    const lengthTolerance = 2; // 长度变化在此范围内视为"未增长"
    const startTime = Date.now();

    // 先等一段时间让消息开始流式输出
    await this.wait(5000);

    let lastLength = -1;
    let stableCount = 0;

    while (Date.now() - startTime < timeout) {
      try {
        const current = await this.getAgent().aiQuery<{ message: string }>(
          "提取对话列表中最后一条消息的文本内容，返回 { message: string }"
        );
        const len = (current.message || "").length;

        if (len > 0 && Math.abs(len - lastLength) <= lengthTolerance) {
          stableCount++;
          if (stableCount >= 2) {
            console.log(`[ChatComposerPage] waitForAIResponse: 消息已稳定 (${len} 字符)`);
            return true;
          }
        } else {
          stableCount = 0;
        }
        lastLength = len;
      } catch {
        // AI API 偶尔超时，忽略继续轮询
      }

      await this.wait(pollInterval);
    }

    console.log(
      `[ChatComposerPage] waitForAIResponse: 轮询超时（${timeout}ms），最后长度 ${lastLength} 字符`
    );
    return lastLength > 0;
  }

  /**
   * 验证用户消息和 AI 消息分区排列
   * 来源：UI-CHAT-001 验收标准
   */
  async verifyMessageLayout(): Promise<boolean> {
    return await this.getAgent().aiBoolean(
      "对话区中是否同时存在用户发送的消息和 AI 回复的消息（即页面上有至少两条不同来源的消息）"
    );
  }

  /**
   * 验证 AI 回复中代码块以等宽字体和语法高亮渲染
   * 来源：UI-CHAT-002 验收标准 1
   */
  async verifyCodeBlockRendered(): Promise<boolean> {
    return await this.getAgent().aiBoolean(
      "AI 回复气泡中是否存在一个代码块，以等宽字体、深色或灰色背景显示，且关键字带有语法高亮配色"
    );
  }

  /**
   * 验证代码块右上角显示复制按钮
   * 来源：UI-CHAT-002 验收标准 2
   */
  async verifyCopyButtonOnCodeBlock(): Promise<boolean> {
    return await this.getAgent().aiBoolean(
      "AI 回复的代码块右上角是否存在「复制」按钮或复制图标"
    );
  }

  /**
   * 验证代码块外文字按正常文本排版
   * 来源：UI-CHAT-002 验收标准 3
   */
  async verifyTextOutsideCodeBlock(): Promise<boolean> {
    return await this.getAgent().aiBoolean(
      "AI 回复中，代码块之外是否存在以正常文本字体排版的说明文字（非等宽字体、无代码背景）"
    );
  }
}
