import { NextResponse } from "next/server";
import db from "@/lib/db";

type OperationStatus = "READY" | "RUNNING" | "STOPPED";

type Stage =
  | "checks"
  | "tools"
  | "workpiece"
  | "ready"
  | "operation";

type SetupState = {
  machineChecks: boolean[];
  tools: boolean[];
  workpieceConfirmed: boolean;
  stage: Stage;
  operationStatus: OperationStatus;
};

function getSetupState(): SetupState {
  const row = db
    .prepare("SELECT * FROM setup_state WHERE id = 1")
    .get() as {
      id: number;
      machine_checks: string;
      tools: string;
      workpiece_confirmed: number;
      stage: Stage;
      operation_status: OperationStatus;
    };

  return {
    machineChecks: JSON.parse(row.machine_checks),
    tools: JSON.parse(row.tools),
    workpieceConfirmed: Boolean(row.workpiece_confirmed),
    stage: row.stage,
    operationStatus: row.operation_status,
  };
}

function saveSetupState(state: SetupState) {
  db.prepare(`
    UPDATE setup_state
    SET
      machine_checks = ?,
      tools = ?,
      workpiece_confirmed = ?,
      stage = ?,
      operation_status = ?
    WHERE id = 1
  `).run(
    JSON.stringify(state.machineChecks),
    JSON.stringify(state.tools),
    state.workpieceConfirmed ? 1 : 0,
    state.stage,
    state.operationStatus
  );
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getSetupState(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const setupState = getSetupState();

    if (body.action === "reset") {
      const resetState: SetupState = {
        machineChecks: [false, false, false, false, false, false],
        tools: [false, false, false, false],
        workpieceConfirmed: false,
        stage: "checks",
        operationStatus: "READY",
      };

      saveSetupState(resetState);

      return NextResponse.json({
        success: true,
        message: "Setup reset successfully",
        data: resetState,
      });
    }

    if (body.action === "confirm-check") {
      const index = Number(body.index);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= setupState.machineChecks.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid machine check index",
          },
          { status: 400 }
        );
      }

      setupState.machineChecks[index] = true;

      if (setupState.machineChecks.every(Boolean)) {
        setupState.stage = "tools";
      }

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Machine check confirmed",
        data: setupState,
      });
    }

    if (body.action === "confirm-tool") {
      const index = Number(body.index);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= setupState.tools.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid tool index",
          },
          { status: 400 }
        );
      }

      if (!setupState.machineChecks.every(Boolean)) {
        return NextResponse.json(
          {
            success: false,
            message: "Machine checks are incomplete",
          },
          { status: 400 }
        );
      }

      setupState.tools[index] = true;

      if (setupState.tools.every(Boolean)) {
        setupState.stage = "workpiece";
      }

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Tool confirmed",
        data: setupState,
      });
    }

    if (body.action === "confirm-workpiece") {
      if (!setupState.machineChecks.every(Boolean)) {
        return NextResponse.json(
          {
            success: false,
            message: "Machine checks are incomplete",
          },
          { status: 400 }
        );
      }

      if (!setupState.tools.every(Boolean)) {
        return NextResponse.json(
          {
            success: false,
            message: "Tool setup is incomplete",
          },
          { status: 400 }
        );
      }

      setupState.workpieceConfirmed = true;
      setupState.stage = "ready";

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Workpiece setup confirmed",
        data: setupState,
      });
    }

    if (body.action === "proceed-operation") {
      const machineReady = setupState.machineChecks.every(Boolean);
      const toolsReady = setupState.tools.every(Boolean);
      const workpieceReady = setupState.workpieceConfirmed;

      if (!machineReady || !toolsReady || !workpieceReady) {
        return NextResponse.json(
          {
            success: false,
            message: "Setup is not complete",
          },
          { status: 400 }
        );
      }

      setupState.stage = "operation";
      setupState.operationStatus = "READY";

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Operation stage opened",
        data: setupState,
      });
    }

    if (body.action === "start-operation") {
      const machineReady = setupState.machineChecks.every(Boolean);
      const toolsReady = setupState.tools.every(Boolean);
      const workpieceReady = setupState.workpieceConfirmed;

      if (!machineReady || !toolsReady || !workpieceReady) {
        return NextResponse.json(
          {
            success: false,
            message: "Machine setup is incomplete",
          },
          { status: 400 }
        );
      }

      if (setupState.stage !== "operation") {
        return NextResponse.json(
          {
            success: false,
            message: "Operation stage has not been opened",
          },
          { status: 400 }
        );
      }

      setupState.operationStatus = "RUNNING";

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Operation started",
        data: setupState,
      });
    }

    if (body.action === "stop-operation") {
      if (setupState.stage !== "operation") {
        return NextResponse.json(
          {
            success: false,
            message: "Operation stage has not been opened",
          },
          { status: 400 }
        );
      }

      setupState.operationStatus = "STOPPED";

      saveSetupState(setupState);

      return NextResponse.json({
        success: true,
        message: "Operation stopped",
        data: setupState,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unknown action",
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request",
      },
      { status: 400 }
    );
  }
}