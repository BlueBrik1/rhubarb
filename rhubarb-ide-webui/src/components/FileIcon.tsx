import RhubarbIcon from "./icons/RhubarbIcon";
import { iconForExtension } from "../lib/fileIcons";

export default function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "rhubarb") {
    return <RhubarbIcon size={16} />;
  }

  const spec = iconForExtension(name);
  return (
    <span
      className={`font-display flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] text-[7px] font-bold leading-none ${spec.bg} ${spec.fg}`}
    >
      {spec.label}
    </span>
  );
}
