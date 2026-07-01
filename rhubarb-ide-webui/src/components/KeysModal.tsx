import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { KeysStatus } from "../types";
import Button from "./Button";

interface KeysModalProps {
  keysStatus: KeysStatus;
  onClose: () => void;
  onSaved: () => void;
}

export default function KeysModal({ keysStatus, onClose, onSaved }: KeysModalProps) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.revealKeys().then((result) => {
      if (!result.error) {
        setKey(result.key ?? "");
      }
    });
  }, []);

  async function handleGenerate() {
    const result = await api.generateKeys();
    if (result.error || !result.key) {
      setStatus(result.error ?? "Could not generate a key.");
      return;
    }
    setKey(result.key);
    setStatus("New key generated — click Save Key to store it.");
  }

  async function handleSave() {
    if (!key) {
      setStatus("A key is required.");
      return;
    }
    setBusy(true);
    const result = await api.saveKeys(key);
    setBusy(false);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    onSaved();
  }

  async function handleClear() {
    setBusy(true);
    const result = await api.clearKeys();
    setBusy(false);
    if (result.error) {
      setStatus(result.error);
      return;
    }
    setKey("");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[30rem] rounded-2xl border border-rhubarb-700 bg-rhubarb-950 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-base font-bold text-custard-50">Custom Rhubarb Key</p>
        <p className="mt-2 text-sm text-custard-100/70">
          One key generates your private Rhubarb vocabulary — the cipher is symmetric, so the{" "}
          <span className="font-mono text-custard-100/90">/mirror</span> terminal command encodes{" "}
          <span className="font-mono text-custard-100/90">.py</span> files with whatever key is saved here, and
          running or previewing a <span className="font-mono text-custard-100/90">.rhubarb</span> file inside a
          mirror folder decodes with that same key. A different key won't round-trip.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-custard-100/60">
            Key
            <input
              value={key}
              onChange={(event) => setKey(event.target.value.toUpperCase())}
              placeholder="Generate or paste a key"
              className="rounded-md border border-rhubarb-800 bg-rhubarb-900 px-2.5 py-1.5 font-mono text-sm text-custard-100 placeholder:text-custard-100/30 focus:border-rhubarb-500 focus:outline-none"
            />
          </label>
        </div>

        {status && <p className="mt-3 text-xs text-custard-200">{status}</p>}

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={handleGenerate} disabled={busy}>
            Generate New Key
          </Button>
          <div className="flex gap-2">
            {keysStatus.hasKey && (
              <Button variant="ghost" onClick={handleClear} disabled={busy}>
                Clear Key
              </Button>
            )}
            <Button variant="primary" onClick={handleSave} disabled={busy || !key}>
              Save Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
