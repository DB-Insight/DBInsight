import { menus } from "@/router";
import { GithubIcon, SlidersHorizontalIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { Separator } from "@/components/ui/separator";
import connectionModel from "@/models/connection.model";
import { useSnapshot } from "valtio";

export default () => {
  const nav = useNavigate();
  const location = useLocation();
  const { target } = useSnapshot(connectionModel.state);
  return (
    <div className="box-border flex flex-col">
      <div className="flex flex-1 flex-col">
        {menus
          .filter((item) => {
            if (!!item.hideInNoTarget && !target) return false;
            if (!item.hideInMenu) return true;
            return false;
          })
          .map((item) => {
            return (
              <div
                key={item.path}
                className={`flex cursor-pointer items-center justify-center px-3 py-3 text-sm ${
                  location.pathname === item.path ? "bg-primary" : styles.node
                } `}
                onClick={() => {
                  nav(item.path);
                }}
              >
                {item.icon}
              </div>
            );
          })}
      </div>
      <div className="flex flex-col">
        <div
          className={`flex cursor-pointer items-center justify-center px-3 py-3 text-sm ${
            location.pathname === "/setting" ? "bg-primary" : styles.node
          } `}
          onClick={() => {
            nav("/setting");
          }}
        >
          <SlidersHorizontalIcon className="h-4 w-4" />
        </div>
        <div className="px-3 py-2">
          <Separator className="h-[2px]" />
        </div>
        <a
          className={styles.github}
          href="https://github.com/DB-Insight/DBInsight"
          target="_blank"
        >
          <GithubIcon className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};
