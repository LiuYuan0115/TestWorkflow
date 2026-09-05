import { chromium, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const DEFAULT_BASE_URL = "http://127.0.0.1:1520";

function normalizeAbsoluteHttpUrl(input?: string): string | undefined {
  const value = input?.trim();
  if (!value) return undefined;
  if (!/^https?:\/\//i.test(value)) return undefined;
  return value.replace(/\/+$/, "");
}

export const BASE_URL =
  normalizeAbsoluteHttpUrl(process.env.BASE_URL) || DEFAULT_BASE_URL;

export const LOGIN_URL =
  normalizeAbsoluteHttpUrl(process.env.LOGIN_URL) || `${BASE_URL}/login`;

function createCleanUserDataDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zsp-pw-"));
  const defaultDir = path.join(dir, "Default");
  fs.mkdirSync(defaultDir, { recursive: true });

  const prefs = {
    credentials_enable_service: false,
    profile: {
      password_manager_enabled: false,
      password_manager_leak_detection: false,
    },
    password_manager: {
      leak_detection: false,
    },
  };
  fs.writeFileSync(path.join(defaultDir, "Preferences"), JSON.stringify(prefs));

  return dir;
}

export interface CreatedBrowser {
  context: BrowserContext;
  userDataDir: string;
}

export async function createBrowser(options?: {
  headless?: boolean;
}): Promise<CreatedBrowser> {
  const userDataDir = createCleanUserDataDir();

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: options?.headless ?? false,
    chromiumSandbox: false,
    ignoreHTTPSErrors: true,
    viewport: null,
    args: [
      "--start-maximized",
      "--window-size=1920,1080",
      "--disable-web-security",
      "--disable-site-isolation-trials",
      "--disable-features=IsolateOrigins,site-per-process,PasswordLeakDetection,PasswordCheck",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-save-password-bubble",
      "--disable-password-manager-reauthentication",
      "--password-store=basic",
      "--disable-notifications",
      "--disable-infobars",
      "--no-default-browser-check",
    ],
  });

  return { context, userDataDir };
}
