type OperationStatus = "READY" | "RUNNING" | "STOPPED";

type OperationPanelProps = {
  operationStatus: OperationStatus;
  operationProgress: number;
  operationElapsedSeconds: number;
  loading: boolean;
  onStart: () => void;
  onStop: () => void;
};

const TOTAL_OPERATION_SECONDS = 300;

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(progress)));
}

export default function OperationPanel({
  operationStatus,
  operationProgress,
  operationElapsedSeconds,
  loading,
  onStart,
  onStop,
}: OperationPanelProps) {
  const progress = clampProgress(operationProgress);
  const elapsedSeconds = Math.max(
    0,
    Math.floor(operationElapsedSeconds)
  );

  const completed = progress >= 100;
  const running = operationStatus === "RUNNING";
  const ready = operationStatus === "READY";

  const remainingSeconds = completed
    ? 0
    : Math.max(
        0,
        TOTAL_OPERATION_SECONDS - elapsedSeconds
      );

  const statusClass = running
    ? "border-blue-200 bg-blue-50 text-blue-700"
    : ready
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : completed
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-red-200 bg-red-50 text-red-700";

  const statusDotClass = running
    ? "bg-blue-500"
    : ready
      ? "bg-emerald-500"
      : completed
        ? "bg-emerald-500"
        : "bg-red-500";

  const statusMessage = running
    ? "The machining operation is currently running."
    : completed
      ? "The machining operation has completed."
      : ready
        ? "Machine is ready to start the machining operation."
        : "Operation stopped. The latest progress has been preserved.";

  return (
    <section
      aria-label="VMC operation"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              VMC Operation
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Aluminum Housing Roughing
            </h2>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusClass}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusDotClass}`}
            />

            {operationStatus}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Machine
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              VMC-01
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Vertical Machining Center
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Operation
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              Housing Roughing
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Aluminum machining
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              CNC Program
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              OPR-2048
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Revision 3
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Work Offset
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              G54
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Active work coordinate
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Operation Progress
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Simulated machining cycle
              </p>
            </div>

            <p
              className="text-3xl font-black tabular-nums text-slate-900"
              aria-label={`${progress} percent complete`}
            >
              {progress}%
            </p>
          </div>

          <div
            className="h-6 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Operation progress"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completed
                  ? "bg-emerald-500"
                  : running
                    ? "bg-blue-600"
                    : "bg-slate-500"
              }`}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Elapsed Time
              </p>

              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {formatTime(elapsedSeconds)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Remaining Time
              </p>

              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {formatTime(remainingSeconds)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Cycle Time
              </p>

              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {formatTime(TOTAL_OPERATION_SECONDS)}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <div
            className={`rounded-xl border px-5 py-4 text-center ${statusClass}`}
          >
            <p className="font-bold">
              {statusMessage}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!running && !completed && (
            <button
              type="button"
              onClick={onStart}
              disabled={loading}
              className="min-h-14 rounded-xl bg-emerald-600 px-8 text-base font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "STARTING..." : "START OPERATION"}
            </button>
          )}

          {running && (
            <button
              type="button"
              onClick={onStop}
              disabled={loading}
              className="min-h-14 rounded-xl bg-red-600 px-8 text-base font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "STOPPING..." : "STOP OPERATION"}
            </button>
          )}

          {completed && (
            <div className="inline-flex min-h-14 items-center justify-center rounded-xl bg-emerald-100 px-8 text-base font-bold text-emerald-700">
              ✓ OPERATION COMPLETE
            </div>
          )}
        </div>

        {completed && (
          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Operation completed successfully in{" "}
            <span className="font-mono font-bold text-slate-700">
              {formatTime(elapsedSeconds)}
            </span>
            .
          </p>
        )}
      </div>
    </section>
  );
}