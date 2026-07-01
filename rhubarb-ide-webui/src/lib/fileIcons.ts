export interface FileIconSpec {
  label: string;
  bg: string;
  fg: string;
}

const EXTENSION_ICONS: Record<string, FileIconSpec> = {
  py: { label: "PY", bg: "bg-leaf-500", fg: "text-custard-50" },
  java: { label: "JV", bg: "bg-rhubarb-600", fg: "text-custard-50" },
  rjava: { label: "RJ", bg: "bg-rhubarb-700", fg: "text-custard-50" },
  md: { label: "MD", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  markdown: { label: "MD", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  json: { label: "{}", bg: "bg-leaf-600", fg: "text-custard-50" },
  js: { label: "JS", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  mjs: { label: "JS", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  cjs: { label: "JS", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  jsx: { label: "JSX", bg: "bg-custard-200", fg: "text-rhubarb-950" },
  ts: { label: "TS", bg: "bg-rhubarb-500", fg: "text-custard-50" },
  tsx: { label: "TSX", bg: "bg-rhubarb-500", fg: "text-custard-50" },
  html: { label: "<>", bg: "bg-rhubarb-400", fg: "text-custard-50" },
  htm: { label: "<>", bg: "bg-rhubarb-400", fg: "text-custard-50" },
  css: { label: "#", bg: "bg-leaf-400", fg: "text-rhubarb-950" },
  xml: { label: "XML", bg: "bg-rhubarb-300", fg: "text-rhubarb-950" },
  yaml: { label: "YML", bg: "bg-leaf-700", fg: "text-custard-50" },
  yml: { label: "YML", bg: "bg-leaf-700", fg: "text-custard-50" },
  class: { label: "CLS", bg: "bg-rhubarb-800", fg: "text-custard-100/70" },
};

const DEFAULT_ICON: FileIconSpec = { label: "•", bg: "bg-rhubarb-800", fg: "text-custard-100/70" };

export function iconForExtension(name: string): FileIconSpec {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_ICONS[ext] ?? DEFAULT_ICON;
}
