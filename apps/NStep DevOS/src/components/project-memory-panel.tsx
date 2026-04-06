import { buildProjectOperationalMemory } from "@/lib/project-memory";
import { Project, Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function MemoryGroup({
  title,
  entries,
}: {
  title: string;
  entries: ReturnType<typeof buildProjectOperationalMemory>["taskHistory"];
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      {entries.length > 0 ? (
        <div className="mt-3 space-y-3">
          {entries.map((entry, index) => (
            <div
              key={`${title}-${entry.title}-${index}`}
              className="rounded-2xl border border-white/8 bg-white/4 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold text-white">{entry.title}</p>
                {entry.timestamp ? (
                  <p className="text-xs text-slate-400">{formatDate(entry.timestamp)}</p>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{entry.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-400">No stored memory yet.</p>
      )}
    </div>
  );
}

export function ProjectMemoryPanel({
  project,
  task,
}: {
  project: Project;
  task: Task;
}) {
  const memory = buildProjectOperationalMemory(project, task);

  return (
    <div className="panel rounded-[1.8rem] p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
        Project memory
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        NSS keeps the recent operational history for this task and project, then reuses that
        memory in the next prompt.
      </p>
      <div className="mt-5 space-y-5">
        <MemoryGroup entries={memory.taskHistory} title="Recent task history" />
        <MemoryGroup entries={memory.interventions} title="Recent interventions" />
        <MemoryGroup entries={memory.projectHistory} title="Recent project decisions" />
      </div>
    </div>
  );
}
