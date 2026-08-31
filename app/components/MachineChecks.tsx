type MachineCheck = {
  title: string;
  description: string;
};

type MachineChecksProps = {
  checks: MachineCheck[];
  currentCheck: number;
  confirmed: boolean;
  loading: boolean;
  onConfirm: () => void;
  onNext: () => void;
};

export default function MachineChecks({
  checks,
  currentCheck,
  confirmed,
  loading,
  onConfirm,
  onNext,
}: MachineChecksProps) {
  const current = checks[currentCheck] ?? checks[0];

  if (!current) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Machine Check
        </p>

        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-600">
          {currentCheck + 1}
        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          {current.title}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          {current.description}
        </p>

        <div className="mt-8">
          {confirmed ? (
            <div className="inline-flex rounded-lg bg-emerald-50 px-5 py-3 font-bold text-emerald-700">
              CHECK CONFIRMED
            </div>
          ) : (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="min-h-14 rounded-xl bg-blue-600 px-8 text-base font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "CONFIRM CHECK"}
            </button>
          )}
        </div>

        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3">
          <button
            onClick={onNext}
            disabled={!confirmed || loading}
            className={`min-h-14 rounded-xl border px-6 text-base font-bold ${
              confirmed && !loading
                ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            {currentCheck < checks.length - 1
              ? "NEXT CHECK"
              : "CONTINUE TO TOOLS"}
          </button>
        </div>
      </div>
    </section>
  );
}
