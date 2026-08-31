type HeaderProps = {
  operationStatus: "READY" | "RUNNING" | "STOPPED";
};

export default function Header({
  operationStatus,
}: HeaderProps) {
  const statusConfig = {
    READY: {
      label: "READY",
      powerText: "POWER ON - READY",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      dot: "bg-emerald-400",
      ring: "ring-emerald-400/20",
    },
    RUNNING: {
      label: "RUNNING",
      powerText: "POWER ON - RUNNING",
      badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      dot: "bg-blue-400",
      ring: "ring-blue-400/20",
    },
    STOPPED: {
      label: "STOPPED",
      powerText: "POWER ON - STOPPED",
      badge: "bg-red-500/10 text-red-300 border-red-500/20",
      dot: "bg-red-400",
      ring: "ring-red-400/20",
    },
  }[operationStatus];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black tracking-tight ring-1 ${statusConfig.ring}`}
          >
            VMC
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
              VMC Operator HMI
            </p>

            <div className="mt-0.5 flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                VMC-01
              </h1>

              <span className="hidden rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:inline-block">
                Vertical Machining Center
              </span>
            </div>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 sm:gap-3 sm:px-4 ${statusConfig.badge}`}
        >
          <span className="relative flex h-3 w-3">
            {operationStatus === "RUNNING" && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusConfig.dot} opacity-50`}
              />
            )}

            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${statusConfig.dot}`}
            />
          </span>

          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Machine Power
            </p>

            <p className="text-xs font-bold">
              {statusConfig.powerText}
            </p>
          </div>

          <span className="text-xs font-bold sm:hidden">
            {statusConfig.label}
          </span>
        </div>
      </div>
    </header>
  );
}