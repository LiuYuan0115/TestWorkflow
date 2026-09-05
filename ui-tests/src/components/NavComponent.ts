import { BaseComponent } from "./BaseComponent";

export class NavComponent extends BaseComponent {
  async clickMenu(menuName: string, selector?: string) {
    await this.withFallback({
      label: `clickMenu("${menuName}")`,
      cssAction: async () => {
        return await this.page.evaluate(
          ({ name, sel }: { name: string; sel?: string }) => {
            const candidates = sel
              ? Array.from(document.querySelectorAll(sel))
              : Array.from(
                  document.querySelectorAll(
                    "[class*=menu] a, [class*=nav] a, [class*=menu] span, nav a"
                  )
                );

            const target = candidates.find(
              (el) => el.textContent?.trim() === name
            ) as HTMLElement | undefined;

            if (target) {
              target.click();
              return true;
            }
            return false;
          },
          { name: menuName, sel: selector }
        );
      },
      aiFallback: async () => {
        await this.getAgent().aiTap(`导航菜单中的 "${menuName}" 菜单项`);
      },
    });
    await this.wait(1000);
  }

  /**
   * 获取当前激活的菜单项名称（AI 实现，视觉判断比 class 枚举更稳定）。
   */
  async getActiveMenu(): Promise<string> {
    const result = await this.getAgent().aiQuery<{ activeMenu: string }>(
      "提取当前导航菜单中处于选中/激活状态的菜单项名称，返回 { activeMenu: string }"
    );
    return result.activeMenu;
  }

  /**
   * 获取全部菜单项名称列表（AI 实现）。
   */
  async getMenuItems(): Promise<string[]> {
    const result = await this.getAgent().aiQuery<{ items: string[] }>(
      "提取页面导航菜单中所有菜单项的名称列表，返回 { items: string[] }"
    );
    return result.items;
  }
}
