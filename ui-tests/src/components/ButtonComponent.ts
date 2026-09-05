import { BaseComponent, CLICK_MARKER_ATTR } from "./BaseComponent";

export class ButtonComponent extends BaseComponent {
  async click(label: string) {
    await this.withFallback({
      label: `click("${label}")`,
      cssAction: async () => {
        return await this.clickByMarker(async () => {
          return await this.page.evaluate(
            ({ text, attr }: { text: string; attr: string }) => {
              const buttons = Array.from(document.querySelectorAll("button"));
              const btn = buttons.find((b) => {
                const el = b as HTMLElement;
                if (el.offsetParent === null) return false;
                if (b.disabled) return false;
                const content = (b.textContent || "").replace(/\s+/g, " ").trim();
                return content === text || content.includes(text);
              }) as HTMLButtonElement | undefined;
              if (btn) {
                btn.setAttribute(attr, "1");
                return true;
              }
              return false;
            },
            { text: label, attr: CLICK_MARKER_ATTR }
          );
        });
      },
      aiFallback: async () => {
        await this.getAgent().aiTap(`"${label}" 按钮`);
      },
    });
    await this.wait(500);
  }

  async isVisible(label: string): Promise<boolean> {
    return await this.page.evaluate((text: string) => {
      return Array.from(document.querySelectorAll("button")).some((b) => {
        const el = b as HTMLElement;
        if (el.offsetParent === null) return false;
        const content = (b.textContent || "").replace(/\s+/g, " ").trim();
        return content === text || content.includes(text);
      });
    }, label);
  }
}
