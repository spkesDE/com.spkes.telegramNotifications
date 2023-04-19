export interface HomeyAPI {
    __(key: string, tokens?: Object): string;

    ready(callback?: () => void): void;

    alert(message: string, callback?: () => void): void;

    confirm(eventName: string, listener: HomeyEventListener): Promise<any>;

    popup(url: string): void;

    trigger(eventName: string, data?: Record<string, any>): Promise<any>;

    get(key: string, callback?: (value: any) => void): Promise<any>;

    set(key: string, value: any, callback?: (err: any) => void): Promise<any>;

    unset(key: string, callback?: (value: any) => void): Promise<any>;

    api(key: string, path: string, body: any, callback?: () => void): Promise<any>;
}

export default class Homey {
    public static __(key: string, tokens?: Object) {
        if (window.HomeyReady)
            return window.Homey.__(key, tokens) ?? key;
        else return key;
    }

    public static set(key: string, value: any, callback?: (value: any) => void) {
        if (window.HomeyReady) return window.Homey.set(key, value, callback);
    }

    public static unset(key: string, callback?: (value: any) => void) {
        if (window.HomeyReady)
            return window.Homey.unset(key, callback);
    }

    public static get(key: string, callback?: (value: any) => void) {
        if (window.HomeyReady) return window.Homey.get(key, callback);
    }

    public static api(key: string, path: string, body: any, callback?: () => void) {
        if (window.HomeyReady) return window.Homey.api(key, path, body, callback);
    }

    public static alert(message: string, callback?: () => void) {
        if (window.HomeyReady) return window.Homey.alert(message, callback);
    }

    public static confirm(message: string, callback: HomeyEventListener) {
        if (window.HomeyReady) return window.Homey.confirm(message, callback);
    }

    public static popup(url: string) {
        if (window.HomeyReady) return window.Homey.popup(url);
    }

    public static trigger(eventName: string, callback?: (err: any) => void) {
        if (window.HomeyReady) return window.Homey.trigger(eventName, callback);
    }
}

export interface HomeyEvent {
    name: string;
    data?: Record<string, unknown>;
}

export interface HomeyEventListener {
    (event: HomeyEvent): void;
}
