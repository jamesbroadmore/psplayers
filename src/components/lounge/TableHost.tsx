import { AI_CHARACTERS, getAICharacter, hostLine } from "@/lib/lounge/characters";
import { useCasino } from "@/lib/lounge/store";

export function TableHost() {
  const hostId = useCasino((state) => state.hostId);
  const setHost = useCasino((state) => state.setHost);
  const moment = useCasino((state) => state.hostMoment);
  const beat = useCasino((state) => state.hostBeat);
  const host = getAICharacter(hostId);
  const line = moment ? hostLine(hostId, moment, beat) : host.idle;

  return (
    <section className="mb-4 overflow-hidden rounded-card border border-line bg-graphite" aria-label="Table host">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <img src={host.portrait} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-brand text-pink">
            {moment === "win" ? "WINNER'S EAR" : moment === "loss" ? "AFTER THE HAND" : "TONIGHT'S HOST"}
          </p>
          <p className="mt-1 font-display text-xl text-gold">{host.name}</p>
          <p className="text-xs text-mist">{host.title} · {host.age}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink" aria-live="polite">&ldquo;{line}&rdquo;</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3">
        {AI_CHARACTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === hostId}
            onClick={() => setHost(option.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-2 py-1 ${option.id === hostId ? "border-gold bg-gold/10" : "border-line"}`}
          >
            <img src={option.portrait} alt="" className="size-8 rounded-full object-cover" />
            <span className="pr-2 text-xs font-semibold text-ink">{option.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
