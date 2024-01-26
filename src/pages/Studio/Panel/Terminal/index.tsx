import { useReactive } from "ahooks";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import styles from "./index.module.css";
import { IpcRendererEvent, ipcRenderer } from "electron";

export const files = {
  "index.js": {
    file: {
      contents: `
import express from 'express';

const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log('App is live at http://localhost:' + port);
});
`,
    },
  },
  "package.json": {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`,
    },
  },
};

export default () => {
  const state = useReactive({
    height: 0,
  });
  const ref = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal>();
  const fitAddonRef = useRef<FitAddon>();

  useEffect(() => {
    const onLog = (e: IpcRendererEvent, data: string) => {
      if (terminalRef.current) {
        terminalRef.current.writeln(data);
      }
    };

    if (!!ref.current) {
      terminalRef.current = new Terminal({
        convertEol: true,
        theme: {
          background: "#131722",
        },
      });

      window.API.on("log", onLog);

      fitAddonRef.current = new FitAddon();
      terminalRef.current.loadAddon(fitAddonRef.current);

      terminalRef.current.open(ref.current);
      fitAddonRef.current.fit();
    }
    return () => {
      window.API.off("log", onLog);

      if (terminalRef.current) {
        terminalRef.current.dispose();
      }
      if (fitAddonRef.current) {
        fitAddonRef.current.dispose();
      }
    };
  }, [ref]);

  useEffect(() => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }),
    [fitAddonRef, state.height];

  return (
    <div
      className={styles.container}
      ref={ref}
      style={{
        height: state.height,
      }}
    />
  );
};
