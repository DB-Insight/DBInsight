import KeepAlive from "@/components/KeepAlive";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactive } from "ahooks";
import { useEffect } from "react";
import useResizeObserver from "use-resize-observer";
import Grid from "./Grid";
import Info from "./Info";
import Structure from "./Structure";
import Terminal from "./Terminal";
import styles from "./index.module.css";
import { useSnapshot } from "valtio";
import connectionModel from "@/models/connection.model";
import {
  FileCodeIcon,
  InfoIcon,
  TableIcon,
  TerminalSquareIcon,
} from "lucide-react";

export default () => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    tab: string;
  }>({
    tab: "console",
  });
  const { ref, height = 300, width = 0 } = useResizeObserver<HTMLDivElement>();
  useEffect(() => {}, [height, width]);
  return (
    <div ref={ref} className={styles.container}>
      <Tabs
        className="relative mr-auto w-full"
        value={state.tab}
        onValueChange={(e) => (state.tab = e)}
      >
        <TabsList className="w-full justify-start rounded-none bg-transparent py-1 font-normal">
          <TabsTrigger
            value="console"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 text-xs text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            <TerminalSquareIcon className="mr-1 h-4 w-4" />
            Console
          </TabsTrigger>

          {target && table && (
            <>
              <TabsTrigger
                value="content"
                className="relative rounded-none border-b-2 border-b-transparent px-4 py-1 text-xs text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
              >
                <TableIcon className="mr-1 h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="structure"
                className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 text-xs text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
              >
                <FileCodeIcon className="mr-1 h-4 w-4" />
                Structure
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 text-xs text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
              >
                <InfoIcon className="mr-1 h-4 w-4" />
                Info
              </TabsTrigger>
            </>
          )}
        </TabsList>
      </Tabs>
      <KeepAlive visible={state.tab === "console"}>
        <Terminal />
      </KeepAlive>
      {target && table && (
        <>
          <KeepAlive visible={state.tab === "content"}>
            <Grid />
          </KeepAlive>
          <KeepAlive visible={state.tab === "structure"}>
            <Structure />
          </KeepAlive>
          <KeepAlive visible={state.tab === "info"}>
            <Info />
          </KeepAlive>
        </>
      )}
    </div>
  );
};
