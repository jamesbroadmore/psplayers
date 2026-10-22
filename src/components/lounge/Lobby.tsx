import { useLiveClock } from "@/components/lounge/LiveChrome";
import { playCoup } from "@/lib/lounge/baccarat";
import { formatClock, phaseLabel, wheelPocket, type TableId } from "@/lib/lounge/live";
import { toneOf } from "@/lib/lounge/roulette";
import { formatChips, formatDelta, useCasino, type GameId } from "@/lib/lounge/store";

export type Floor = "pokies" | "blackjack" | "roulette" | "baccarat" | "poker" | "crash" | "hilo" | "dice";

const TABLES: {
  id: Floor;
  kicker: string;
  name: string;
  copy: string;
  meta: string;
  art: string;
  pace: "live" | "private";
}[] = [
  {
    id: "pokies",
    kicker: "Three reel",
    name: "Neon 77",
    copy: "Five lines, a wild star, and sevens that pay anywhere.",
    meta: "From 10 chips",
    art: "/art/pokies.jpg",
    pace: "live",
  },
  {
    id: "blackjack",
    kicker: "Six decks",
    name: "The Velvet Hand",
    copy: "Dealer stands on 17. Blackjack pays three to two.",
    meta: "From 50 chips",
    art: "/art/blackjack.jpg",
    pace: "live",
  },
  {
    id: "roulette",
    kicker: "Single zero",
    name: "Midnight Wheel",
    copy: "European wheel. Straights, dozens, and the outside.",
    meta: "Chips from 10",
    art: "/art/roulette.jpg",
    pace: "live",
  },
  {
    id: "baccarat",
    kicker: "Punto banco",
    name: "The Gold Shoe",
    copy: "Player, banker, or the tie. Commission on the banker.",
    meta: "From 25 chips",
    art: "/art/baccarat.jpg",
    pace: "live",
  },
  {
    id: "poker",
    kicker: "Jacks or better",
    name: "Royal Velvet",
    copy: "Five cards. Hold the star hand. A royal pays 800.",
    meta: "From 10 chips",
    art: "/art/poker.jpg",
    pace: "private",
  },
  {
    id: "crash",
    kicker: "Cash out",
    name: "Star Crash",
    copy: "The star climbs. Take the multiplier before it breaks.",
    meta: "From 10 chips",
    art: "/art/crash.jpg",
    pace: "private",
  },
  {
    id: "hilo",
    kicker: "One deck",
    name: "Higher",
    copy: "Call the next card. A tie drops the climb.",
    meta: "From 10 chips",
    art: "/art/hilo.jpg",
    pace: "private",
  },
  {
    id: "dice",
    kicker: "Two dice",
    name: "Pink Dice",
    copy: "Low, high, seven, or any pair.",
    meta: "From 10 chips",
    art: "/art/dice.jpg",
    pace: "private",
  },
];

const GAME_LABEL: Partial<Record<GameId, string>> = {
  pokies: "Neon 77",
  blackjack: "Velvet Hand",
  roulette: "Midnight Wheel",
  baccarat: "Gold Shoe",
  poker: "Royal Velvet",
  crash: "Star Crash",
  hilo: "Higher",
  dice: "Pink Dice",
  comp: "House",
};

