import AuthLayout from "@/layouts/AuthLayout";
import { createBrowserRouter, useRouteError } from "react-router-dom";
import menus from "./menus.tsx";

const ErrorBoundary = () => {
  const error: any = useRouteError();
  return error.message ?? "Unknown error";
};

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
