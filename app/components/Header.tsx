type HeaderProps = {
  operationStatus: "READY" | "RUNNING" | "STOPPED";
};

export default function Header({
  operationStatus,
}: HeaderProps) {
  const statusConfig = {
    READY: {
      label: "READY",
      description: "Machine ready",
      dot: "bg-emerald-400",
      badge:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      ring: "ring-emerald-400/20",
    },
    RUNNING: {
      label: "RUNNING",
      description: "Operation active",
      dot: "bg-blue-400",
      badge:
        "border-blue-500/30 bg-blue-500/10 text-blue-300",
      ring: "ring-blue-400/20",
    },
    STOPPED: {
      label: "STOPPED",
      description: "Machine operation stopped",
      dot: "bg-red-400",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
      ring: "ring-red-400/20",
    },
  }[operationStatus];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* Machine identity */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-black tracking-wide ring-1 ${statusConfig.ring}`}
            >
              VMC
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight sm:text-xl">
                  VMC-01
                </h1>

                <span className="hidden rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:inline-flex">
                  CNC
                </span>
              </div>

              <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                Vertical Machining Center
              </p>
            </div>
          </div>

          {/* Machine indicators */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Power
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  ON
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Control
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  CNC READY
                </span>
              </div>
            </div>
          </div>

          {/* Operation status */}
          <div
            className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 sm:px-4 ${statusConfig.badge}`}
          >
            <span className="relative flex h-3 w-3 shrink-0">
              {operationStatus === "RUNNING" && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusConfig.dot} opacity-50`}
                />
              )}

              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${statusConfig.dot}`}
              />
            </span>

            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">
                Operation
              </p>

              <p className="text-xs font-black uppercase tracking-wide">
                {statusConfig.label}
              </p>

              <p className="hidden text-[10px] font-medium opacity-60 lg:block">
                {statusConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile machine indicators */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-800 py-2 md:hidden">
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
              Power ON
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
              CNC Ready
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}