export function Lobby({ onPlay }: { onPlay: (floor: Floor) => void }) {
  const ledger = useCasino((s) => s.ledger);
  const balance = useCasino((s) => s.balance);

  return (
    <div className="pb-16">
      <section className="hero-frame relative isolate flex flex-col justify-end overflow-hidden rounded-card border border-gold/40">
        <img src="/art/hero.jpg" alt="" className="hero-still absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/20 sm:bg-gradient-to-r sm:from-midnight sm:via-midnight/75 sm:to-transparent" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-12">
          <img
            src="/brand/wordmark-full-colour.svg"
            alt="Pornstar Players"
            className="h-16 w-auto max-w-xs sm:h-24"
          />
          <p className="mt-6 text-xs font-semibold tracking-brand text-pink">LIVE FLOOR</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            <span className="gold-text">Real stars.</span>
            <span className="mt-1 block">The tables are live.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink sm:text-base">
            {formatChips(balance)} chips on the rack. Rounds close on a clock. Sit in, or watch them go by.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-brand text-gold">
            REAL STARS. REAL GAMES. REAL REWARDS.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TABLES.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => onPlay(table.id)}
                className="min-h-11 rounded-full border border-gold/70 bg-midnight/50 px-4 text-sm font-semibold text-gold backdrop-blur-sm hover:bg-gold hover:text-midnight"
              >
                {table.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <FloorTape />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TABLES.map((table) =>
          table.pace === "live" ? (
            <LiveCard key={table.id} table={table} onPlay={onPlay} />
          ) : (
            <PrivateCard key={table.id} table={table} onPlay={onPlay} />
          ),
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="font-display text-2xl text-gold">Latest slips</h2>
          {ledger.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No hands yet. The rack starts at five thousand chips.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-card border border-line">
              {ledger.slice(0, 6).map((row) => (
                <li key={row.id} className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="font-semibold text-ink">{GAME_LABEL[row.game] ?? row.game}</span>
                    <span className="mt-0.5 block truncate text-mist">{row.note}</span>
                  </span>
                  <span className={row.delta >= 0 ? "shrink-0 font-semibold text-gold" : "shrink-0 text-mist"}>
                    {formatDelta(row.delta)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="rounded-card border border-line bg-graphite p-5 text-sm leading-relaxed text-mist">
          <h2 className="font-display text-2xl text-gold">House notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-4">
            <li>Rounds close on a clock. An empty seat just watches.</li>
            <li>Chips have no cash value. They cannot be redeemed or transferred.</li>
            <li>If the rack drops under 100, the house comps you back to 5,000.</li>
            <li>Outcomes are decided in your browser. Nothing is staked with a third party.</li>
            <li>18+ only. If the floor stops being fun, leave the table.</li>
          </ul>
        </aside>
      </section>
    </div>
  );
}

function FloorTape() {
  const wheel = useLiveClock("roulette");
  const shoe = useLiveClock("blackjack");
  const reels = useLiveClock("pokies");
  const gold = useLiveClock("baccarat");
  const pocket = wheelPocket(wheel.phase === "result" ? wheel.round : Math.max(0, wheel.round - 1));
  const tone = toneOf(pocket);
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <Tape
        label="Midnight Wheel"
        value={`${phaseLabel("roulette", wheel.phase)} · ${formatClock(wheel.left)}`}
        extra={tone === "zero" ? `${pocket} zero` : `${pocket} ${tone}`}
      />
      <Tape label="Velvet Hand" value={`${phaseLabel("blackjack", shoe.phase)} · ${formatClock(shoe.left)}`} extra="Six decks" />
      <Tape label="Neon 77" value={`${phaseLabel("pokies", reels.phase)} · ${formatClock(reels.left)}`} extra="Studio spin" />
      <Tape label="Gold Shoe" value={`${phaseLabel("baccarat", gold.phase)} · ${formatClock(gold.left)}`} extra="Punto banco" />
    </div>
  );
}

function Tape({ label, value, extra }: { label: string; value: string; extra: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-full border border-line bg-graphite px-4 py-2">
      <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-brand text-pink">
        <span className="live-dot" aria-hidden />
        {label.toUpperCase()}
      </span>
      <span className="text-right text-xs text-mist">
        <span className="block font-semibold text-gold">{value}</span>
        {extra}
      </span>
    </div>
  );
}

function LiveCard({
  table,
  onPlay,
}: {
  table: (typeof TABLES)[number];
  onPlay: (floor: Floor) => void;
}) {
  const live = useLiveClock(table.id as TableId);
  const history =
    table.id === "roulette"
      ? Array.from({ length: 8 }, (_, i) => wheelPocket(live.round - i - (live.phase === "result" ? 0 : 1)))
      : [];
  const road =
    table.id === "baccarat"
      ? Array.from({ length: 8 }, (_, i) => playCoup(live.round - i - (live.phase === "result" ? 0 : 1)).winner)
      : [];
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-graphite">
      <div className="relative">
        <img src={table.art} alt="" className="h-44 w-full object-cover sm:h-52" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-midnight/80 px-3 py-1 text-xs font-semibold tracking-brand text-pink">
          <span className="live-dot" aria-hidden />
          LIVE
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-brand text-pink">
          {phaseLabel(table.id as TableId, live.phase).toUpperCase()} · {formatClock(live.left)}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-gold">{table.name}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{table.copy}</p>
        {road.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {road.map((mark, i) => (
              <span
                key={`${mark}-${i}`}
                className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${mark === "player" ? "bg-ink text-midnight" : mark === "banker" ? "bg-pink text-midnight" : "bg-violet text-ink"}`}
              >
                {mark === "player" ? "P" : mark === "banker" ? "B" : "T"}
              </span>
            ))}
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {history.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${toneOf(n) === "red" ? "bg-pink text-midnight" : toneOf(n) === "zero" ? "bg-violet text-ink" : "bg-midnight text-ink"}`}
              >
                {n}
              </span>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs font-semibold tracking-wide text-gold">{table.meta}</p>
        <button
          type="button"
          data-testid={`open-${table.id}`}
          onClick={() => onPlay(table.id)}
          className="mt-4 min-h-11 rounded-full border border-gold text-sm font-semibold text-gold hover:bg-gold hover:text-midnight"
        >
          Join table
        </button>
      </div>
    </article>
  );
}

function PrivateCard({
  table,
  onPlay,
}: {
  table: (typeof TABLES)[number];
  onPlay: (floor: Floor) => void;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-graphite">
      <div className="relative">
        <img src={table.art} alt="" className="h-44 w-full object-cover sm:h-52" />
        <span className="absolute top-3 left-3 rounded-full bg-midnight/80 px-3 py-1 text-xs font-semibold tracking-brand text-gold">
          TABLE
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-brand text-pink">{table.kicker.toUpperCase()}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-gold">{table.name}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{table.copy}</p>
        <p className="mt-4 text-xs font-semibold tracking-wide text-gold">{table.meta}</p>
        <button
          type="button"
          data-testid={`open-${table.id}`}
          onClick={() => onPlay(table.id)}
          className="mt-4 min-h-11 rounded-full border border-gold text-sm font-semibold text-gold hover:bg-gold hover:text-midnight"
        >
          Take a seat
        </button>
      </div>
    </article>
  );
}
