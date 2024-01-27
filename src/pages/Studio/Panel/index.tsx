import KeepAlive from "@/components/KeepAlive";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactive } from "ahooks";
import { useEffect } from "react";
import useResizeObserver from "use-resize-observer";
import Grid from "./Grid";
import Info from "./Info";
import Terminal from "./Terminal";
import styles from "./index.module.css";

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
        <TabsList className="w-full justify-start rounded-none bg-transparent py-1 font-normal">
          <TabsTrigger
            value="content"
            className="relative rounded-none border-b-2 border-b-transparent px-4 py-1 text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Info
          </TabsTrigger>
          <TabsTrigger
            value="console"
            className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-1 text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Console
          </TabsTrigger>
          <TabsTrigger
            value="result"
            className="relative rounded-none border-b-2 border-b-transparent px-4 py-1 text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none "
          >
            Result
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <KeepAlive visible={state.tab === "content"}>
        <Grid />
      </KeepAlive>
      <KeepAlive visible={state.tab === "info"}>
        <Info />
      </KeepAlive>
      <KeepAlive visible={state.tab === "result"}>
        <Grid />
      </KeepAlive>
      <KeepAlive visible={state.tab === "console"}>
        <Terminal />
      </KeepAlive>
    </div>
  );
};
