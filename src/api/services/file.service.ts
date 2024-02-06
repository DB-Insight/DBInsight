import { BrowserWindow, app } from "electron";
import Container, { Service } from "typedi";
import * as path from "path";
import fs from "fs-extra";
import chokidar, { FSWatcher } from "chokidar";
import fg from "fast-glob";

@Service()
export class FileService {
  private readonly main: BrowserWindow = Container.get("main");
  private readonly basePath: string = path.join(
    app.getPath("documents"),
    app.getName(),
  );
  private dirPath: string = "";
  private watcher: FSWatcher | null = null;

  async init(dirPath: string = "queries") {
    this.dirPath = path.join(this.basePath, dirPath);
    await fs.ensureDir(this.dirPath);
    this.watcher = chokidar.watch(this.dirPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });
    this.watcher.on("all", async (event, path) => {
      console.log(event, path);
      if (event === "add") {
        console.log(await this.getAllFiles());
      }
    });
  }

  private async getAllFiles() {
    return await fg.async(this.dirPath + "/**/*.sql", {
      onlyFiles: false,
      objectMode: true,
    });
  }
}
