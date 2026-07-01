export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(event) => event.preventDefault()} />
      <div
        className="fixed z-50 min-w-[11rem] overflow-hidden rounded-lg border border-rhubarb-800 bg-rhubarb-950 py-1 shadow-2xl"
        style={{ left: x, top: y }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            disabled={item.disabled}
            onClick={() => {
              if (item.disabled) return;
              item.action();
              onClose();
            }}
            className="block w-full px-3 py-1.5 text-left text-sm text-custard-100/85 transition-colors hover:bg-rhubarb-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
