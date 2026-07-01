import RhubarbIcon from "./icons/RhubarbIcon";
import { iconForExtension } from "../lib/fileIcons";
import { isPrivateDialectPath } from "../lib/paths";

export default function FileIcon({ name, path }: { name: string; path?: string | null }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "rhubarb") {
    return <RhubarbIcon size={16} locked={path ? isPrivateDialectPath(path) : false} />;
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
