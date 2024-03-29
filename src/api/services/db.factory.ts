import { IDBDriver } from "@/api/interfaces";
import { yellow } from "colorette";
import * as crypto from "crypto";
import { BrowserWindow } from "electron";
import { ConnectionOptions as MySQLConnectionOptions } from "mysql2";
import { highlight } from "sql-highlight";
import Container, { Service } from "typedi";
import { CacheService } from ".";
import { MySQLDriver } from "../drivers";

interface ConnectionOptions {
  mysql: MySQLConnectionOptions;
}

@Service()
export class DBFactory {
  private readonly cache: CacheService = Container.get(CacheService);
  private readonly main: BrowserWindow = Container.get("main");

  async create<K extends keyof ConnectionOptions>(
    type: K,
    options: ConnectionOptions[K] | any,
  ): Promise<IDBDriver> {
    const params = {
      host: options.host,
      user: options.user,
      password: options.password,
      database: options.database,
      port: options.port,
    };
    const key =
      type +
      "-" +
      crypto.createHash("sha256").update(JSON.stringify(params)).digest("hex");

    let db = this.cache.get(key);
    if (!!db) return db;

    if (type === "mysql") {
      db = new MySQLDriver(params);
      db.on("raw", (sql: string) => {
        sql = `${yellow("[SQL]")} ${highlight(sql)}`;
        console.log(sql);
        this.main.webContents.send("log", sql);
      });
      await this.cache.set(key, db);
    }

    return db;
  }
}
