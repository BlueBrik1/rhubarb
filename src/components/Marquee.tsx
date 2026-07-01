const words = [
  "COMPILES TO REAL PYTHON",
  "PUBLIC BY DEFAULT",
  "ENCRYPT WITH ONE KEY",
  "LOOKS COMPLETELY ENCRYPTED",
  "DECRYPT WITH THE SAME KEY",
  "BUILT-IN TERMINAL",
];

export default function Marquee() {
  const sequence = [...words, ...words];

  return (
    <div className="relative overflow-hidden border-y-2 border-rhubarb-900 bg-rhubarb-600 py-4">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
        {[...sequence, ...sequence].map((word, i) => (
          <span
            key={i}
            className="font-display flex items-center gap-10 text-xl font-bold tracking-wide text-custard-50"
          >
            {word}
            <span className="text-leaf-300">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
