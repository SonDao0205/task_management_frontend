export class LocalStorageService {
  static set<T>(name: string, value: T) {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, JSON.stringify(value));
  }

  static get<T>(name: string): T | null {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem(name);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      localStorage.removeItem(name);
      return null;
    }
  }

  static remove(name: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  }
}
