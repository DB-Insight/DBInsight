import { trpc } from "@/api/client";
import { IIndex } from "@/api/interfaces";
import connectionModel from "@/models/connection.model";
import { useReactive } from "ahooks";
import { Allotment } from "allotment";
import { useCallback, useEffect } from "react";
import { useSnapshot } from "valtio";
import styles from "./index.module.css";

export default () => {
  const { target, table } = useSnapshot(connectionModel.state);
  const state = useReactive<{
    indexs: IIndex[];
  }>({
    indexs: [],
  });
  useEffect(() => {
    loadIndex();
  }, []);

  const loadIndex = useCallback(async () => {
    if (target && table) {
      const res = await trpc.connection.showIndex.query({ table, ...target });
      state.indexs = res.data;
    }
  }, [target, table]);

  return (
    <div className={styles.container}>
      <Allotment defaultSizes={[60, 40]} vertical>
        <Allotment.Pane
          className={styles.structure}
          key="structure"
          snap
          minSize={100}
        >
          1
        </Allotment.Pane>
        <Allotment.Pane
          className={styles.indexs}
          key="indexs"
          snap
          minSize={100}
        >
          1
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};
