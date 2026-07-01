// The exact mark from the marketing site's favicon (C:\rhubarb\public\favicon.svg),
// reused here as the dedicated icon for .rhubarb files specifically. Files
// living inside a "<name>-rhubarb" mirror folder are in the key-encoded
// private dialect rather than the public Hungarian/Armenian one — those get
// a small padlock badge so they're never mistaken for an ordinary,
// key-free .rhubarb file at a glance.
export default function RhubarbIcon({ size = 16, locked = false }: { size?: number; locked?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
      <rect width="48" height="48" rx="12" fill="#390e25" />
      <path d="M24 8c6 6 9 13 9 19a9 9 0 1 1-18 0c0-6 3-13 9-19Z" fill="#cb3661" />
      <path d="M24 33v9" stroke="#a1c477" strokeWidth="3" strokeLinecap="round" />
      {locked && (
        <>
          <circle cx="36" cy="36" r="11" fill="#220817" stroke="#f2b705" strokeWidth="1.5" />
          <rect x="32" y="35" width="8" height="6.5" rx="1.3" fill="#f2b705" />
          <path d="M33.5 35v-2a2.5 2.5 0 0 1 5 0v2" stroke="#f2b705" strokeWidth="1.6" fill="none" />
        </>
      )}
    </svg>
  );
}
