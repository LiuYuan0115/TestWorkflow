import "../../setup/env";
import { describe, test, expect } from "vitest";
import { usePlaywrightWithAuth } from "../../fixtures/playwright.fixture";
import { ChatService } from "../../services";
import { ChatComposerPage } from "../../pages";
import { BASE_URL } from "../../config";

/**
 * UI-CHAT-001: 发送问题后 AI 返回纯文本消息正常渲染
 * 来源：testing/ui-testcases/chat-ui.yml
 */
describe("Chat Composer - 纯文本消息渲染", () => {
  const ctx = usePlaywrightWithAuth(`${BASE_URL}/chat`);

  test("UI-CHAT-001: 发送问题后 AI 返回纯文本消息正常渲染", async () => {
    // 前置条件：已登录并进入聊天界面（由 fixture 自动完成）
    // 前置条件：网络连接正常

    const chatService = new ChatService(ctx.page);
    const chatPage = new ChatComposerPage(ctx.page);

    // 等待页面加载
    await ctx.page.waitForTimeout(3000);

    // 步骤 1: 在页面底部的消息输入框中输入"你好"
    // 步骤 2: 点击输入框右侧的蓝色发送按钮
    console.log("[UI-CHAT-001] 发送消息: 你好");
    const result = await chatService.sendMessage("你好");

    // 验收标准 1: 对话区出现 AI 回复气泡
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();

    // 步骤 3: 等待 AI 回复气泡出现在对话区
    // sendMessage 内部 getLastMessage 只等了 5s，可能拿到的是占位文本
    // 需要真正等待 AI 回复完成
    await chatPage.waitForAIResponse();

    // 重新获取响应（waitForAIResponse 确认气泡出现后再取）
    const response = await chatPage.getLastMessage();

    // 验收标准 2: 回复文本完整显示，无乱码
    expect(response.length).toBeGreaterThan(0);
    console.log(`[UI-CHAT-001] AI 回复长度: ${response.length} 字符`);
    console.log(`[UI-CHAT-001] AI 回复内容: ${response.slice(0, 50)}...`);

    // 验收标准 3: 用户消息和 AI 消息分区排列
    const layoutCorrect = await chatPage.verifyMessageLayout();
    expect(layoutCorrect).toBe(true);

    console.log("[UI-CHAT-001] ✅ 测试通过：纯文本消息渲染正常");
  }, 240_000); // 240 秒超时（AI 回复可能需要 60-90s + 轮询确认）
});
