import chokidar, { FSWatcher } from "chokidar";
import { BrowserWindow, app, shell } from "electron";
import fg from "fast-glob";
import fs from "fs-extra";
import { dirname, isAbsolute, join } from "path";
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

  async reload() {
    this.main.webContents.send("folder-change", this.getRoot(this.dirPath));
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

  async create(path: string, isFolder = false) {
    if (!isAbsolute(path)) {
      path = join(this.dirPath, path);
    }
    if (isFolder) {
      await fs.mkdir(path);
    } else {
      await fs.createFile(path);
    }
    return path;
  }

  async delete(path: string) {
    return await shell.trashItem(path);
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
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
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
