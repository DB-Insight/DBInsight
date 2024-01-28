import { trpc } from "@/api/client";
import { ITableStatus } from "@/api/interfaces";
import { Separator } from "@/components/ui/separator";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import { format } from "date-fns";
import { filesize } from "filesize";
import { useCallback, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    status: ITableStatus | null;
    info: string;
  }>({
    status: null,
    info: "",
  });
  useEffect(() => {
    loadInfo();
  }, [target, table]);

  const loadInfo = useCallback(async () => {
    if (target && table) {
      const statusRes = await trpc.connection.showTableStatus.query({
        table,
        ...target,
      });
      state.status = statusRes.data;
      const infoRes = await trpc.connection.showCreateTable.query({
        table,
        ...target,
      });
      state.info = infoRes.data;
    }
  }, [target?.database, table]);

  return (
    <div className={styles.container}>
      {state.status && (
        <>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Type:
              </div>
              {state.status.engine}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Created at:
              </div>
              {format(state.status.createTime, "yyyy-MM-dd HH:mm:ss")}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Collation:
              </div>
              {state.status.collation}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Updated at:
              </div>
              {state.status.updateTime
                ? format(state.status.updateTime, "yyyy-MM-dd HH:mm:ss")
                : "-"}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Number of rows:
              </div>
              {state.status.rows}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Data size:
              </div>
              {filesize(state.status.dataLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Row format:
              </div>
              {state.status.rowFormat}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Max data size:
              </div>
              {filesize(state.status.maxDataLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Avg. row length:
              </div>
              {state.status.avgRowLength}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Index size:
              </div>
              {filesize(state.status.indexLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[200px] max-w-[200px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Auto increment:
              </div>
              {state.status.autoIncrement ?? "-"}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Free data size:
              </div>
              {filesize(state.status.dataFree, { base: 2 })}
            </div>
          </div>
        </>
      )}
      <Separator className="my-4" />
      {state.status?.comment && (
        <div className="flex flex-1 flex-col">
          <div className="text-nowrap">Comments:</div>
          <div className="box-border flex-1">
            <SyntaxHighlighter style={oneDark}>
              {state.status?.comment ?? ""}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="text-nowrap">Create syntax:</div>
        <div className="box-border flex-1">
          {state.info && (
            <SyntaxHighlighter language="sql" style={oneDark}>
              {state.info}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  );
};
