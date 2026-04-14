import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DeadlineCountdown({ deadline }: { deadline: string }) {
  const days = differenceInDays(new Date(deadline), new Date());
  const expired = days < 0;
  const color = expired ? "bg-muted text-muted-foreground" : days < 7 ? "bg-destructive/10 text-destructive" : days < 30 ? "bg-warning/10 text-warning-foreground" : "bg-success/10 text-success";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", color)}>
      {expired ? "Expired" : `${days}d left`}
      <span className="hidden sm:inline">· {format(new Date(deadline), "dd MMM yyyy")}</span>
    </span>
  );
}
