import "../../setup/env";
import { describe, test, expect } from "vitest";
import { usePlaywrightWithAuth } from "../../fixtures/playwright.fixture";
import { ChatService } from "../../services";
import { ChatComposerPage } from "../../pages";
import { BASE_URL } from "../../config";

/**
 * UI-CHAT-002: AI 返回含代码块的消息正确渲染
 * 来源：testing/ui-testcases/chat-ui.yml
 */
describe("Chat Composer - 代码块消息渲染", () => {
  const ctx = usePlaywrightWithAuth(`${BASE_URL}/chat`);

  test("UI-CHAT-002: AI 返回含代码块的消息正确渲染", async () => {
    // 前置条件：已登录并进入聊天界面（由 fixture 自动完成）

    const chatService = new ChatService(ctx.page);
    const chatPage = new ChatComposerPage(ctx.page);

    // 等待页面加载
    await ctx.page.waitForTimeout(3000);

    // 步骤 1: 在页面底部的消息输入框中输入"写一段 Python hello world 代码"
    // 步骤 2: 点击输入框右侧的蓝色发送按钮
    console.log("[UI-CHAT-002] 发送消息: 写一段 Python hello world 代码");
    const result = await chatService.sendMessage("写一段 Python hello world 代码");
    expect(result.success).toBe(true);

    // 步骤 3: 等待包含代码块的 AI 回复出现在对话区
    const arrived = await chatPage.waitForAIResponse();
    expect(arrived).toBe(true);

    // 验收标准 1: AI 回复中代码块以等宽字体和语法高亮渲染
    const codeBlockRendered = await chatPage.verifyCodeBlockRendered();
    expect(codeBlockRendered).toBe(true);
    console.log("[UI-CHAT-002] ✅ 代码块以等宽字体和语法高亮渲染");

    // 验收标准 2: 代码块右上角显示复制按钮
    const hasCopyButton = await chatPage.verifyCopyButtonOnCodeBlock();
    expect(hasCopyButton).toBe(true);
    console.log("[UI-CHAT-002] ✅ 代码块右上角显示复制按钮");

    // 验收标准 3: 代码块外文字按正常文本排版
    const textOutside = await chatPage.verifyTextOutsideCodeBlock();
    expect(textOutside).toBe(true);
    console.log("[UI-CHAT-002] ✅ 代码块外文字按正常文本排版");

    console.log("[UI-CHAT-002] ✅ 测试通过：代码块消息渲染正常");
  }, 240_000); // 240 秒超时（AI 回复可能需要 60-90s + 轮询确认）
});
