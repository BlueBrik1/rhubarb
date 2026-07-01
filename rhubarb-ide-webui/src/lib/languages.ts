import type { Extension } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { markdown } from "@codemirror/lang-markdown";
import { java } from "@codemirror/lang-java";

// Auto-detects a CodeMirror language extension from a filename's extension.
// .rhubarb is the one deliberate exception: it always returns no language
// extension (plain text), since its real syntax is the Armenian/Hungarian
// cipher tokens documented in doc.md, not anything a parser should try to
// understand. Unrecognized extensions get the same plain-text treatment.
export function languageExtensionFor(fileName: string): Extension[] {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  switch (ext) {
    case "rhubarb":
      return [];
    case "py":
      return [python()];
    case "java":
    case "rjava":
      return [java()];
    case "js":
    case "mjs":
    case "cjs":
      return [javascript()];
    case "jsx":
      return [javascript({ jsx: true })];
    case "ts":
      return [javascript({ typescript: true })];
    case "tsx":
      return [javascript({ typescript: true, jsx: true })];
    case "json":
      return [json()];
    case "html":
    case "htm":
      return [html()];
    case "css":
      return [css()];
    case "xml":
      return [xml()];
    case "yaml":
    case "yml":
      return [yaml()];
    case "md":
    case "markdown":
      return [markdown()];
    default:
      return [];
  }
}
