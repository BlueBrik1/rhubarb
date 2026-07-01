// The exact mark from the marketing site's favicon (C:\rhubarb\public\favicon.svg),
// reused here as the dedicated icon for .rhubarb files specifically.
export default function RhubarbIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
      <rect width="48" height="48" rx="12" fill="#390e25" />
      <path d="M24 8c6 6 9 13 9 19a9 9 0 1 1-18 0c0-6 3-13 9-19Z" fill="#cb3661" />
      <path d="M24 33v9" stroke="#a1c477" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
