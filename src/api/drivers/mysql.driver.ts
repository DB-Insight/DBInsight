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

  async raw(sql: string) {
    const connection = await this.getConnection();
    return await connection.query(sql);
  }
}
