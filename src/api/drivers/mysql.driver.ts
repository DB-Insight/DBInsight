import { IDBDriver } from "@/api/interfaces";
import {
  Connection,
  ConnectionOptions,
  createConnection,
} from "mysql2/promise";

export class MySQLDriver implements IDBDriver {
  private readonly options: ConnectionOptions;
  private connection: Connection | null = null;
  constructor(options: ConnectionOptions) {
    this.options = options;
  }

  private async getConnection() {
    if (!this.connection) {
      this.connection = await createConnection(this.options);
    }
    return this.connection;
  }

  async connect() {
    const connection = await this.getConnection();
    return await connection.connect();
  }

  async destroy() {
    const connection = await this.getConnection();
    return await connection.destroy();
  }

  async raw(sql: string) {
    const connection = await this.getConnection();
    return await connection.query(sql);
  }

  async getVersion() {
    const res: any = await this.raw(`SELECT VERSION() as version`);
    return res[0][0].version;
  }

  async showDatabases() {
    const res: any = await this.raw(`SHOW DATABASES`);
    return res[0]?.map((o: any) => ({ name: o["Database"] }));
  }

  async showTables() {
    const res: any = await this.raw(`SHOW TABLES`);
    return res[0]?.map((o: any) => ({
      name: o[`Tables_in_${this.connection?.config.database}`],
    }));
  }
}
