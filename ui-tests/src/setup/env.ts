import * as dotenv from "dotenv";
import * as path from "path";

/**
 * 显式加载项目根目录的 .env 到 process.env（不覆盖外层已设置的变量）。
 *
 * 为什么需要显式加载：
 *   Vitest 的 worker 进程虽继承主进程环境，但某些环境下（远程 runner / CI）
 *   进程启动时 .env 未必被读取。通过 setupFiles 导入本文件可以兜底，
 *   确保 MIDSCENE_MODEL_* 等变量能读到。
 */
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

/**
 * 启动时即刻校验 Midscene 必要变量。
 * 缺失时立即抛错，避免延迟到第一次 AI 调用才失败。
 */
const REQUIRED = [
  "MIDSCENE_MODEL_BASE_URL",
  "MIDSCENE_MODEL_API_KEY",
  "MIDSCENE_MODEL_NAME",
] as const;

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `[setup/env] 缺少 Midscene 环境变量: ${missing.join(", ")}\n` +
      `请确认项目根目录存在 .env 文件（参照 .env.example）。`
  );
}
