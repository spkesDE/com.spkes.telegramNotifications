export interface HomeyEvent {
    name: string;
    data?: Record<string, unknown>;
}

export interface HomeyEventListener {
    (event: HomeyEvent): void;
}

export interface HomeyAPI {
    ready(callback?: () => void): void;

    alert(message: string, callback?: () => void): void;

    confirm(eventName: string, listener: HomeyEventListener): void;

    popup(url: string): void;

    trigger(eventName: string, data?: Record<string, any>): void;

    get(key: string, callback?: (value: any) => void): Promise<any>;

    set(key: string, value: any, callback?: (err: any) => void): Promise<any>;

    unset(key: string, callback?: () => void): void;

    removeState(key: string, callback?: () => void): void;

    api(key: string, path: string, body: any, callback?: () => void): Promise<any>;
}

declare global {
    interface Window {
        Homey: HomeyAPI;
        HomeyReady: boolean;
    }
}

export const Homey: HomeyAPI = window.Homey;
