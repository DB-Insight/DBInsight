import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./index.module.css";

export default () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>Settings</div>
      <Tabs className={styles.tabs} defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="general"></TabsContent>
        <TabsContent value="advanced"></TabsContent>
      </Tabs>
    </div>
  );
};
