import { useState } from "react";
import { SuitMark } from "@/components/lounge/Icons";
import { AICharacterStudio } from "@/components/lounge/AICharacterStudio";
import { playClick, playLose, playWin, unlockAudio } from "@/lib/lounge/audio";
import type { Card, Suit } from "@/lib/lounge/blackjack";
import { TABLE_BETS, oneDeck, scorePoker, take } from "@/lib/lounge/originals";
import { formatChips, formatDelta, useCasino } from "@/lib/lounge/store";
import { characterPortrait, getAICharacter, type CharacterId } from "@/lib/lounge/characters";

export function Poker() {
  const balance = useCasino((s) => s.balance);
  const [bet, setBet] = useState<(typeof TABLE_BETS)[number]>(25);
  const [hand, setHand] = useState<Card[]>([]);
  const [holds, setHolds] = useState<boolean[]>([false, false, false, false, false]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"deal" | "draw">("deal");
  const [banner, setBanner] = useState("Jacks or better. Hold what you want, then draw.");
  const [lastMoment, setLastMoment] = useState<"win" | "loss" | null>(null);
  const [roundId, setRoundId] = useState(0);
  const [hostId, setHostId] = useState<CharacterId>("cleo");
  const host = getAICharacter(hostId);

  function deal() {
    unlockAudio();
    if (!useCasino.getState().apply("poker", `Deal ${formatChips(bet)}`, -bet)) {
      setBanner("Not enough chips.");
      return;
    }
    playClick(useCasino.getState().muted);
    const fresh = oneDeck();
    const dealt = take(fresh, 5);
    setDeck(dealt.deck);
    setHand(dealt.cards);
    setHolds([false, false, false, false, false]);
    setPhase("draw");
    setLastMoment(null);
    setBanner("Hold, then draw.");
  }

  function draw() {
    unlockAudio();
    const need = holds.filter((held) => !held).length;
    const drawn = take(deck, need);
    let cursor = 0;
    const next = hand.map((card, index) => (holds[index] ? card : drawn.cards[cursor++]!));
    const scored = scorePoker(next);
    const back = scored.mult * bet;
    if (back > 0) useCasino.getState().apply("poker", scored.name, back);
    if (scored.mult > 1) playWin(useCasino.getState().muted, scored.mult >= 25);
    else playLose(useCasino.getState().muted);
    setHand(next);
    setDeck(drawn.deck);
    setPhase("deal");
    const net = back - bet;
    setLastMoment(scored.mult > 0 ? "win" : "loss");
    setRoundId((current) => current + 1);
    setBanner(scored.mult > 0 ? `${scored.name} · ${formatDelta(net)}` : `${scored.name} · ${formatDelta(-bet)}`);
  }

  const betIndex = TABLE_BETS.indexOf(bet);

  return (
    <div className="pb-24">
      <div className="overflow-hidden rounded-card border border-gold/40 bg-graphite">
        <img src="/art/poker.jpg" alt="" className="h-40 w-full object-cover sm:h-48" />
        <div className="p-4 sm:p-6">
          <p className="text-xs font-semibold tracking-brand text-pink">JACKS OR BETTER · STRIP POKER</p>
          <h2 className="font-display text-2xl text-gold">Royal Velvet</h2>
          <div className="mt-3 flex items-center gap-3 rounded-md border border-line bg-midnight/70 p-2.5">
            <img src={characterPortrait(host.id)} alt={`${host.name}, your AI table host`} className="size-12 rounded-md object-cover" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-brand text-pink">TONIGHT&apos;S HOST</p>
              <p className="font-display text-lg text-gold">{host.name}</p>
              <p className="truncate text-xs text-mist">{host.title} · {host.style}</p>
            </div>
          </div>
          <p className="mt-1 text-xs text-mist">Play chips only. Adult fictional hosts react in suggestive, fully covered poses.</p>
          <p className="mt-4 min-h-6 text-sm font-semibold text-gold" data-testid="poker-banner" aria-live="polite">
            {banner}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(hand.length ? hand : Array.from({ length: 5 }, () => null)).map((card, index) => (
              <button
                key={index}
                type="button"
                disabled={phase !== "draw" || !card}
                onClick={() =>
                  setHolds((prev) => prev.map((held, i) => (i === index ? !held : held)))
                }
                className="relative"
              >
                {card ? (
                  <Face card={card} />
                ) : (
                  <div className="flex h-28 w-20 items-center justify-center rounded-md border border-dashed border-line sm:h-32 sm:w-24">
                    <img src="/brand/star-icon-colour.svg" alt="" className="size-8 opacity-60" />
                  </div>
                )}
                {phase === "draw" && holds[index] && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-pink px-2 text-xs font-semibold text-midnight">
                    Hold
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Lower stake"
              disabled={phase === "draw" || betIndex <= 0}
              onClick={() => setBet(TABLE_BETS[betIndex - 1]!)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line text-lg disabled:opacity-40"
            >
              −
            </button>
            <p className="min-w-24 text-center text-sm font-semibold tabular-nums">
              {formatChips(bet)}
              <span className="mt-0.5 block text-xs font-medium tracking-brand text-mist">STAKE</span>
            </p>
            <button
              type="button"
              aria-label="Raise stake"
              disabled={phase === "draw" || betIndex >= TABLE_BETS.length - 1}
              onClick={() => setBet(TABLE_BETS[betIndex + 1]!)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line text-lg disabled:opacity-40"
            >
              +
            </button>
            {phase === "deal" ? (
              <button
                type="button"
                data-testid="poker-deal"
                disabled={balance < bet}
                onClick={deal}
                className="min-h-12 min-w-32 rounded-full bg-pink px-6 text-sm font-semibold text-midnight disabled:opacity-40"
              >
                Deal
              </button>
            ) : (
              <button
                type="button"
                data-testid="poker-draw"
                onClick={draw}
                className="min-h-12 min-w-32 rounded-full bg-pink px-6 text-sm font-semibold text-midnight"
              >
                Draw
              </button>
            )}
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 text-sm text-mist sm:grid-cols-3">
            {[
              ["Royal flush", "800"],
              ["Straight flush", "50"],
              ["Four of a kind", "25"],
              ["Full house", "9"],
              ["Flush", "6"],
              ["Straight", "4"],
              ["Three of a kind", "3"],
              ["Two pair", "2"],
              ["Jacks or better", "1"],
            ].map(([name, mult]) => (
              <li key={name} className="flex justify-between gap-3 border-b border-line py-1.5">
                <span>{name}</span>
                <span className="font-semibold text-gold">{mult}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AICharacterStudio
        moment={lastMoment}
        roundId={roundId}
        onCharacterChange={setHostId}
      />
    </div>
  );
}

function Face({ card }: { card: Card }) {
  const red = card.suit === "H" || card.suit === "D";
  return (
    <div
      className={`card-face flex h-28 w-20 flex-col justify-between rounded-md border bg-ink p-1.5 sm:h-32 sm:w-24 ${red ? "border-pink text-pink" : "border-line text-midnight"}`}
    >
      <span className="font-display text-xl font-semibold leading-none">{card.rank}</span>
      <SuitMark suit={card.suit as Suit} className="size-5 self-end" />
    </div>
  );
}
