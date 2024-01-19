// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

process.once("loaded", async () => {
  contextBridge.exposeInMainWorld("API", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    trpc: (req: IpcRequest) => ipcRenderer.invoke("trpc", req),
  });
});
