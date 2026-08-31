type MachineStatusProps = {
  status: "READY" | "RUNNING" | "STOPPED";
};

export default function MachineStatus({
  status,
}: MachineStatusProps) {
  const statusStyles = {
    READY: "bg-emerald-100 text-emerald-700",
    RUNNING: "bg-blue-100 text-blue-700",
    STOPPED: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Machine Status
      </p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-900">
            VMC-01
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Vertical Machining Center
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}