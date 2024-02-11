import { useReactive } from "ahooks";
import { useEffect, useRef } from "react";
import { Input } from "../ui/input";

export default ({
  defaultValue,
  onSave,
}: {
  defaultValue: string;
  onSave: (value: string) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const state = useReactive({
    value: defaultValue,
  });
  useEffect(() => {
    if (!!defaultValue && !!ref.current) {
      setTimeout(() => {
        ref.current!.focus();
      }, 300);
    }
  }, [ref.current, defaultValue]);
  return (
    <Input
      ref={ref}
      className="h-6 w-full text-xs"
      autoFocus
      value={state.value}
      onChange={(e) => {
        state.value = e.target.value;
      }}
      onBlur={() => {
        onSave(state.value);
      }}
    />
  );
};
