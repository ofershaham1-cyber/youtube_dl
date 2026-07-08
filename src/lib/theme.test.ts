import { describe, expect, it } from "vitest";
import { applyTheme, getStoredTheme, resolveTheme, type ThemeMode } from "./theme";

function createStorage(values: Record<string, string | null>) {
  return {
    getItem(key: string) {
      return values[key] ?? null;
    },
    setItem(key: string, value: string) {
      values[key] = value;
    },
    removeItem(key: string) {
      delete values[key];
    },
  } as Storage;
}

describe("theme helpers", () => {
  it("returns the saved theme from storage", () => {
    const storage = createStorage({ theme: "dark" });

    expect(getStoredTheme(storage)).toBe("dark");
  });

  it("falls back to the system preference when no theme is stored", () => {
    const storage = createStorage({});

    expect(resolveTheme(storage, true)).toBe("dark");
    expect(resolveTheme(storage, false)).toBe("light");
  });

  it("applies the theme class to the document root", () => {
    const classList = new Set<string>();
    const root = {
      classList: {
        add: (...names: string[]) => names.forEach((name) => classList.add(name)),
        remove: (...names: string[]) => names.forEach((name) => classList.delete(name)),
        contains: (name: string) => classList.has(name),
        toggle: (name: string, force?: boolean) => {
          if (force === undefined) {
            if (classList.has(name)) {
              classList.delete(name);
              return false;
            }
            classList.add(name);
            return true;
          }

          if (force) {
            classList.add(name);
            return true;
          }

          classList.delete(name);
          return false;
        },
      },
    } as unknown as HTMLElement;

    applyTheme("dark", root);

    expect(root.classList.contains("dark")).toBe(true);
  });
});
