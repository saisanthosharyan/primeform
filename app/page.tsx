"use client";

import { useEffect, useState } from "react";
import MachineStatus from "./components/MachineStatus";

type Stage =
  | "checks"
  | "tools"
  | "workpiece"
  | "ready"
  | "operation";

type OperationStatus = "READY" | "RUNNING" | "STOPPED";

type SetupState = {
  machineChecks: boolean[];
  tools: boolean[];
  workpieceConfirmed: boolean;
  stage: Stage;
  operationStatus: OperationStatus;
};

const machineChecks = [
  {
    title: "Power / Control Available",
    description:
      "Confirm that machine power and CNC control are available.",
  },
  {
    title: "E-Stop Released",
    description:
      "Confirm that the emergency stop button is released and the machine can operate.",
  },
  {
    title: "Guard / Door Closed",
    description:
      "Confirm that all machine guards and doors are securely closed.",
  },
  {
    title: "No Active Alarm",
    description:
      "Confirm that the CNC control shows no active machine alarms.",
  },
  {
    title: "Lubrication / Coolant Ready",
    description:
      "Confirm that lubrication and coolant systems are ready for operation.",
  },
  {
    title: "Reference Return Complete",
    description:
      "Confirm that the machine has completed reference return.",
  },
];

const tools = [
  {
    number: "T01",
    type: "Ø16 mm Carbide End Mill",
    purpose: "Roughing",
  },
  {
    number: "T02",
    type: "Ø8 mm Carbide End Mill",
    purpose: "Finishing",
  },
  {
    number: "T03",
    type: "Ø6 mm Drill",
    purpose: "Drilling",
  },
  {
    number: "T04",
    type: "Ø10 mm Chamfer Mill",
    purpose: "Chamfering",
  },
];

const workpiece = {
  name: "Aluminum Housing",
  material: "AL 6061-T6",
  drawing: "DWG-2048",
  revision: "Rev C",
  fixture: "4-jaw hydraulic fixture",
  orientation: "Datum A facing operator",
  clamping:
    "Engage all four jaws and verify secure seating before proceeding.",
  workOffset: "G54",
};

const initialState: SetupState = {
  machineChecks: new Array(machineChecks.length).fill(false),
  tools: new Array(tools.length).fill(false),
  workpieceConfirmed: false,
  stage: "checks",
  operationStatus: "READY",
};

