export default function StatusBar({ message }: { message: string }) {
  return (
    <div className="font-display flex h-7 flex-shrink-0 items-center bg-rhubarb-600 px-3 text-xs font-semibold text-custard-50">
      {message}
    </div>
  );
}
