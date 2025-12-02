import { Card } from "@/components/Card";
import type { VMState } from "@/types";

interface VMStatePanelProps {
  snapshot: VMState | null;
}

export function VMStatePanel({ snapshot }: VMStatePanelProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text">VM State</h2>
      {snapshot ? (
        <div className="space-y-3 font-mono text-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-muted">Position</span>
            <span className="text-text">
              ({snapshot.position.x.toFixed(1)},{" "}
              {snapshot.position.y.toFixed(1)})
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-muted">Rotation</span>
            <span className="text-text">{snapshot.rotation.toFixed(1)}deg</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-muted">Scale</span>
            <span className="text-text">{snapshot.scale.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-muted">Color (HSL)</span>
            <span className="text-text">
              {snapshot.color.h.toFixed(0)}, {snapshot.color.s.toFixed(0)}%,{" "}
              {snapshot.color.l.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-text-muted">Instructions</span>
            <span className="text-text">{snapshot.instructionCount}</span>
          </div>
          <div>
            <span className="text-text-muted">Stack</span>
            <div className="mt-1 rounded bg-dark-bg p-2 text-dark-text">
              {snapshot.stack.length > 0
                ? `[${snapshot.stack.join(", ")}]`
                : "(empty)"}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-text-muted">
          Run genome to see state snapshots
        </div>
      )}
    </Card>
  );
}
