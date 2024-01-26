import Container from "typedi";
import { CacheService } from "./cache.service";
import { DBFactory } from "./db.factory";
import { BrowserWindow } from "electron";

export * from "./cache.service";
export * from "./db.factory";

export const initServices = async (mainWindow: BrowserWindow) => {
  Container.set("main", mainWindow);
  Container.set(CacheService.name, CacheService);
  Container.set(DBFactory.name, DBFactory);
  return Container;
};
