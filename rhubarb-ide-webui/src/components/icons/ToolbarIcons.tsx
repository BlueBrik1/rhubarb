interface GlyphProps {
  size?: number;
  withPlus?: boolean;
}

// Small "+" badge shared by the two "create new" toolbar icons, drawn in the
// bottom-right corner of the base glyph.
function PlusBadge() {
  return (
    <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="10.5" y1="9.5" x2="10.5" y2="13.5" />
      <line x1="8.5" y1="11.5" x2="12.5" y2="11.5" />
    </g>
  );
}

export function FolderIcon({ size = 16, withPlus = false }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <path
        d="M2 4.5C2 3.67 2.67 3 3.5 3H6.2L7.4 4.3H12.5C13.33 4.3 14 4.97 14 5.8V11.5C14 12.33 13.33 13 12.5 13H3.5C2.67 13 2 12.33 2 11.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {withPlus && <PlusBadge />}
    </svg>
  );
}

export function FileIconGlyph({ size = 16, withPlus = false }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <path
        d="M4.5 2C3.95 2 3.5 2.45 3.5 3V13C3.5 13.55 3.95 14 4.5 14H11.5C12.05 14 12.5 13.55 12.5 13V5.5L9 2H4.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9 2V5.5H12.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {withPlus && <PlusBadge />}
    </svg>
  );
}

export function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <path d="M4 2.8C4 2.1 4.77 1.69 5.36 2.06L13 6.86C13.56 7.21 13.56 8.03 13 8.38L5.36 13.18C4.77 13.55 4 13.14 4 12.44V2.8Z" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="1.5" y1="1.5" x2="8.5" y2="8.5" />
        <line x1="8.5" y1="1.5" x2="1.5" y2="8.5" />
      </g>
    </svg>
  );
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="7" cy="7" r="4.3" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10.1" y1="10.1" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function KeyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <line x1="7.1" y1="7.1" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10.5" y1="10.5" x2="12.3" y2="8.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="12" x2="13.6" y2="10.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ size = 10, expanded = false }: { size?: number; expanded?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      className={`flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
