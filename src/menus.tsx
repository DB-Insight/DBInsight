import Home from "@/pages/Home";
import Setting from "@/pages/Setting";
import { LayoutGridIcon, SlidersHorizontalIcon } from "lucide-react";
import { ReactNode } from "react";

interface MenuItem {
  path: string;
  name: string;
  element: ReactNode;
  icon: ReactNode;
  hideInMenu?: boolean;
}

export default [
  {
    path: "/",
    name: "Home",
    icon: <LayoutGridIcon className="h-4 w-4" />,
    element: <Home />,
  },
  {
    path: "/setting",
    name: "Setting",
    hideInMenu: true,
    icon: <SlidersHorizontalIcon className="h-4 w-4" />,
    element: <Setting />,
  },
] as MenuItem[];
