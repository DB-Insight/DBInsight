import { useReactive } from "ahooks";
import { PropsWithChildren } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ConfirmPopoverProps extends PropsWithChildren {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default ({
  children,
  title = "Are you sure?",
  onConfirm,
  onCancel,
  confirmText = "Sure",
  cancelText = "Cancel",
}: ConfirmPopoverProps) => {
  const state = useReactive({
    open: false,
  });
  return (
    <Popover open={state.open} onOpenChange={(e) => (state.open = e)}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="flex flex-col p-4" side="bottom">
        <div className="mt-2 text-sm">{title}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onCancel?.();
              state.open = false;
            }}
          >
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm();
              state.open = false;
            }}
          >
            {confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
