import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import useResizeObserver from "use-resize-observer";
import Grid from "./Grid";
import styles from "./index.module.css";
import KeepAlive from "@/components/KeepAlive";
import Terminal from "./Terminal";
import { useReactive } from "ahooks";

export default () => {
  const state = useReactive<{
    tab: string;
  }>({
    tab: "content",
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
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="content"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Result
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            History
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <KeepAlive visible={state.tab === "content"}>
        <Grid />
      </KeepAlive>
      <KeepAlive visible={state.tab === "result"}>
        <Grid />
      </KeepAlive>
      <KeepAlive visible={state.tab === "history"}>
        <Terminal />
      </KeepAlive>
    </div>
  );
};
