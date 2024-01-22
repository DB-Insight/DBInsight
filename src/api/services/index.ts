import Container from "typedi";
import { CacheService } from "./cache.service";
import { DBFactory } from "./db.factory";

export * from "./cache.service";
export * from "./db.factory";

export const initServices = async () => {
  Container.set(CacheService.name, CacheService);
  Container.set(DBFactory.name, DBFactory);
  return Container;
};
