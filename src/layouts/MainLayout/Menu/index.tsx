import menus from "@/menus";
import { SlidersHorizontalIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.css";

export default () => {
  const nav = useNavigate();
  const location = useLocation();
  return (
    <div className="box-border flex flex-col">
      <div className="flex flex-1 flex-col">
        {menus
          .filter((item) => !item.hideInMenu)
          .map((item) => (
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
          ))}
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
      </div>
    </div>
  );
};
