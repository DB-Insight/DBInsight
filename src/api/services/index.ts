import { BrowserWindow } from "electron";
import Container from "typedi";
import { CacheService } from "./cache.service";
import { DBFactory } from "./db.factory";
import { FileService } from "./file.service";

export * from "./cache.service";
export * from "./db.factory";
export * from "./file.service";

export const initServices = async (mainWindow: BrowserWindow) => {
  Container.set("main", mainWindow);
  Container.set(CacheService.name, CacheService);
  Container.set(FileService.name, FileService);
  Container.set(DBFactory.name, DBFactory);
  return Container;
};
