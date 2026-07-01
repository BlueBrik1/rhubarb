import Button from "./Button";
import Editor from "./Editor";

interface PythonPreviewModalProps {
  python: string;
  onClose: () => void;
}

export default function PythonPreviewModal({ python, onClose }: PythonPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="flex h-[80vh] w-[44rem] flex-col overflow-hidden rounded-2xl border border-rhubarb-700 bg-rhubarb-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-rhubarb-900 px-4 py-3">
          <p className="font-display text-sm font-bold text-custard-100">Translated Python</p>
          <Button onClick={onClose}>Close</Button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Editor value={python} onChange={() => {}} fileName="preview.py" readOnly />
        </div>
      </div>
    </div>
  );
}
