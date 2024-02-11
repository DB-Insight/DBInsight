import chokidar, { FSWatcher } from "chokidar";
import { BrowserWindow, app } from "electron";
import fg from "fast-glob";
import fs from "fs-extra";
import { dirname, join } from "path";
import Container, { Service } from "typedi";

@Service()
export class FileService {
  private readonly main: BrowserWindow = Container.get("main");
  private readonly basePath: string = join(
    app.getPath("documents"),
    app.getName(),
  );
  private dirPath: string = "";
  private watcher: FSWatcher | null = null;

  async init(dirPath: string = "queries") {
    this.dirPath = join(this.basePath, dirPath);
    await fs.ensureDir(this.dirPath);
    this.watcher = chokidar.watch(this.dirPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });
    this.watcher.on("all", async (event, path) => {
      console.log(event, path);

      if (event === "add") {
      }

      this.main.webContents.send("folder-change", this.getRoot(this.dirPath));
    });
  }

  async dirname(path: string) {
    return dirname(path);
  }

  async join(paths: string[]) {
    return join(...paths);
  }

  async rename(oldPath: string, newPath: string) {
    await fs.rename(oldPath, newPath);
    this.main.webContents.send("folder-change", this.getRoot(this.dirPath));
  }

  private getRoot(path: string) {
    const files = this.getFiles(path);
    const children = this.getChildren(path);
    return {
      root: {
        index: "root",
        data: "root",
        isFolder: true,
        canMove: false,
        canRename: false,
        children: files.map((files) => files.index),
      },
      ...children,
    };
  }

  private getChildren(path: string) {
    const files = this.getFiles(path);
    let folder: Record<string, any> = {};
    files.forEach((f) => {
      if (f.isFolder) {
        const files = this.getFiles(f.index);
        const children = this.getChildren(f.index);
        folder[f.index] = {
          ...f,
          children: files.map((files) => files.index),
        };
        folder = { ...folder, ...children };
      } else {
        folder[f.index] = f;
      }
    });
    return folder;
  }

  private getFiles(path: string, glob: string = "/*/") {
    return fg
      .globSync([path + glob, path + "/*.sql"], {
        onlyFiles: false,
        objectMode: true,
        stats: true,
      })
      .map((f) => {
        return {
          index: f.path,
          data: f.name,
          isFolder: f.dirent.isDirectory(),
          canMove: true,
          canRename: true,
          weights: f.name.match(/[^\d]+|\d+/g),
        };
      })
      .sort((a, b) => {
        let pos = 0;
        const weightsA = a.weights!;
        const weightsB = b.weights!;
        let weightA = weightsA[pos];
        let weightB = weightsB[pos];
        while (weightA && weightB) {
          // @ts-ignore
          const v = weightA - weightB;
          if (!isNaN(v) && v !== 0) return v;
          if (weightA !== weightB) return weightA > weightB ? 1 : -1;
          pos += 1;
          weightA = weightsA[pos];
          weightB = weightsB[pos];
        }
        return weightA ? 1 : -1;
      });
  }
}
