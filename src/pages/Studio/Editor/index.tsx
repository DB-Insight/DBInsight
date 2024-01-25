import { useReactive } from "ahooks";
import { Layout, Model } from "flexlayout-react";
import { useCallback, useMemo } from "react";
import Code from "./Code";

export default () => {
  const state = useReactive({
    global: {},
    borders: [],
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "tabset",
          weight: 50,
          children: [
            {
              type: "tab",
              name: "One",
              component: "button",
            },
            {
              type: "tab",
              name: "Two",
              component: "button",
            },
          ],
        },
      ],
    },
  });
  const model = useMemo(() => {
    return Model.fromJson({
      borders: state.borders,
      global: state.global,
      layout: state.layout as any,
    });
  }, [state.borders, state.global, state.layout]);

  const factory = useCallback((node: any) => {
    let component = node.getComponent();
    return <Code />;
  }, []);
  return <Layout model={model} factory={factory} />;
};
