import {HomeyAPI} from './Homey';

declare global {
    interface Window {
        Homey: HomeyAPI;
        HomeyReady: boolean;
    }
}

export const Homey: HomeyAPI = window.Homey;
