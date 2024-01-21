import "reflect-metadata";
import Container from "typedi";
import { CacheService } from "./cache.service";
import { DBFactory } from "./db.factory";

export * from "./cache.service";
export * from "./db.factory";

export const initServices = async () => {
  Container.set({
    id: DBFactory.name,
    type: DBFactory,
  });
  Container.set({
    id: CacheService.name,
    type: CacheService,
  });
  return Container;
};
