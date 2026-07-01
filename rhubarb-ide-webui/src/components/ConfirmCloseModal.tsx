import Button from "./Button";

interface ConfirmCloseModalProps {
  fileName: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
}

export default function ConfirmCloseModal({ fileName, onSave, onDontSave, onCancel }: ConfirmCloseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="w-[26rem] rounded-2xl border border-rhubarb-700 bg-rhubarb-950 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-base font-bold text-custard-50">Save changes to {fileName}?</p>
        <p className="mt-2 text-sm text-custard-100/70">
          Your changes will be lost if you don't save them.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={onDontSave}>
            Don't Save
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
