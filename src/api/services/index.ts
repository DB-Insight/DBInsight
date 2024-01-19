import "reflect-metadata";
import Container from "typedi";
import { DBFactory } from "./db.factory";

export * from "./db.factory";

export const initServices = async () => {
  Container.set([
    {
      id: DBFactory.name,
      type: DBFactory,
    },
  ]);
  return Container;
};
