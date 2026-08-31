type WorkpieceSetupProps = {
  confirmed: boolean;
  loading: boolean;
  onConfirm: () => void;
};

export default function WorkpieceSetup({
  confirmed,
  loading,
  onConfirm,
}: WorkpieceSetupProps) {
  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Workpiece Setup
        </p>

        <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-3xl">
          WP
        </div>

        <h2 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          Aluminum Housing
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Confirm that the AL 6061-T6 workpiece is correctly positioned,
          clamped, and aligned with work offset G54.
        </p>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Material
            </p>
            <p className="mt-1 font-bold text-slate-900">
              AL 6061-T6
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Work Offset
            </p>
            <p className="mt-1 font-bold text-slate-900">
              G54
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Machine
            </p>
            <p className="mt-1 font-bold text-slate-900">
              VMC-01
            </p>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={confirmed || loading}
          className="mt-8 min-h-14 rounded-xl bg-blue-600 px-8 text-base font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {confirmed
            ? "WORKPIECE CONFIRMED"
            : loading
              ? "PROCESSING..."
              : "CONFIRM WORKPIECE SETUP"}
        </button>
      </div>
    </section>
  );
}
