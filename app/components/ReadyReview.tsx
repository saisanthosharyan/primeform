type ReadyReviewProps = {
  loading: boolean;
  onProceed: () => void;
};

export default function ReadyReview({
  loading,
  onProceed,
}: ReadyReviewProps) {
  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Final Review
        </p>

        <h2 className="mt-4 text-3xl font-bold text-slate-900">
          Machine Ready
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          All machine checks, tools, and workpiece setup have been completed.
          Review the operation details before opening the operation screen.
        </p>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-slate-50 p-6 text-left">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Machine
              </p>
              <p className="mt-1 font-bold text-slate-900">
                VMC-01
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Operation
              </p>
              <p className="mt-1 font-bold text-slate-900">
                Aluminum Housing Roughing
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                CNC Program
              </p>
              <p className="mt-1 font-bold text-slate-900">
                OPR-2048 Rev 3
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Material
              </p>
              <p className="mt-1 font-bold text-slate-900">
                AL 6061-T6
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={loading}
          className="mt-8 min-h-14 rounded-xl bg-blue-600 px-8 text-base font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "OPENING..." : "PROCEED TO OPERATION"}
        </button>
      </div>
    </section>
  );
}
