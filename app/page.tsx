"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Header from "./components/Header";
import MachineStatus from "./components/MachineStatus";
import ProgressBar from "./components/ProgressBar";
import MachineChecks from "./components/MachineChecks";
import ToolSetup from "./components/ToolSetup";
import OperationPanel from "./components/OperationPanel";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------

type Stage =
  | "checks"
  | "tools"
  | "workpiece"
  | "ready"
  | "operation";

type OperationStatus =
  | "READY"
  | "RUNNING"
  | "STOPPED";

type SetupState = {
  machineChecks: boolean[];
  tools: boolean[];
  workpieceConfirmed: boolean;
  stage: Stage;
  operationStatus: OperationStatus;
  operationProgress: number;
  operationElapsedSeconds: number;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: SetupState;
};

// -----------------------------------------------------
// MACHINE CHECKS
// -----------------------------------------------------

const machineChecks = [
  {
    title: "Emergency Stop",
    description:
      "Verify that the emergency stop circuit is released and available.",
  },
  {
    title: "Machine Power",
    description:
      "Verify that the main machine power is available.",
  },
  {
    title: "Coolant System",
    description:
      "Verify that the coolant system is available and ready for operation.",
  },
  {
    title: "Lubrication",
    description:
      "Verify that the machine lubrication system is ready.",
  },
  {
    title: "Safety Doors",
    description:
      "Verify that all machine safety doors are closed and interlocks are ready.",
  },
  {
    title: "Control System",
    description:
      "Verify that the CNC control system is powered and ready.",
  },
];

// -----------------------------------------------------
// TOOLS
// -----------------------------------------------------

const tools = [
  {
    title: "Roughing End Mill",
    description:
      "Verify that the roughing end mill is correctly installed and secured.",
  },
  {
    title: "Finishing End Mill",
    description:
      "Verify that the finishing end mill is correctly installed and secured.",
  },
  {
    title: "Drill",
    description:
      "Verify that the drill is correctly installed and secured.",
  },
  {
    title: "Probe",
    description:
      "Verify that the probing tool is correctly installed and ready.",
  },
];

// -----------------------------------------------------
// DEFAULT SETUP
// -----------------------------------------------------

const defaultSetup: SetupState = {
  machineChecks: machineChecks.map(() => false),
  tools: tools.map(() => false),
  workpieceConfirmed: false,
  stage: "checks",
  operationStatus: "READY",
  operationProgress: 0,
  operationElapsedSeconds: 0,
};

// -----------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------

