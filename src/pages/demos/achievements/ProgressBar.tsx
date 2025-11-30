import { Card } from "@/components/Card";

interface ProgressBarProps {
  progress: number;
  unlockedCount: number;
  totalCount: number;
}

export function ProgressBar({
  progress,
  unlockedCount,
  totalCount,
}: ProgressBarProps) {
  return (
    <Card className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-text">Overall Progress</span>
        <span className="text-sm text-text-muted">
          {unlockedCount} / {totalCount} achievements
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-right text-sm font-medium text-primary">
        {progress}%
      </div>
    </Card>
  );
}
