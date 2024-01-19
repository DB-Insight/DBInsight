import { IDBDriver } from "@/api/interfaces";
import { ConnectionOptions as MySQLConnectionOptions } from "mysql2";
import { Service } from "typedi";
import { MySQLDriver } from "../drivers";

interface ConnectionOptions {
  mysql: MySQLConnectionOptions;
}

@Service()
export class DBFactory {
  async create<K extends keyof ConnectionOptions>(
    type: K,
    options: ConnectionOptions[K],
  ): Promise<IDBDriver> {
    if (type === "mysql") {
      return new MySQLDriver(options);
    }
    return new MySQLDriver(options);
  }
}
