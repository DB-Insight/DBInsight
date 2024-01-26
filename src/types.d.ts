// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Vite
// plugin that tells the Electron app where to look for the Vite-bundled app code (depending on
// whether you're running in development or production).
/// <reference types="vite/client" />

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

type IpcRequest = {
  body: any;
  headers: any;
  method: string;
  url: string;
};

type IpcResponse = {
  body: any;
  headers: any;
  status: number;
};

interface IElectronAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  on: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
  off: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => void;
  trpc: (req: IpcRequest) => Promise<IpcResponse>;
}

interface Window {
  API: IElectronAPI;
}
