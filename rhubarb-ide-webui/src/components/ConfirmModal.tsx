import Button from "./Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-[26rem] rounded-2xl border border-rhubarb-700 bg-rhubarb-950 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-base font-bold text-custard-50">{title}</p>
        <p className="mt-2 text-sm text-custard-100/70">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
