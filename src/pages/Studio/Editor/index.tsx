import { useReactive } from "ahooks";
import {
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelHeaderProps,
  IDockviewPanelProps,
} from "dockview";
import { XIcon } from "lucide-react";
import { useEffect } from "react";
import Code from "./Code";

const components = {
  default: (props: IDockviewPanelProps<{ title: string }>) => {
    return <Code />;
  },
};

const HeaderComponent = ({ api, params }: IDockviewPanelHeaderProps) => {
  const state = useReactive({
    isActive: false,
  });
  useEffect(() => {
    api.onDidActiveChange((e) => {
      state.isActive = e.isActive;
    });
  }, [api]);
  return (
    <div className="group flex h-full w-full items-center justify-between pl-2 pr-1">
      <div className="text-xs">{params.title}</div>
      <XIcon
        className={`${state.isActive ? "visible" : "invisible"} h-4 w-4 hover:bg-slate-600 group-hover:visible`}
      />
    </div>
  );
};

export default () => {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: "panel_1",
      component: "default",
      tabComponent: "header",
      params: {
        title: "Panel 1",
      },
    });

    event.api.addPanel({
      id: "panel_2",
      component: "default",
      tabComponent: "header",
      params: {
        title: "Panel 2",
      },
    });

    event.api.addPanel({
      id: "panel_3",
      component: "default",
      tabComponent: "header",
      params: {
        title: "Panel 3",
      },
    });
  };
  return (
    <DockviewReact
      className={"dockview-theme-abyss"}
      components={components}
      tabComponents={{ header: HeaderComponent }}
      onReady={onReady}
    />
  );
};
