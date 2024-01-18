import KeepAlive from "@/components/KeepAlive";
import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { Offscreen } from "react-stillness-component";
import Menu from "./Menu";
import styles from "./index.module.css";

export default () => {
  const location = useLocation();
  const outlet = useOutlet();

  const [outlets, setOutlets] = useState<any>([]);
  const locationPathname = location.pathname;

  useEffect(() => {
    const result = outlets.some((o: any) => o.pathname === locationPathname);
    if (!result) {
      setOutlets([
        ...outlets,
        {
          key: locationPathname,
          pathname: locationPathname,
          outlet,
        },
      ]);
    }
  }, [locationPathname]);

  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        <Menu />
      </div>
      <div className={styles.content}>
        {outlets.map((o: any) => (
          <Offscreen key={o.key} visible={locationPathname === o.pathname}>
            <KeepAlive path={o.pathname}>{o.outlet}</KeepAlive>
          </Offscreen>
        ))}
      </div>
    </div>
  );
};
