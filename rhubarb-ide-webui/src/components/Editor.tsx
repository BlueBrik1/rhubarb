import { useEffect, useRef, useState } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { openSearchPanel, search, SearchQuery, setSearchQuery } from "@codemirror/search";
import { languageExtensionFor } from "../lib/languages";
import type { ScrollTarget } from "../types";
import ContextMenu from "./ContextMenu";

const rhubarbHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#ee8b95", fontStyle: "italic" },
  { tag: t.string, color: "#c4dc9c" },
  { tag: [t.number, t.bool, t.null], color: "#fce6b8" },
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword], color: "#f6b8b9", fontWeight: "600" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#fef3dc" },
  { tag: t.definition(t.variableName), color: "#fef3dc" },
  { tag: t.className, color: "#f6b8b9" },
  { tag: t.operator, color: "#ee8b95" },
  { tag: t.punctuation, color: "#b9889a" },
  { tag: t.variableName, color: "#fef3dc" },
]);

const rhubarbTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#220817",
      color: "#fef3dc",
      fontSize: "14px",
    },
    ".cm-content": {
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      caretColor: "#fef3dc",
      padding: "14px 0",
    },
    ".cm-scroller": {
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      overflow: "auto",
    },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#fef3dc" },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#6e1d3f !important",
    },
    ".cm-gutters": {
      backgroundColor: "#220817",
      color: "#5e1535",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#390e25",
      color: "#ee8b95",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(94, 21, 53, 0.25)",
    },
    ".cm-matchingBracket": {
      backgroundColor: "#5e1535",
      outline: "none",
    },
    ".cm-selectionMatch": {
      backgroundColor: "rgba(197, 220, 156, 0.25)",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(252, 230, 184, 0.25)",
      outline: "1px solid rgba(252, 230, 184, 0.4)",
    },
    ".cm-searchMatch-selected": {
      backgroundColor: "rgba(252, 230, 184, 0.55)",
    },
    ".cm-panels": {
      backgroundColor: "#390e25",
      color: "#fef3dc",
    },
    ".cm-panel.cm-search": {
      padding: "8px",
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      alignItems: "center",
    },
    ".cm-panel.cm-search label": {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#fef3dc",
    },
    ".cm-textfield": {
      backgroundColor: "#220817",
      color: "#fef3dc",
      border: "1px solid #5e1535",
      borderRadius: "6px",
      padding: "3px 8px",
    },
    ".cm-button": {
      backgroundColor: "#4a1530",
      color: "#fef3dc",
      border: "none",
      borderRadius: "6px",
      padding: "3px 10px",
      backgroundImage: "none",
    },
    ".cm-button:hover": {
      backgroundColor: "#6e1d3f",
    },
  },
  { dark: true }
);

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  readOnly?: boolean;
  scrollTo?: ScrollTarget | null;
}

export default function Editor({ value, onChange, fileName, readOnly = false, scrollTo = null }: EditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const languageCompartment = useRef(new Compartment()).current;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        languageCompartment.of(languageExtensionFor(fileName)),
        syntaxHighlighting(rhubarbHighlight),
        search({ top: true }),
        rhubarbTheme,
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. opening a different file) into the
  // editor without fighting the user's own typing / cursor position.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Swap the active tab's language (e.g. .py -> .java) without tearing down
  // and recreating the whole editor view.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.reconfigure(languageExtensionFor(fileName)),
    });
  }, [fileName, languageCompartment]);

  // Jump to and select a specific match (e.g. from the workspace search
  // panel), which also feeds CodeMirror's own highlightSelectionMatches so
  // every other occurrence of that same term lights up too.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !scrollTo) return;
    const totalLines = view.state.doc.lines;
    const lineInfo = view.state.doc.line(Math.min(Math.max(scrollTo.line, 1), totalLines));
    const from = Math.min(lineInfo.from + scrollTo.column, lineInfo.to);
    const to = Math.min(from + scrollTo.length, lineInfo.to);
    view.dispatch({
      selection: { anchor: from, head: to },
      effects: EditorView.scrollIntoView(from, { y: "center" }),
    });
    view.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTo]);

  async function handleCut() {
    const view = viewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const text = view.state.sliceDoc(from, to);
    if (!text) return;
    await navigator.clipboard.writeText(text);
    view.dispatch({ changes: { from, to, insert: "" } });
  }

  async function handleCopy() {
    const view = viewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const text = view.state.sliceDoc(from, to);
    if (text) await navigator.clipboard.writeText(text);
  }

  async function handlePaste() {
    const view = viewRef.current;
    if (!view) return;
    const text = await navigator.clipboard.readText();
    if (!text) return;
    view.dispatch(view.state.replaceSelection(text));
  }

  function handleSelectAll() {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
  }

  function handleFind() {
    const view = viewRef.current;
    if (!view) return;
    openSearchPanel(view);
  }

  function handleReplaceAllOccurrences() {
    const view = viewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    view.dispatch({
      effects: setSearchQuery.of(new SearchQuery({ search: selected, caseSensitive: true, literal: true })),
    });
    openSearchPanel(view);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={hostRef}
        className="h-full min-h-0 flex-1 overflow-hidden"
        onContextMenu={(event) => {
          if (readOnly) return;
          event.preventDefault();
          setContextMenu({ x: event.clientX, y: event.clientY });
        }}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: "Cut", action: handleCut },
            { label: "Copy", action: handleCopy },
            { label: "Paste", action: handlePaste },
            { label: "Select All", action: handleSelectAll },
            { label: "Find", action: handleFind },
            { label: "Replace All Occurrences", action: handleReplaceAllOccurrences },
          ]}
        />
      )}
    </div>
  );
}
