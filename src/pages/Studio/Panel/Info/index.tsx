import { Separator } from "@/components/ui/separator";
import connectionModel from "@/models/connection.model";
import { format } from "date-fns";
import { filesize } from "filesize";
import { useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { target, table, status, info } = useSnapshot(connectionModel.state);
  useEffect(() => {
    connectionModel.showCreateTable();
  }, [target, table]);

  return (
    <div className={styles.container}>
      {status && (
        <>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Type:
              </div>
              {status.engine}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Created at:
              </div>
              {format(status.createTime, "yyyy-MM-dd HH:mm:ss")}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Collation:
              </div>
              {status.tableCollation}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Updated at:
              </div>
              {status.updateTime
                ? format(status.updateTime, "yyyy-MM-dd HH:mm:ss")
                : "-"}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Number of rows:
              </div>
              {status.tableRows}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Data size:
              </div>
              {filesize(status.dataLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Row format:
              </div>
              {status.rowFormat}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Max data size:
              </div>
              {filesize(status.maxDataLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Avg. row length:
              </div>
              {status.avgRowLength}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Index size:
              </div>
              {filesize(status.indexLength, { base: 2 })}
            </div>
          </div>
          <div className="flex justify-between gap-10">
            <div className="flex min-w-[300px] max-w-[300px]">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Auto increment:
              </div>
              {status.autoIncrement ?? "-"}
            </div>
            <div className="flex flex-1">
              <div className="mr-1 min-w-[120px] max-w-[120px] text-right">
                Free data size:
              </div>
              {filesize(status.dataFree, { base: 2 })}
            </div>
          </div>
        </>
      )}
      <Separator className="my-4" />
      {status?.tableComment && (
        <div className="flex flex-1 flex-col">
          <div className="text-nowrap">Comments:</div>
          <div className="box-border flex-1">
            <SyntaxHighlighter style={oneDark}>
              {status?.tableComment ?? ""}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="text-nowrap">Create syntax:</div>
        <div className="box-border flex-1">
          {info && (
            <SyntaxHighlighter language="sql" style={oneDark}>
              {info}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  );
};
