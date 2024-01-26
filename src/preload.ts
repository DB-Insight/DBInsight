// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";

process.once("loaded", async () => {
  contextBridge.exposeInMainWorld("API", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    on: (
      channel: string,
      listener: (event: IpcRendererEvent, ...args: any[]) => void,
    ) => {
      ipcRenderer.on(channel, listener);
    },
    off: (
      channel: string,
      listener: (event: IpcRendererEvent, ...args: any[]) => void,
    ) => {
      ipcRenderer.off(channel, listener);
    },
    trpc: (req: IpcRequest) => ipcRenderer.invoke("trpc", req),
  });
});
