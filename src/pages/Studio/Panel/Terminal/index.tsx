import { IpcRendererEvent } from "electron";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import styles from "./index.module.css";

export default ({ height, width }: { height: number; width: number }) => {
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
  }, [fitAddonRef, height, width]);

  return (
    <div
      className={styles.container}
      style={{ height: height - 30, width }}
      ref={ref}
    />
  );
};
