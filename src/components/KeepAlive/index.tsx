import { PropsWithChildren } from "react";

interface KeepAliveProps extends PropsWithChildren {
  visible: boolean;
}

export default ({ visible = true, children }: KeepAliveProps) => {
  return (
    <div
      className={`h-full w-full`}
      style={{
        display: visible ? "block" : "none",
      }}
    >
      {children}
    </div>
  );
};
