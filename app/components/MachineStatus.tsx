type MachineStatusProps = {
  operationStatus: "READY" | "RUNNING" | "STOPPED";
};

export default function MachineStatus({
  operationStatus,
}: MachineStatusProps) {
  const statusConfig = {
    READY: {
      label: "READY",
      description: "Machine is ready for operation",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      icon: "✓",
    },
    RUNNING: {
      label: "RUNNING",
      description: "Machining operation is in progress",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      icon: "▶",
    },
    STOPPED: {
      label: "STOPPED",
      description: "Machine operation is stopped",
      badge: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
      icon: "■",
    },
  }[operationStatus];

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Machine Status
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black tracking-wider text-white shadow-sm">
              VMC
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                VMC-01
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vertical Machining Center
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${statusConfig.badge}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70 text-lg font-black">
              {statusConfig.icon}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${statusConfig.dot} ${
                    operationStatus === "RUNNING"
                      ? "animate-pulse"
                      : ""
                  }`}
                />

                <p className="text-lg font-black tracking-wide">
                  {statusConfig.label}
                </p>
              </div>

              <p className="mt-1 text-xs font-medium opacity-80">
                {statusConfig.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Machine
            </p>

            <p className="mt-1 font-bold text-slate-900">
              VMC-01
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Power
            </p>

            <p className="mt-1 font-bold text-emerald-600">
              ON
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Control
            </p>

            <p className="mt-1 font-bold text-slate-900">
              CNC READY
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              State
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {statusConfig.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}