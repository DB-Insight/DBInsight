import { IColumn, IDBDriver, ITableStatus } from "@/api/interfaces";
import { ConnectionOptions } from "mysql2/promise";
import { MySQL } from "./mysql";

export class MySQLDriver implements IDBDriver {
  private readonly credentials: ConnectionOptions;
  private readonly db: MySQL | null = null;
  constructor(credentials: ConnectionOptions) {
    this.credentials = credentials;
    this.db = new MySQL(this.credentials);
  }

  async ping() {
    return this.db ? this.db.ping() : false;
  }

  async raw(sql: string) {
    return await this.db?.queryRows(sql);
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
      name: o[`Tables_in_${this.credentials.database}`],
    }));
  }

  async showTableStatus(table: string): Promise<ITableStatus> {
    const res: any = await this.raw(`SHOW TABLE STATUS LIKE '${table}'`);
    const status = res[0][0];
    return {
      autoIncrement: status.Auto_increment,
      avgRowLength: status.Avg_row_length,
      checkTime: status.Check_time,
      checksum: status.Checksum,
      collation: status.Collation,
      comment: status.Comment,
      createOptions: status.Create_options,
      createTime: status.Create_time,
      dataFree: status.Data_free,
      dataLength: status.Data_length,
      engine: status.Engine,
      indexLength: status.Index_length,
      maxDataLength: status.Max_data_length,
      name: status.Name,
      rowFormat: status.Row_format,
      rows: status.Rows,
      updateTime: status.Update_time,
      version: status.Version,
    };
  }

  async showCreateTable(table: string) {
    const res: any = await this.raw(
      `SHOW CREATE TABLE \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0][0];
  }

  async showColumns(table: string): Promise<IColumn[]> {
    const res: any = await this.raw(
      `SHOW COLUMNS FROM \`${this.credentials.database}\`.\`${table}\``,
    );
    return res[0].map((o: any) => ({
      field: o.Field,
      type: o.Type,
      null: o.Null,
      key: o.Key,
      default: o.Default,
      extra: o.Extra,
    }));
  }

  async queryTable(table: string, page: number, pageSize: number) {
    const columns = await this.showColumns(table);
    const res: any = await this.raw(
      `
      SELECT ${columns.map((c) => c.field).join(",")} 
      FROM \`${this.credentials.database}\`.\`${table}\` 
      LIMIT ${pageSize} OFFSET ${pageSize * (page - 1)}
      `,
    );
    const rows = res[0] ?? [];
    return {
      columns,
      rows,
    };
  }
}
