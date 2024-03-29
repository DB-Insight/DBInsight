import AuthLayout from "@/layouts/AuthLayout";
import Home from "@/pages/Home";
import Setting from "@/pages/Setting";
import Studio from "@/pages/Studio";
import {
  KanbanSquareIcon,
  LayoutDashboardIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { createBrowserRouter, useRouteError } from "react-router-dom";

const ErrorBoundary = () => {
  const error: any = useRouteError();
  return error.message ?? "Unknown error";
};

interface MenuItem {
  path: string;
  name: string;
  element: ReactNode;
  icon: ReactNode;
  hideInMenu?: boolean;
  hideInNoTarget?: boolean;
  children?: MenuItem[];
}

export const menus = [
  {
    path: "/",
    name: "Home",
    icon: <LayoutDashboardIcon className="h-4 w-4" />,
    element: <Home />,
  },
  {
    path: "/studio",
    name: "Studio",
    icon: <KanbanSquareIcon className="h-4 w-4" />,
    element: <Studio />,
    hideInNoTarget: true,
  },
  {
    path: "/setting",
    name: "Setting",
    hideInMenu: true,
    icon: <SlidersHorizontalIcon className="h-4 w-4" />,
    element: <Setting />,
  },
] as MenuItem[];

export default createBrowserRouter(
  [
    {
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <AuthLayout />,
          children: menus,
        },
      ],
    },
  ],
  {
    basename: "/",
  },
);
