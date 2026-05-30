export interface HomeyAPI {
  __(key: string, tokens?: object): string;
  ready(callback?: () => void): void;
  alert(message: string, callback?: () => void): void;
  confirm(message: string, callback?: HomeyEventListener): Promise<unknown>;
  popup(url: string): void;
  trigger(eventName: string, data?: Record<string, unknown>): Promise<unknown>;
  get(key: string, callback?: (value: unknown) => void): Promise<unknown>;
  set(key: string, value: unknown, callback?: (err: unknown) => void): Promise<unknown>;
  unset(key: string, callback?: (value: unknown) => void): Promise<unknown>;
  api(key: string, path: string, body: unknown, callback?: () => void): Promise<unknown>;
}

export interface HomeyEvent {
  name: string;
  data?: Record<string, unknown>;
}

export interface HomeyEventListener {
  (event: HomeyEvent): void;
}

export default class Homey {
  public static isDevelopment() {
    return import.meta.env.DEV;
  }

  public static async set(key: string, value: unknown, callback?: (value: unknown) => void) {
    if (window.HomeyReady) {
      return window.Homey.set(key, value, callback);
    }
    return this.getErrorPromise();
  }

  public static __(key: string, tokens?: object) {
    if (window.HomeyReady) {
      return window.Homey.__(key, tokens) ?? key;
    }
    return key;
  }

  public static async unset(key: string, callback?: (value: unknown) => void) {
    if (window.HomeyReady) {
      return window.Homey.unset(key, callback);
    }
    return this.getErrorPromise();
  }

  public static async get<T = unknown>(key: string, callback?: (value: T) => void) {
    if (window.HomeyReady) {
      return window.Homey.get(key, callback as ((value: unknown) => void) | undefined) as Promise<T>;
    }
    return this.getErrorPromise<T>();
  }

  public static async api(key: string, path: string, body: unknown, callback?: () => void) {
    if (window.HomeyReady) {
      return window.Homey.api(key, path, body, callback);
    }
    return this.getErrorPromise();
  }

  public static async alert(message: string, callback?: () => void) {
    if (window.HomeyReady) {
      return window.Homey.alert(message, callback);
    }
    return this.getErrorPromise();
  }

  public static async confirm(message: string, callback?: HomeyEventListener) {
    if (window.HomeyReady) {
      return window.Homey.confirm(message, callback);
    }
    return this.getErrorPromise();
  }

  public static async popup(url: string) {
    if (window.HomeyReady) {
      return window.Homey.popup(url);
    }
    return this.getErrorPromise();
  }

  public static async trigger(eventName: string, data?: Record<string, unknown>) {
    if (window.HomeyReady) {
      return window.Homey.trigger(eventName, data);
    }
    return this.getErrorPromise();
  }

  private static getErrorPromise<T = unknown>() {
    return Promise.reject(new Error("Homey is not ready")) as Promise<T>;
  }
}