export default function Home() {
  const [setup, setSetup] = useState<SetupState>(initialState);

  const [currentCheck, setCurrentCheck] = useState(0);
  const [currentTool, setCurrentTool] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const currentCheckItem = machineChecks[currentCheck];
  const currentToolItem = tools[currentTool];

  const checkConfirmed =
    setup.machineChecks[currentCheck] ?? false;

  const toolConfirmed =
    setup.tools[currentTool] ?? false;

  const allChecksConfirmed =
    setup.machineChecks.every(Boolean);

  const allToolsConfirmed =
    setup.tools.every(Boolean);

  async function loadSetup() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/setup", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load setup state."
        );
      }

      setSetup(result.data);

      if (result.data.stage === "checks") {
        const firstIncomplete =
          result.data.machineChecks.findIndex(
            (value: boolean) => !value
          );

        setCurrentCheck(
          firstIncomplete === -1 ? 0 : firstIncomplete
        );
      }

      if (result.data.stage === "tools") {
        const firstIncomplete =
          result.data.tools.findIndex(
            (value: boolean) => !value
          );

        setCurrentTool(
          firstIncomplete === -1 ? 0 : firstIncomplete
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the setup API."
      );
    } finally {
      setLoading(false);
    }
  }

  async function performAction(
    action: string,
    index?: number
  ) {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          index === undefined
            ? { action }
            : { action, index }
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Action could not be completed."
        );
      }

      setSetup(result.data);

      return result.data as SetupState;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );

      return null;
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadSetup();
  }, []);

  async function confirmCheck() {
    await performAction("confirm-check", currentCheck);
  }

  async function nextCheck() {
    if (!checkConfirmed || actionLoading) return;

    if (currentCheck < machineChecks.length - 1) {
      setCurrentCheck((previous) => previous + 1);
      return;
    }

    const updated = await performAction(
      "confirm-check",
      currentCheck
    );

    if (updated?.stage === "tools") {
      setCurrentTool(0);
    }
  }

  async function confirmTool() {
    await performAction("confirm-tool", currentTool);
  }

  async function nextTool() {
    if (!toolConfirmed || actionLoading) return;

    if (currentTool < tools.length - 1) {
      setCurrentTool((previous) => previous + 1);
      return;
    }

    const updated = await performAction(
      "confirm-tool",
      currentTool
    );

    if (updated?.stage === "workpiece") {
      // Workpiece stage is now active.
    }
  }

  async function confirmWorkpiece() {
    await performAction("confirm-workpiece");
  }

  async function proceedToOperation() {
    await performAction("proceed-operation");
  }

  async function startOperation() {
    await performAction("start-operation");
  }

  async function stopOperation() {
    await performAction("stop-operation");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-700">
            Loading VMC setup...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-300 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              VMC Operator HMI
            </p>

            <h1 className="mt-1 text-xl font-bold">
              VMC-01
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            POWER ON
          </div>
        </div>
      </header>

      {/* PROGRESS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {setup.stage === "checks"
                ? "Machine Checks"
                : setup.stage === "tools"
                  ? "Required Tools"
                  : setup.stage === "workpiece"
                    ? "Workpiece Setup"
                    : setup.stage === "ready"
                      ? "Ready Review"
                      : "Operation"}
            </p>

            <p className="text-sm font-medium text-slate-500">
              {setup.stage === "checks"
                ? `${currentCheck + 1} of ${machineChecks.length}`
                : setup.stage === "tools"
                  ? `${currentTool + 1} of ${tools.length}`
                  : setup.stage === "workpiece"
                    ? "Complete"
                    : setup.stage === "ready"
                      ? "Final Review"
                      : setup.operationStatus}
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <div
              className={`h-2 flex-1 rounded-full ${
                allChecksConfirmed
                  ? "bg-emerald-500"
                  : setup.stage === "checks"
                    ? "bg-blue-600"
                    : "bg-slate-200"
              }`}
            />

            <div
              className={`h-2 flex-1 rounded-full ${
                allToolsConfirmed
                  ? "bg-emerald-500"
                  : setup.stage === "tools"
                    ? "bg-blue-600"
                    : "bg-slate-200"
              }`}
            />

            <div
              className={`h-2 flex-1 rounded-full ${
                setup.workpieceConfirmed
                  ? "bg-emerald-500"
                  : setup.stage === "workpiece"
                    ? "bg-blue-600"
                    : "bg-slate-200"
              }`}
            />

            <div
              className={`h-2 flex-1 rounded-full ${
                setup.stage === "ready" ||
                setup.stage === "operation"
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mx-auto max-w-4xl px-5 pt-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-700">
            {error}
          </div>
        </div>
      )}
      {/* MACHINE STATUS */}
      <div className="mx-auto max-w-4xl px-5 pt-6">
        <MachineStatus status={setup.operationStatus} />
      </div>

      {/* MAIN */}
      <section className="mx-auto flex min-h-[calc(100vh-150px)] max-w-4xl items-center px-5 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          {/* MACHINE CHECKS */}
          {setup.stage === "checks" && (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Machine Check
              </p>

              <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-600">
                {currentCheck + 1}
              </div>

              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                {currentCheckItem.title}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {currentCheckItem.description}
              </p>

              <div className="mt-8">
                {checkConfirmed ? (
                  <div className="inline-flex rounded-lg bg-emerald-50 px-5 py-3 font-bold text-emerald-700">
                    ✓ CHECK CONFIRMED
                  </div>
                ) : (
                  <div className="inline-flex rounded-lg bg-amber-50 px-5 py-3 font-bold text-amber-700">
                    ● ACTION REQUIRED
                  </div>
                )}
              </div>

              <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
                <button
                  onClick={confirmCheck}
                  disabled={checkConfirmed || actionLoading}
                  className={`min-h-14 rounded-xl px-6 text-base font-bold ${
                    checkConfirmed || actionLoading
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {checkConfirmed
                    ? "✓ CHECK CONFIRMED"
                    : actionLoading
                      ? "CONFIRMING..."
                      : "CONFIRM CHECK"}
                </button>

                <button
                  onClick={nextCheck}
                  disabled={!checkConfirmed || actionLoading}
                  className={`min-h-14 rounded-xl border px-6 text-base font-bold ${
                    checkConfirmed && !actionLoading
                      ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentCheck < machineChecks.length - 1
                    ? "NEXT CHECK →"
                    : "CONTINUE TO TOOLS →"}
                </button>
              </div>
            </div>
          )}

          {/* TOOLS */}
          {setup.stage === "tools" && (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Required Tool
              </p>

              <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-600">
                {currentToolItem.number}
              </div>

              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                {currentToolItem.type}
              </h2>

              <p className="mt-3 text-lg font-semibold text-slate-700">
                Purpose: {currentToolItem.purpose}
              </p>

              <div className="mx-auto mt-6 max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">
                    Tool Number
                  </span>

                  <span className="font-bold">
                    {currentToolItem.number}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-3">
                  <span className="text-slate-500">
                    Tool Type
                  </span>

                  <span className="font-bold">
                    {currentToolItem.type}
                  </span>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-slate-500">
                    CNC Program
                  </span>

                  <span className="font-bold">
                    OPR-2048 Rev 3
                  </span>
                </div>
              </div>

              <div className="mt-8">
                {toolConfirmed ? (
                  <div className="inline-flex rounded-lg bg-emerald-50 px-5 py-3 font-bold text-emerald-700">
                    ✓ TOOL CONFIRMED
                  </div>
                ) : (
                  <div className="inline-flex rounded-lg bg-amber-50 px-5 py-3 font-bold text-amber-700">
                    ● INSERT TOOL
                  </div>
                )}
              </div>

              <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
                <button
                  onClick={confirmTool}
                  disabled={toolConfirmed || actionLoading}
                  className={`min-h-14 rounded-xl px-6 text-base font-bold ${
                    toolConfirmed || actionLoading
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {toolConfirmed
                    ? "✓ TOOL CONFIRMED"
                    : actionLoading
                      ? "CONFIRMING..."
                      : "INSERT & CONFIRM TOOL"}
                </button>

                <button
                  onClick={nextTool}
                  disabled={!toolConfirmed || actionLoading}
                  className={`min-h-14 rounded-xl border px-6 text-base font-bold ${
                    toolConfirmed && !actionLoading
                      ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentTool < tools.length - 1
                    ? "NEXT TOOL →"
                    : "CONTINUE TO WORKPIECE →"}
                </button>
              </div>
            </div>
          )}

          {/* WORKPIECE */}
          {setup.stage === "workpiece" && (
            <div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Workpiece Setup
                </p>

                <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl">
                  🔩
                </div>

                <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                  {workpiece.name}
                </h2>

                <p className="mt-3 text-slate-600">
                  Arrange, orient and clamp the workpiece as specified.
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="border-b border-slate-200 p-4 sm:border-r">
                    <p className="text-sm text-slate-500">
                      Material
                    </p>

                    <p className="mt-1 font-bold">
                      {workpiece.material}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 p-4">
                    <p className="text-sm text-slate-500">
                      Drawing
                    </p>

                    <p className="mt-1 font-bold">
                      {workpiece.drawing} {workpiece.revision}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 p-4 sm:border-r">
                    <p className="text-sm text-slate-500">
                      Fixture
                    </p>

                    <p className="mt-1 font-bold">
                      {workpiece.fixture}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 p-4">
                    <p className="text-sm text-slate-500">
                      Work Offset
                    </p>

                    <p className="mt-1 font-bold">
                      {workpiece.workOffset}
                    </p>
                  </div>

                  <div className="border-b border-slate-200 p-4 sm:col-span-2">
                    <p className="text-sm text-slate-500">
                      Orientation
                    </p>

                    <p className="mt-1 font-bold">
                      {workpiece.orientation}
                    </p>
                  </div>

                  <div className="p-4 sm:col-span-2">
                    <p className="text-sm text-slate-500">
                      Clamping Instruction
                    </p>

                    <p className="mt-1 font-bold leading-6">
                      {workpiece.clamping}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                {setup.workpieceConfirmed ? (
                  <div className="inline-flex rounded-lg bg-emerald-50 px-5 py-3 font-bold text-emerald-700">
                    ✓ WORKPIECE SETUP CONFIRMED
                  </div>
                ) : (
                  <div className="inline-flex rounded-lg bg-amber-50 px-5 py-3 font-bold text-amber-700">
                    ● SETUP REQUIRED
                  </div>
                )}
              </div>

              <div className="mx-auto mt-8 max-w-md">
                <button
                  onClick={confirmWorkpiece}
                  disabled={
                    setup.workpieceConfirmed ||
                    actionLoading
                  }
                  className={`min-h-14 w-full rounded-xl px-6 text-base font-bold ${
                    setup.workpieceConfirmed ||
                    actionLoading
                      ? "cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {setup.workpieceConfirmed
                    ? "✓ SETUP CONFIRMED"
                    : actionLoading
                      ? "CONFIRMING..."
                      : "CONFIRM WORKPIECE SETUP"}
                </button>
              </div>

              {setup.workpieceConfirmed && (
                <div className="mx-auto mt-4 max-w-md">
                  <button
                    onClick={proceedToOperation}
                    disabled={actionLoading}
                    className="min-h-14 w-full rounded-xl border border-slate-300 bg-white px-6 text-base font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    PROCEED TO READY REVIEW →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* READY REVIEW */}
          {setup.stage === "ready" && (
            <div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Final Readiness Review
                </p>

                <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">
                  ✓
                </div>

                <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                  READY
                </h2>

                <p className="mt-3 text-slate-600">
                  All required machine, tooling and workpiece arrangements
                  are complete.
                </p>
              </div>

              <div className="mt-10 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="font-semibold">
                    Machine Checks
                  </span>

                  <span className="font-bold text-emerald-700">
                    ✓ COMPLETE
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="font-semibold">
                    Required Tools
                  </span>

                  <span className="font-bold text-emerald-700">
                    ✓ COMPLETE
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <span className="font-semibold">
                    Workpiece Setup
                  </span>

                  <span className="font-bold text-emerald-700">
                    ✓ COMPLETE
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold">
                  Operation Details
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Machine
                    </span>

                    <span className="font-bold">
                      VMC-01
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Operation
                    </span>

                    <span className="text-right font-bold">
                      Aluminum Housing Roughing
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      CNC Program
                    </span>

                    <span className="font-bold">
                      OPR-2048 Rev 3
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Material
                    </span>

                    <span className="font-bold">
                      AL 6061-T6
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Drawing
                    </span>

                    <span className="font-bold">
                      DWG-2048 Rev C
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Fixture
                    </span>

                    <span className="text-right font-bold">
                      4-jaw hydraulic fixture
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Work Offset
                    </span>

                    <span className="font-bold">
                      G54
                    </span>
                  </div>
                </div>
              </div>

              <div className="mx-auto mt-10 max-w-md">
                <button
                  onClick={proceedToOperation}
                  disabled={actionLoading}
                  className="min-h-16 w-full rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading
                    ? "OPENING OPERATION..."
                    : "PROCEED TO OPERATION →"}
                </button>
              </div>
            </div>
          )}

          {/* OPERATION */}
          {setup.stage === "operation" && (
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                VMC Operation
              </p>

              <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                Aluminum Housing Roughing
              </h2>

              <div
                className={`mx-auto mt-8 inline-flex rounded-full px-6 py-3 text-lg font-bold ${
                  setup.operationStatus === "RUNNING"
                    ? "bg-blue-100 text-blue-700"
                    : setup.operationStatus === "STOPPED"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {setup.operationStatus}
              </div>

              <div className="mx-auto mt-10 max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">
                    Machine
                  </span>

                  <span className="font-bold">
                    VMC-01
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-3">
                  <span className="text-slate-500">
                    Operation
                  </span>

                  <span className="text-right font-bold">
                    Aluminum Housing Roughing
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-3">
                  <span className="text-slate-500">
                    CNC Program
                  </span>

                  <span className="font-bold">
                    OPR-2048 Rev 3
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 py-3">
                  <span className="text-slate-500">
                    Material
                  </span>

                  <span className="font-bold">
                    AL 6061-T6
                  </span>
                </div>

                <div className="flex justify-between pt-3">
                  <span className="text-slate-500">
                    Work Offset
                  </span>

                  <span className="font-bold">
                    G54
                  </span>
                </div>
              </div>

              <div className="mt-8">
                {setup.operationStatus === "RUNNING" && (
                  <p className="mb-5 font-semibold text-blue-700">
                    Operation is currently running.
                  </p>
                )}

                {setup.operationStatus === "STOPPED" && (
                  <p className="mb-5 font-semibold text-red-700">
                    Operation stopped. The latest stage has been preserved.
                  </p>
                )}

                {setup.operationStatus === "READY" && (
                  <p className="mb-5 font-semibold text-emerald-700">
                    Machine is ready to start the operation.
                  </p>
                )}

                <div className="mx-auto flex max-w-md flex-col gap-3">
                  {setup.operationStatus !== "RUNNING" && (
                    <button
                      onClick={startOperation}
                      disabled={actionLoading}
                      className="min-h-16 w-full rounded-xl bg-emerald-600 px-6 text-lg font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading
                        ? "STARTING..."
                        : "START OPERATION"}
                    </button>
                  )}

                  {setup.operationStatus === "RUNNING" && (
                    <button
                      onClick={stopOperation}
                      disabled={actionLoading}
                      className="min-h-16 w-full rounded-xl bg-red-600 px-6 text-lg font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading
                        ? "STOPPING..."
                        : "STOP OPERATION"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl overflow-x-auto px-5 py-4">
          <div className="flex min-w-max items-center justify-center gap-3 text-sm font-semibold">
            <span
              className={
                allChecksConfirmed
                  ? "text-emerald-600"
                  : setup.stage === "checks"
                    ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                    : "text-slate-400"
              }
            >
              {allChecksConfirmed
                ? "✓ MACHINE CHECKS"
                : "MACHINE CHECKS"}
            </span>

            <span className="text-slate-300">
              →
            </span>

            <span
              className={
                allToolsConfirmed
                  ? "text-emerald-600"
                  : setup.stage === "tools"
                    ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                    : "text-slate-400"
              }
            >
              {allToolsConfirmed
                ? "✓ TOOLS"
                : "TOOLS"}
            </span>

            <span className="text-slate-300">
              →
            </span>

            <span
              className={
                setup.workpieceConfirmed
                  ? "text-emerald-600"
                  : setup.stage === "workpiece"
                    ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                    : "text-slate-400"
              }
            >
              {setup.workpieceConfirmed
                ? "✓ WORKPIECE"
                : "WORKPIECE"}
            </span>

            <span className="text-slate-300">
              →
            </span>

            <span
              className={
                setup.stage === "ready" ||
                setup.stage === "operation"
                  ? "rounded-full bg-emerald-600 px-4 py-2 text-white"
                  : "text-slate-400"
              }
            >
              {setup.stage === "ready" ||
              setup.stage === "operation"
                ? "✓ READY"
                : "READY"}
            </span>

            <span className="text-slate-300">
              →
            </span>

            <span
              className={
                setup.stage === "operation"
                  ? "rounded-full bg-blue-600 px-4 py-2 text-white"
                  : "text-slate-400"
              }
            >
              OPERATION
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}