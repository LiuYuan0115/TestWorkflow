import { BaseComponent } from "./BaseComponent";

export class InputComponent extends BaseComponent {
  async fill(label: string, value: string) {
    await this.withFallback({
      label: `fill("${label}")`,
      cssAction: async () => {
        const focused = await this.page.evaluate((text: string) => {
          // 先通过 placeholder 查找
          const inputs = Array.from(
            document.querySelectorAll("input, textarea")
          ) as (HTMLInputElement | HTMLTextAreaElement)[];
          for (const input of inputs) {
            const placeholder = input.placeholder || "";
            if (
              (placeholder === text || placeholder.includes(text)) &&
              (input as HTMLElement).offsetParent !== null
            ) {
              input.focus();
              input.select();
              const proto =
                input instanceof HTMLTextAreaElement
                  ? HTMLTextAreaElement.prototype
                  : HTMLInputElement.prototype;
              const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
              nativeSetter?.call(input, "");
              input.dispatchEvent(new Event("input", { bubbles: true }));
              return true;
            }
          }
          // 再通过 label 关联查找
          const labels = Array.from(document.querySelectorAll("label"));
          for (const lbl of labels) {
            const content = (lbl.textContent || "").trim();
            if (content === text || content.includes(text)) {
              const parent = lbl.parentElement;
              if (parent) {
                const input = parent.querySelector("input, textarea") as
                  | HTMLInputElement
                  | HTMLTextAreaElement
                  | null;
                if (input && (input as HTMLElement).offsetParent !== null) {
                  input.focus();
                  input.select();
                  const proto =
                    input instanceof HTMLTextAreaElement
                      ? HTMLTextAreaElement.prototype
                      : HTMLInputElement.prototype;
                  const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
                  nativeSetter?.call(input, "");
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  return true;
                }
              }
            }
          }
          return false;
        }, label);

        if (!focused) return false;
        await this.wait(100);
        await this.page.keyboard.type(value);
        return true;
      },
      aiFallback: async () => {
        await this.getAgent().aiInput(`${label} 输入框`, { value });
      },
    });
    await this.wait(300);
  }

  async clear(label: string) {
    await this.withFallback({
      label: `clear("${label}")`,
      cssAction: async () => {
        return await this.page.evaluate((text: string) => {
          const inputs = Array.from(
            document.querySelectorAll("input, textarea")
          ) as (HTMLInputElement | HTMLTextAreaElement)[];
          for (const input of inputs) {
            const placeholder = input.placeholder || "";
            if (
              (placeholder === text || placeholder.includes(text)) &&
              (input as HTMLElement).offsetParent !== null
            ) {
              input.focus();
              const proto =
                input instanceof HTMLTextAreaElement
                  ? HTMLTextAreaElement.prototype
                  : HTMLInputElement.prototype;
              const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
              nativeSetter?.call(input, "");
              input.dispatchEvent(new Event("input", { bubbles: true }));
              return true;
            }
          }
          return false;
        }, label);
      },
      aiFallback: async () => {
        await this.getAgent().aiAction(`清空 ${label} 输入框的内容`);
      },
    });
  }

  async getValue(label: string): Promise<string> {
    const value = await this.page.evaluate((text: string) => {
      const inputs = Array.from(
        document.querySelectorAll("input, textarea")
      ) as (HTMLInputElement | HTMLTextAreaElement)[];
      for (const input of inputs) {
        const placeholder = input.placeholder || "";
        if (placeholder === text || placeholder.includes(text)) {
          return input.value || "";
        }
      }
      return "";
    }, label);

    return value;
  }
}
