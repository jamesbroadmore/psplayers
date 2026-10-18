import { useState } from "react";
import type { Card } from "@/lib/lounge/blackjack";
import { getGame, type Floor } from "@/lib/lounge/catalog";
import {
  cardFace,
  dropPlinko,
  freshFive,
  keno,
  minesMultiplier,
  playInstant,
  scoreDraw,
  towerMultiplier,
  type RoundResult,
} from "@/lib/lounge/collection";
import { TABLE_BETS, scorePoker } from "@/lib/lounge/originals";
import { formatChips, useCasino } from "@/lib/lounge/store";
import { playLose, playWin, unlockAudio } from "@/lib/lounge/sound";

type Phase = "ready" | "live" | "done";

export function CollectionTable({ id }: { id: Floor }) {
  const game = getGame(id);
  const balance = useCasino((state) => state.balance);
  const [bet, setBet] = useState<number>(25);
  const [choice, setChoice] = useState(game.options?.[0]?.id ?? "");
  const [picks, setPicks] = useState<number[]>([]);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("ready");
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [hand, setHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const [opened, setOpened] = useState<number[]>([]);
  const [floor, setFloor] = useState(0);
  const [traps, setTraps] = useState<number[]>([]);
  const [lift, setLift] = useState(1);
  const [pumps, setPumps] = useState(0);
  const [pontoon, setPontoon] = useState<{ player: Card[]; dealer: Card[]; hide: boolean } | null>(null);
  const [ride, setRide] = useState<{ cards: Card[]; deck: Card[]; live: [boolean, boolean, boolean] } | null>(null);

  const mode = modeOf(id);
  const stake = mode === "ride" ? bet * 3 : bet;

  function credit(next: RoundResult) {
    if (next.returned > 0) useCasino.getState().apply(id, next.headline, next.returned);
    if (next.moment === "win" || next.moment === "loss") useCasino.getState().noteHost(next.moment);
    if (next.moment === "win") playWin(useCasino.getState().muted, next.returned >= stake * 5);
    if (next.moment === "loss") playLose(useCasino.getState().muted);
    setResult(next);
    setPhase("done");
  }

  function buy(): boolean {
    unlockAudio();
    if (balance < stake) {
      setNote("Not enough chips for that stake.");
      return false;
    }
    if (!useCasino.getState().apply(id, game.name, -stake)) {
      setNote("Not enough chips for that stake.");
      return false;
    }
    setNote("");
    setResult(null);
    return true;
  }

  function dealSimple() {
    if (mode === "keno" && picks.length !== 6) {
      setNote("Mark six stars.");
      return;
    }
    if (!buy()) return;
    const next = mode === "keno" ? keno(bet, picks) : mode === "plinko" ? dropPlinko(bet, choice || "mid") : playInstant(id, bet, choice);
    credit(next);
  }

  function dealPoker() {
    if (!buy()) return;
    const fresh = freshFive();
    setHand(fresh.cards);
    setDeck(fresh.deck);
    setHeld([false, false, false, false, false]);
    setPhase("live");
  }

  function draw() {
    const kept = hand.filter((_, index) => held[index]);
    const drawn = [...kept, ...deck.slice(0, 5 - kept.length)];
    setHand(drawn);
    const scored = scoreDraw(drawn, id === "deuces" ? "deuces" : "bonus");
    credit({
      moment: scored.mult > 1 ? "win" : scored.mult === 1 ? "push" : "loss",
      returned: Math.floor(bet * scored.mult),
      headline: scored.name,
      detail: scored.mult ? `${scored.mult}× the stake.` : "Nothing pays.",
      visual: { title: scored.name, faces: drawn.map((card) => cardFace(card, true)) },
    });
  }

  function startMines() {
    if (!buy()) return;
    const bag = Array.from({ length: 25 }, (_, index) => index).sort(() => Math.random() - 0.5);
    setMines(bag.slice(0, 4));
    setOpened([]);
    setPhase("live");
  }

  function openMine(index: number) {
    if (phase !== "live" || opened.includes(index)) return;
    const next = [...opened, index];
    setOpened(next);
    if (mines.includes(index)) {
      credit({
        moment: "loss",
        returned: 0,
        headline: "Mine",
        detail: "That tile was live.",
        visual: { title: "Mine", faces: mines.map((spot) => ({ text: String(spot + 1), bad: true })) },
      });
      return;
    }
    if (next.length === 21) cashMines(next.length);
  }

  function cashMines(count = opened.length) {
    const mult = minesMultiplier(count);
    credit({
      moment: mult > 1 ? "win" : "push",
      returned: Math.floor(bet * mult),
      headline: `${mult}×`,
      detail: `${count} safe tile${count === 1 ? "" : "s"}.`,
      visual: { title: "Cashed", faces: [{ text: `${mult}×`, hot: true }] },
    });
  }

  function startTower() {
    if (!buy()) return;
    setTraps(Array.from({ length: 4 }, () => Math.floor(Math.random() * 3)));
    setFloor(0);
    setPhase("live");
  }

  function climb(door: number) {
    if (phase !== "live") return;
    if (traps[floor] === door) {
      credit({ moment: "loss", returned: 0, headline: "Wrong door", detail: `Floor ${floor + 1}.`, visual: { title: "Trap", faces: [{ text: "Trap", bad: true }] } });
      return;
    }
    const next = floor + 1;
    setFloor(next);
    if (next === 4) {
      const mult = towerMultiplier(4);
      credit({ moment: "win", returned: Math.floor(bet * mult), headline: "Top floor", detail: `${mult}×`, visual: { title: "Clear", faces: [{ text: `${mult}×`, hot: true }] } });
    }
  }

  function cashTower() {
    if (floor === 0) return;
    const mult = towerMultiplier(floor);
    credit({ moment: "win", returned: Math.floor(bet * mult), headline: `${mult}×`, detail: `${floor} floor${floor === 1 ? "" : "s"}.`, visual: { title: "Cashed", faces: [{ text: `${mult}×`, hot: true }] } });
  }

  function startBalloon() {
    if (!buy()) return;
    setLift(1);
    setPumps(0);
    setPhase("live");
  }

  function pump() {
    const chance = 0.1 + pumps * 0.06;
    if (Math.random() < chance) {
      credit({ moment: "loss", returned: 0, headline: "Pop", detail: `It broke at ${lift.toFixed(2)}×.`, visual: { title: "Pop", faces: [{ text: "Pop", bad: true }] } });
      return;
    }
    const next = Math.floor(lift * 1.22 * 100) / 100;
    setLift(next);
    setPumps((value) => value + 1);
  }

  function cashBalloon() {
    credit({ moment: lift > 1 ? "win" : "push", returned: Math.floor(bet * lift), headline: `${lift.toFixed(2)}×`, detail: `${pumps} pump${pumps === 1 ? "" : "s"}.`, visual: { title: "Cashed", faces: [{ text: `${lift.toFixed(2)}×`, hot: true }] } });
  }

  function dealPontoon() {
    if (!buy()) return;
    const fresh = freshFive();
    setPontoon({ player: [fresh.cards[0]!, fresh.cards[1]!], dealer: [fresh.cards[2]!, fresh.cards[3]!], hide: true });
    setDeck([fresh.cards[4]!, ...fresh.deck]);
    setPhase("live");
  }

  function twist() {
    if (!pontoon) return;
    const card = deck[0];
    if (!card) return;
    const player = [...pontoon.player, card];
    const rest = deck.slice(1);
    setDeck(rest);
    setPontoon({ ...pontoon, player });
    if (total(player) > 21) finishPontoon(player, pontoon.dealer, rest);
  }

  function finishPontoon(player: Card[], dealer: Card[], shoe = deck) {
    const house = [...dealer];
    while (total(house) < 17 && shoe[0]) {
      house.push(shoe[0]);
      shoe = shoe.slice(1);
    }
    setDeck(shoe);
    const yours = total(player);
    const theirs = total(house);
    const pontoonWin = player.length === 2 && yours === 21;
    const five = player.length === 5 && yours <= 21;
    let mult = 0;
    let headline = "Bust";
    if (yours <= 21 && (pontoonWin || five)) {
      mult = 3;
      headline = pontoonWin ? "Pontoon" : "Five-card trick";
    } else if (yours <= 21 && (theirs > 21 || yours > theirs)) {
      mult = 2;
      headline = "You take it";
    } else if (yours <= 21 && yours === theirs) {
      mult = 1;
      headline = "Push";
    } else headline = yours > 21 ? "Bust" : "Dealer";
    setPontoon({ player, dealer: house, hide: false });
    credit({
      moment: mult > 1 ? "win" : mult === 1 ? "push" : "loss",
      returned: Math.floor(bet * mult),
      headline,
      detail: `You ${yours} · dealer ${theirs}.`,
      visual: { title: headline, faces: [...player.map((card) => cardFace(card, true)), { text: "vs" }, ...house.map((card) => cardFace(card))] },
    });
  }

  function startRide() {
    if (!buy()) return;
    const fresh = freshFive();
    setRide({ cards: fresh.cards.slice(0, 3), deck: fresh.deck, live: [true, true, true] });
    setPhase("live");
  }

  function pullRide(index: 0 | 1) {
    if (!ride) return;
    const live = [...ride.live] as [boolean, boolean, boolean];
    live[index] = false;
    useCasino.getState().apply(id, "Pull", bet);
    const cards = index === 0 ? ride.cards : [...ride.cards, ride.deck[0]!];
    const nextDeck = index === 0 ? ride.deck : ride.deck.slice(1);
    setRide({ cards, deck: nextDeck, live });
    if (index === 1) finishRide({ cards, deck: nextDeck, live });
  }

  function keepRide(index: 0 | 1) {
    if (!ride) return;
    const card = ride.deck[0];
    if (!card) return;
    const cards = [...ride.cards, card];
    const next = { cards, deck: ride.deck.slice(1), live: ride.live };
    setRide(next);
    if (index === 1) finishRide(next);
  }

  function finishRide(current: { cards: Card[]; live: [boolean, boolean, boolean] }) {
    const scored = scorePoker(current.cards);
    const units = current.live.filter(Boolean).length;
    credit({
      moment: scored.mult > 1 ? "win" : scored.mult === 1 ? "push" : "loss",
      returned: Math.floor(bet * units * scored.mult),
      headline: scored.name,
      detail: `${units} bet${units === 1 ? "" : "s"} still live.`,
      visual: { title: scored.name, faces: current.cards.map((card) => cardFace(card, true)) },
    });
  }

  return (
    <div className="felt-table p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-brand text-pink">{game.kicker.toUpperCase()}</p>
          <h2 className="font-display text-3xl font-semibold text-gold">{game.name}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{game.copy}</p>
        </div>
        <p className="text-sm text-gold">{formatChips(balance)} chips</p>
      </div>

      {game.options && phase === "ready" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {game.options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={choice === option.id}
              onClick={() => setChoice(option.id)}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${choice === option.id ? "border-gold bg-gold text-midnight" : "border-line text-ink"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {mode === "keno" && phase === "ready" && (
        <div className="mt-4 grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {Array.from({ length: 40 }, (_, index) => index + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={picks.includes(n)}
              onClick={() => setPicks((current) => (current.includes(n) ? current.filter((pick) => pick !== n) : current.length >= 6 ? current : [...current, n]))}
              className={`min-h-10 rounded-md border text-sm font-semibold ${picks.includes(n) ? "border-gold bg-gold text-midnight" : "border-line text-ink"}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {mode === "poker" && hand.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hand.map((card, index) => (
            <button key={`${card.rank}${card.suit}${index}`} type="button" disabled={phase !== "live"} onClick={() => setHeld((current) => current.map((value, i) => (i === index ? !value : value)))} className={`min-h-16 min-w-14 rounded-md border px-3 text-lg font-semibold ${held[index] ? "border-gold bg-gold text-midnight" : "border-line bg-midnight text-ink"}`}>
              {card.rank}{card.suit === "H" || card.suit === "D" ? "♥" : "♠"}
              <span className="mt-1 block text-xs">{phase === "live" ? (held[index] ? "Held" : "Hold") : ""}</span>
            </button>
          ))}
        </div>
      )}

      {mode === "mines" && phase !== "ready" && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }, (_, index) => {
            const open = opened.includes(index) || phase === "done";
            const mine = mines.includes(index);
            return (
              <button key={index} type="button" disabled={phase !== "live" || opened.includes(index)} onClick={() => openMine(index)} className={`min-h-12 rounded-md border text-sm font-semibold ${open && mine ? "border-pink bg-pink text-midnight" : open ? "border-gold bg-gold/20 text-gold" : "border-line bg-midnight text-mist"}`}>
                {open ? (mine ? "Mine" : "Safe") : index + 1}
              </button>
            );
          })}
        </div>
      )}

      {mode === "tower" && phase === "live" && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((door) => (
            <button key={door} type="button" onClick={() => climb(door)} className="min-h-14 rounded-md border border-line bg-midnight text-sm font-semibold text-ink">
              Door {door + 1}
            </button>
          ))}
          <p className="col-span-3 text-sm text-mist">Floor {floor + 1} of 4 · {floor ? `${towerMultiplier(floor)}× if you cash` : "Clear one floor to cash."}</p>
        </div>
      )}

      {mode === "balloon" && phase === "live" && (
        <p className="mt-4 font-display text-4xl text-gold">{lift.toFixed(2)}×</p>
      )}

      {mode === "pontoon" && pontoon && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pontoon.player.map((card, index) => (
            <span key={`p${index}`} className="rounded-md border border-gold px-3 py-2 text-ink">{card.rank}</span>
          ))}
          <span className="px-2 py-2 text-mist">vs</span>
          {pontoon.dealer.map((card, index) => (
            <span key={`d${index}`} className="rounded-md border border-line px-3 py-2 text-ink">{pontoon.hide && index === 1 ? "?" : card.rank}</span>
          ))}
        </div>
      )}

      {mode === "ride" && ride && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ride.cards.map((card, index) => (
            <span key={`${card.rank}${index}`} className="rounded-md border border-gold px-3 py-2 text-ink">{card.rank}{card.suit}</span>
          ))}
          <p className="w-full text-sm text-mist">{ride.live.filter(Boolean).length} bets still live.</p>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md border border-line bg-midnight/70 p-4" aria-live="polite">
          <p className="font-display text-2xl text-gold">{result.headline}</p>
          <p className="mt-1 text-sm text-mist">{result.detail}</p>
          {result.visual.faces.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.visual.faces.map((face, index) => (
                <span key={`${face.text}${index}`} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${face.bad ? "border-pink text-pink" : face.hot ? "border-gold text-gold" : "border-line text-mist"}`}>
                  {face.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {TABLE_BETS.map((amount) => (
          <button key={amount} type="button" disabled={phase === "live"} onClick={() => setBet(amount)} className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${bet === amount ? "border-gold bg-gold text-midnight" : "border-line text-ink"}`}>
            {amount}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-mist">Stake {formatChips(stake)} · rack {formatChips(balance)}</p>
      {note && <p className="mt-2 text-sm text-pink">{note}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {phase !== "live" && mode === "simple" && (
          <button type="button" onClick={dealSimple} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Deal</button>
        )}
        {phase !== "live" && mode === "poker" && (
          <button type="button" onClick={dealPoker} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Deal</button>
        )}
        {phase === "live" && mode === "poker" && (
          <button type="button" onClick={draw} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Draw</button>
        )}
        {phase !== "live" && mode === "mines" && (
          <button type="button" onClick={startMines} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Start</button>
        )}
        {phase === "live" && mode === "mines" && opened.length > 0 && (
          <button type="button" onClick={() => cashMines()} className="min-h-11 rounded-full border border-gold px-5 text-sm font-semibold text-gold">Cash {minesMultiplier(opened.length)}×</button>
        )}
        {phase !== "live" && mode === "tower" && (
          <button type="button" onClick={startTower} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Climb</button>
        )}
        {phase === "live" && mode === "tower" && floor > 0 && (
          <button type="button" onClick={cashTower} className="min-h-11 rounded-full border border-gold px-5 text-sm font-semibold text-gold">Cash</button>
        )}
        {phase !== "live" && mode === "balloon" && (
          <button type="button" onClick={startBalloon} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Inflate</button>
        )}
        {phase === "live" && mode === "balloon" && (
          <>
            <button type="button" onClick={pump} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Pump</button>
            <button type="button" onClick={cashBalloon} className="min-h-11 rounded-full border border-gold px-5 text-sm font-semibold text-gold">Cash</button>
          </>
        )}
        {phase !== "live" && mode === "pontoon" && (
          <button type="button" onClick={dealPontoon} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Deal</button>
        )}
        {phase === "live" && mode === "pontoon" && pontoon && (
          <>
            <button type="button" onClick={twist} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Twist</button>
            <button type="button" onClick={() => finishPontoon(pontoon.player, pontoon.dealer)} className="min-h-11 rounded-full border border-gold px-5 text-sm font-semibold text-gold">Stick</button>
          </>
        )}
        {phase !== "live" && mode === "ride" && (
          <button type="button" onClick={startRide} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Deal three bets</button>
        )}
        {phase === "live" && mode === "ride" && ride && ride.cards.length === 3 && (
          <>
            <button type="button" onClick={() => pullRide(0)} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-ink">Pull bet 1</button>
            <button type="button" onClick={() => keepRide(0)} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Let it ride</button>
          </>
        )}
        {phase === "live" && mode === "ride" && ride && ride.cards.length === 4 && (
          <>
            <button type="button" onClick={() => pullRide(1)} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-ink">Pull bet 2</button>
            <button type="button" onClick={() => keepRide(1)} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-midnight">Let it ride</button>
          </>
        )}
      </div>
    </div>
  );
}

function modeOf(id: Floor): "simple" | "keno" | "poker" | "mines" | "tower" | "plinko" | "balloon" | "pontoon" | "ride" {
  if (id === "keno") return "keno";
  if (id === "deuces" || id === "bonus") return "poker";
  if (id === "mines") return "mines";
  if (id === "tower") return "tower";
  if (id === "plinko") return "plinko";
  if (id === "balloon") return "balloon";
  if (id === "pontoon") return "pontoon";
  if (id === "ride") return "ride";
  return "simple";
}

function total(cards: Card[]): number {
  let sum = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      sum += 1;
    } else if (card.rank === "K" || card.rank === "Q" || card.rank === "J") sum += 10;
    else sum += Number(card.rank);
  }
  while (aces > 0 && sum + 10 <= 21) {
    sum += 10;
    aces -= 1;
  }
  return sum;
}

