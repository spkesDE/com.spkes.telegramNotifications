import type {HomeyAPI} from "./Homey";

declare global {
  interface Window {
    Homey: HomeyAPI;
    HomeyReady: boolean;
  }
}

export {};