export default function Home() {
  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [setup, setSetup] =
    useState<SetupState>(defaultSetup);

  const [currentCheck, setCurrentCheck] =
    useState(0);

  const [currentTool, setCurrentTool] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ---------------------------------------------------
  // REFS
  // ---------------------------------------------------

  const setupRef =
    useRef<SetupState>(defaultSetup);

  const operationTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const progressSaveRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const completionSavedRef =
    useRef(false);

  // ---------------------------------------------------
  // KEEP REF IN SYNC
  // ---------------------------------------------------

  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  // ---------------------------------------------------
  // LOAD SETUP
  // ---------------------------------------------------

  const loadSetup = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/setup", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          "Failed to load machine setup"
        );
      }

      const result =
        (await response.json()) as ApiResponse;

      if (!result.success || !result.data) {
        throw new Error(
          result.message ||
            "Failed to load machine setup"
        );
      }

      const data = result.data;

      setSetup(data);
      setupRef.current = data;

      // Find first incomplete machine check
      if (data.stage === "checks") {
        const firstIncomplete =
          data.machineChecks.findIndex(
            (value) => !value
          );

        setCurrentCheck(
          firstIncomplete === -1
            ? 0
            : firstIncomplete
        );
      }

      // Find first incomplete tool
      if (data.stage === "tools") {
        const firstIncomplete =
          data.tools.findIndex(
            (value) => !value
          );

        setCurrentTool(
          firstIncomplete === -1
            ? 0
            : firstIncomplete
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load machine setup"
      );
    }
  }, []);

  // ---------------------------------------------------
  // INITIALIZE
  // ---------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      setLoading(true);

      await loadSetup();

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadSetup]);

  // ---------------------------------------------------
  // COMMON API ACTION
  // ---------------------------------------------------

  const performAction = useCallback(
    async (
      action: string,
      index?: number,
      extraData?: Record<string, unknown>
    ): Promise<SetupState | null> => {
      try {
        setActionLoading(true);
        setError("");

        const body: Record<string, unknown> = {
          action,
          ...extraData,
        };

        if (typeof index === "number") {
          body.index = index;
        }

        const response = await fetch(
          "/api/setup",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        const result =
          (await response.json()) as ApiResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message || "Action failed"
          );
        }

        const data = result.data;

        setSetup(data);
        setupRef.current = data;

        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Action failed"
        );

        return null;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  // ---------------------------------------------------
  // MACHINE CHECK HANDLERS
  // ---------------------------------------------------

  const confirmCheck = async () => {
    if (actionLoading) {
      return;
    }

    if (setup.machineChecks[currentCheck]) {
      return;
    }

    await performAction(
      "confirm-check",
      currentCheck
    );
  };

  const nextCheck = () => {
    if (actionLoading) {
      return;
    }

    if (!setup.machineChecks[currentCheck]) {
      return;
    }

    if (
      currentCheck <
      machineChecks.length - 1
    ) {
      setCurrentCheck(
        (previous) => previous + 1
      );
    }
  };

  // ---------------------------------------------------
  // TOOL HANDLERS
  // ---------------------------------------------------

  const confirmTool = async () => {
    if (actionLoading) {
      return;
    }

    if (setup.tools[currentTool]) {
      return;
    }

    await performAction(
      "confirm-tool",
      currentTool
    );
  };

  const nextTool = () => {
    if (actionLoading) {
      return;
    }

    if (!setup.tools[currentTool]) {
      return;
    }

    if (
      currentTool <
      tools.length - 1
    ) {
      setCurrentTool(
        (previous) => previous + 1
      );
    }
  };

  // ---------------------------------------------------
  // WORKPIECE HANDLER
  // ---------------------------------------------------

  const confirmWorkpiece = async () => {
    if (actionLoading) {
      return;
    }

    if (setup.workpieceConfirmed) {
      return;
    }

    await performAction(
      "confirm-workpiece"
    );
  };

  // ---------------------------------------------------
  // OPERATION HANDLERS
  // ---------------------------------------------------

  const proceedOperation = async () => {
    if (actionLoading) {
      return;
    }

    await performAction(
      "proceed-operation"
    );
  };

  const startOperation = async () => {
    if (actionLoading) {
      return;
    }

    if (
      setup.stage !== "operation" ||
      setup.operationProgress >= 100
    ) {
      return;
    }

    completionSavedRef.current = false;

    await performAction(
      "start-operation"
    );
  };

  const stopOperation = async () => {
    if (actionLoading) {
      return;
    }

    if (setup.stage !== "operation") {
      return;
    }

    const current = setupRef.current;

    await performAction(
      "stop-operation",
      undefined,
      {
        progress:
          current.operationProgress,
        elapsedSeconds:
          current.operationElapsedSeconds,
      }
    );
  };

  // ---------------------------------------------------
  // RESET
  // ---------------------------------------------------

  const resetSetup = async () => {
    if (actionLoading) {
      return;
    }

    const result =
      await performAction("reset");

    if (result) {
      setCurrentCheck(0);
      setCurrentTool(0);

      completionSavedRef.current =
        false;
    }
  };

  // ---------------------------------------------------
  // OPERATION TIMER
  // ---------------------------------------------------

  useEffect(() => {
    const shouldRun =
      setup.stage === "operation" &&
      setup.operationStatus === "RUNNING";

    // Stop timers when operation is not running
    if (!shouldRun) {
      if (operationTimerRef.current) {
        clearInterval(
          operationTimerRef.current
        );

        operationTimerRef.current = null;
      }

      if (progressSaveRef.current) {
        clearInterval(
          progressSaveRef.current
        );

        progressSaveRef.current = null;
      }

      return;
    }

    // -----------------------------------------------
    // LOCAL TIMER
    // -----------------------------------------------

    if (!operationTimerRef.current) {
      operationTimerRef.current =
        setInterval(() => {
          setSetup((previous) => {
            if (
              previous.stage !==
                "operation" ||
              previous.operationStatus !==
                "RUNNING"
            ) {
              return previous;
            }

            const nextElapsed =
              previous.operationElapsedSeconds +
              1;

            const nextProgress = Math.min(
              100,
              Math.floor(
                (nextElapsed / 300) * 100
              )
            );

            const nextState: SetupState = {
              ...previous,
              operationProgress:
                nextProgress,
              operationElapsedSeconds:
                nextElapsed,
              operationStatus:
                nextProgress >= 100
                  ? "STOPPED"
                  : "RUNNING",
            };

            setupRef.current =
              nextState;

            return nextState;
          });
        }, 1000);
    }

    // -----------------------------------------------
    // SAVE PROGRESS EVERY 5 SECONDS
    // -----------------------------------------------

    if (!progressSaveRef.current) {
      progressSaveRef.current =
        setInterval(async () => {
          const current =
            setupRef.current;

          if (
            current.stage !==
              "operation" ||
            current.operationStatus !==
              "RUNNING"
          ) {
            return;
          }

          try {
            const response =
              await fetch("/api/setup", {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  action:
                    "update-operation",
                  progress:
                    current.operationProgress,
                  elapsedSeconds:
                    current.operationElapsedSeconds,
                }),
              });

            if (!response.ok) {
              return;
            }

            const result =
              (await response.json()) as ApiResponse;

            if (
              !result.success ||
              !result.data
            ) {
              return;
            }

            const serverState =
              result.data;

            setSetup((previous) => {
              // Prevent stale server data
              // from moving the timer backwards.
              if (
                serverState.operationElapsedSeconds <
                previous.operationElapsedSeconds
              ) {
                return previous;
              }

              setupRef.current =
                serverState;

              return serverState;
            });
          } catch {
            // Keep local operation running
            // if saving fails.
          }
        }, 5000);
    }

    // -----------------------------------------------
    // CLEANUP
    // -----------------------------------------------

    return () => {
      if (operationTimerRef.current) {
        clearInterval(
          operationTimerRef.current
        );

        operationTimerRef.current = null;
      }

      if (progressSaveRef.current) {
        clearInterval(
          progressSaveRef.current
        );

        progressSaveRef.current = null;
      }
    };
  }, [
    setup.stage,
    setup.operationStatus,
  ]);

  // ---------------------------------------------------
  // SAVE COMPLETED OPERATION
  // ---------------------------------------------------

  useEffect(() => {
    if (
      setup.stage !== "operation" ||
      setup.operationProgress < 100 ||
      setup.operationStatus !==
        "STOPPED"
    ) {
      return;
    }

    if (completionSavedRef.current) {
      return;
    }

    completionSavedRef.current = true;

    let cancelled = false;

    async function saveCompletedOperation() {
      try {
        const response =
          await fetch("/api/setup", {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action:
                "update-operation",
              progress: 100,
              elapsedSeconds:
                setup.operationElapsedSeconds,
            }),
          });

        if (!response.ok) {
          completionSavedRef.current =
            false;

          return;
        }

        const result =
          (await response.json()) as ApiResponse;

        if (
          !cancelled &&
          result.success &&
          result.data
        ) {
          setSetup(result.data);

          setupRef.current =
            result.data;
        }
      } catch {
        completionSavedRef.current =
          false;
      }
    }

    saveCompletedOperation();

    return () => {
      cancelled = true;
    };
  }, [
    setup.stage,
    setup.operationProgress,
    setup.operationStatus,
    setup.operationElapsedSeconds,
  ]);

  // ---------------------------------------------------
  // BACKEND POLLING
  // ---------------------------------------------------

  useEffect(() => {
    if (
      setup.stage !== "operation" ||
      setup.operationStatus !==
        "RUNNING"
    ) {
      return;
    }

    const interval =
      setInterval(async () => {
        try {
          const response =
            await fetch("/api/setup", {
              method: "GET",
              cache: "no-store",
            });

          if (!response.ok) {
            return;
          }

          const result =
            (await response.json()) as ApiResponse;

          if (
            !result.success ||
            !result.data
          ) {
            return;
          }

          const serverState =
            result.data;

          setSetup((previous) => {
            // Don't allow stale server
            // response to move timer backwards.
            if (
              serverState.operationElapsedSeconds <
              previous.operationElapsedSeconds
            ) {
              return previous;
            }

            setupRef.current =
              serverState;

            return serverState;
          });
        } catch {
          // Ignore temporary
          // polling failures.
        }
      }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [
    setup.stage,
    setup.operationStatus,
  ]);

  // ---------------------------------------------------
  // CALCULATE PROGRESS
  // ---------------------------------------------------

  const checkConfirmed =
    setup.machineChecks[
      currentCheck
    ] ?? false;

  const toolConfirmed =
    setup.tools[currentTool] ?? false;

  const checksCompleted =
    setup.machineChecks.filter(
      Boolean
    ).length;

  const toolsCompleted =
    setup.tools.filter(Boolean).length;

  const progress =
    setup.stage === "checks"
      ? (checksCompleted /
          machineChecks.length) *
        20
      : setup.stage === "tools"
      ? 20 +
        (toolsCompleted /
          tools.length) *
          20
      : setup.stage ===
        "workpiece"
      ? 60
      : setup.stage === "ready"
      ? 80
      : 100;

  // ---------------------------------------------------
  // STAGE TITLE
  // ---------------------------------------------------

  const stageTitle =
    setup.stage === "checks"
      ? "Machine Checks"
      : setup.stage === "tools"
      ? "Tool Setup"
      : setup.stage === "workpiece"
      ? "Workpiece Setup"
      : setup.stage === "ready"
      ? "Ready Review"
      : "Operation";

  // ---------------------------------------------------
  // STAGE SUBTITLE
  // ---------------------------------------------------

  const stageSubtitle =
    setup.stage === "checks"
      ? `${Math.min(
          currentCheck + 1,
          machineChecks.length
        )} of ${
          machineChecks.length
        }`
      : setup.stage === "tools"
      ? `${Math.min(
          currentTool + 1,
          tools.length
        )} of ${tools.length}`
      : setup.stage ===
        "workpiece"
      ? "Complete"
      : setup.stage === "ready"
      ? "Final Review"
      : setup.operationStatus;

  // ---------------------------------------------------
  // LOADING SCREEN
  // ---------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Header
          operationStatus={
            setup.operationStatus
          }
        />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="rounded-2xl bg-white px-8 py-7 shadow-sm">
            <p className="font-semibold text-slate-700">
              Loading machine setup...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        operationStatus={
          setup.operationStatus
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* -------------------------------------------
            ERROR MESSAGE
        ------------------------------------------- */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {/* -------------------------------------------
            PROGRESS HEADER
        ------------------------------------------- */}

        <div className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-4">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {stageTitle}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {stageSubtitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetSetup}
              disabled={actionLoading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              RESET
            </button>

          </div>

          <ProgressBar
            progress={progress}
          />
        </div>

        {/* -------------------------------------------
            MACHINE STATUS
        ------------------------------------------- */}

        <MachineStatus
          operationStatus={
            setup.operationStatus
          }
        />

        {/* -------------------------------------------
            MACHINE CHECKS
        ------------------------------------------- */}

        {setup.stage === "checks" && (
          <MachineChecks
            checks={machineChecks}
            currentCheck={currentCheck}
            confirmed={checkConfirmed}
            loading={actionLoading}
            onConfirm={confirmCheck}
            onNext={nextCheck}
          />
        )}

        {/* -------------------------------------------
            TOOL SETUP
        ------------------------------------------- */}

        {setup.stage === "tools" && (
          <ToolSetup
            tools={tools}
            currentTool={currentTool}
            confirmed={toolConfirmed}
            loading={actionLoading}
            onConfirm={confirmTool}
            onNext={nextTool}
          />
        )}

        {/* -------------------------------------------
            WORKPIECE SETUP
        ------------------------------------------- */}

        {setup.stage ===
          "workpiece" && (
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
                Confirm that the AL
                6061-T6 workpiece is
                correctly positioned,
                clamped, and aligned
                with work offset G54.
              </p>

              <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-3">

                {/* Material */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Material
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    AL 6061-T6
                  </p>
                </div>

                {/* Work Offset */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Work Offset
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    G54
                  </p>
                </div>

                {/* Machine */}
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
                type="button"
                onClick={
                  confirmWorkpiece
                }
                disabled={
                  setup.workpieceConfirmed ||
                  actionLoading
                }
                className="mt-8 min-h-14 rounded-xl bg-blue-600 px-8 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                {setup.workpieceConfirmed
                  ? "WORKPIECE CONFIRMED"
                  : actionLoading
                  ? "PROCESSING..."
                  : "CONFIRM WORKPIECE SETUP"}
              </button>

            </div>
          </section>
        )}

        {/* -------------------------------------------
            READY REVIEW
        ------------------------------------------- */}

        {setup.stage === "ready" && (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">

            <div className="text-center">

              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Final Review
              </p>

              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Machine Ready
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                All machine checks,
                tools, and workpiece
                setup have been
                completed. Review the
                operation details before
                opening the operation
                screen.
              </p>

              <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-slate-50 p-6 text-left">

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Machine */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Machine
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      VMC-01
                    </p>
                  </div>

                  {/* Operation */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Operation
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      Aluminum Housing
                      Roughing
                    </p>
                  </div>

                  {/* CNC Program */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      CNC Program
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      OPR-2048 Rev 3
                    </p>
                  </div>

                  {/* Material */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Material
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      AL 6061-T6
                    </p>
                  </div>

                  {/* Work Offset */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Work Offset
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      G54
                    </p>
                  </div>

                  {/* Machine Status */}
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Machine Status
                    </p>

                    <p className="mt-1 font-bold text-emerald-600">
                      READY
                    </p>
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={
                  proceedOperation
                }
                disabled={actionLoading}
                className="mt-8 min-h-14 rounded-xl bg-blue-600 px-8 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "OPENING..."
                  : "PROCEED TO OPERATION"}
              </button>

            </div>
          </section>
        )}

        {/* -------------------------------------------
            OPERATION
        ------------------------------------------- */}

        {setup.stage ===
          "operation" && (
          <OperationPanel
            operationStatus={
              setup.operationStatus
            }
            operationProgress={
              setup.operationProgress
            }
            operationElapsedSeconds={
              setup.operationElapsedSeconds
            }
            loading={actionLoading}
            onStart={startOperation}
            onStop={stopOperation}
          />
        )}

        {/* -------------------------------------------
            STAGE NAVIGATION
        ------------------------------------------- */}

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide">

            {/* Machine Checks */}
            <span
              className={
                setup.stage === "checks"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              MACHINE CHECKS
            </span>

            <span className="text-slate-300">
              →
            </span>

            {/* Tools */}
            <span
              className={
                setup.stage === "tools"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              TOOLS
            </span>

            <span className="text-slate-300">
              →
            </span>

            {/* Workpiece */}
            <span
              className={
                setup.stage ===
                "workpiece"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              WORKPIECE
            </span>

            <span className="text-slate-300">
              →
            </span>

            {/* Ready */}
            <span
              className={
                setup.stage === "ready"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              READY
            </span>

            <span className="text-slate-300">
              →
            </span>

            {/* Operation */}
            <span
              className={
                setup.stage ===
                "operation"
                  ? "text-blue-600"
                  : "text-slate-400"
              }
            >
              OPERATION
            </span>

          </div>
        </div>

        {/* -------------------------------------------
            SUMMARY
        ------------------------------------------- */}

        <div className="mt-6 text-center text-sm font-medium text-slate-500">
          Checks:{" "}
          {checksCompleted}/
          {machineChecks.length}

          {" · "}

          Tools:{" "}
          {toolsCompleted}/
          {tools.length}

          {" · "}

          Workpiece:{" "}
          {setup.workpieceConfirmed
            ? "CONFIRMED"
            : "PENDING"}
        </div>

      </div>
    </main>
  );
}