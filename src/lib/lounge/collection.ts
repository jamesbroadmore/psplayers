import type { Card, Rank, Suit } from "@/lib/lounge/blackjack";
import type { Floor } from "@/lib/lounge/catalog";
import { oneDeck } from "@/lib/lounge/originals";

export type Face = { text: string; hot?: boolean; bad?: boolean };
export type RoundVisual = { title: string; faces: Face[] };
export type RoundResult = {
  moment: "win" | "loss" | "push";
  returned: number;
  headline: string;
  detail: string;
  visual: RoundVisual;
};

const SUIT: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const RED = new Set<Suit>(["H", "D"]);

export function cardFace(card: Card, hot = false): Face {
  return { text: `${card.rank}${SUIT[card.suit]}`, hot, bad: RED.has(card.suit) };
}

function die(): number {
  return 1 + Math.floor(Math.random() * 6);
}

function money(bet: number, mult: number): number {
  return Math.max(0, Math.floor(bet * mult));
}

function settle(bet: number, mult: number, headline: string, detail: string, visual: RoundVisual): RoundResult {
  if (mult <= 0) return { moment: "loss", returned: 0, headline, detail, visual };
  if (Math.abs(mult - 1) < 0.001) return { moment: "push", returned: bet, headline, detail, visual };
  return { moment: "win", returned: money(bet, mult), headline, detail, visual };
}

function rankValue(rank: Rank): number {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  return Number(rank);
}

function pack(cat: number, parts: number[]): number {
  const p = [...parts, 0, 0, 0, 0, 0].slice(0, 5);
  return cat * 16 ** 5 + p[0]! * 16 ** 4 + p[1]! * 16 ** 3 + p[2]! * 16 ** 2 + p[3]! * 16 + p[4]!;
}

export function eval5(cards: Card[]): number {
  const vals = cards.map((card) => rankValue(card.rank));
  const flush = cards.every((card) => card.suit === cards[0]!.suit);
  const counts = new Map<number, number>();
  for (const value of vals) counts.set(value, (counts.get(value) ?? 0) + 1);
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const unique = [...new Set(vals)].sort((a, b) => a - b);
  const wheel = unique.join() === "2,3,4,5,14";
  const straight = unique.length === 5 && (unique[4]! - unique[0]! === 4 || wheel);
  const straightHigh = wheel ? 5 : (unique[4] ?? 0);
  const kick = grouped.map(([value]) => value);
  const high = [...vals].sort((a, b) => b - a);
  if (straight && flush) return pack(8, [straightHigh]);
  if (grouped[0]?.[1] === 4) return pack(7, kick);
  if (grouped[0]?.[1] === 3 && grouped[1]?.[1] === 2) return pack(6, kick);
  if (flush) return pack(5, high);
  if (straight) return pack(4, [straightHigh]);
  if (grouped[0]?.[1] === 3) return pack(3, kick);
  if (grouped[0]?.[1] === 2 && grouped[1]?.[1] === 2) return pack(2, kick);
  if (grouped[0]?.[1] === 2) return pack(1, kick);
  return pack(0, high);
}

function combinations<T>(items: T[], count: number): T[][] {
  if (count === 0) return [[]];
  if (items.length < count) return [];
  const [head, ...tail] = items;
  return [...combinations(tail, count - 1).map((combo) => [head!, ...combo]), ...combinations(tail, count)];
}

export function best5(cards: Card[]): number {
  return Math.max(...combinations(cards, 5).map(eval5));
}

function handName(score: number): string {
  const cat = Math.floor(score / 16 ** 5);
  return ["High card", "Pair", "Two pair", "Three of a kind", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"][cat] ?? "High card";
}

function threeRank(cards: Card[]): { name: string; score: number } {
  const vals = cards.map((card) => rankValue(card.rank)).sort((a, b) => a - b);
  const flush = cards.every((card) => card.suit === cards[0]!.suit);
  const counts = new Map<number, number>();
  for (const value of vals) counts.set(value, (counts.get(value) ?? 0) + 1);
  const grouped = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const wheel = vals.join() === "2,3,14";
  const straight = new Set(vals).size === 3 && vals[2]! - vals[0]! === 2;
  const straightHigh = wheel ? 3 : vals[2]!;
  if (flush && (straight || wheel)) return { name: "Straight flush", score: pack(6, [straightHigh]) };
  if (grouped[0]?.[1] === 3) return { name: "Three of a kind", score: pack(5, [grouped[0][0]]) };
  if (straight || wheel) return { name: "Straight", score: pack(4, [straightHigh]) };
  if (flush) return { name: "Flush", score: pack(3, [...vals].reverse()) };
  if (grouped[0]?.[1] === 2) return { name: "Pair", score: pack(2, grouped.map(([value]) => value)) };
  return { name: "High card", score: pack(1, [...vals].reverse()) };
}

function teenRank(cards: Card[]): { name: string; score: number } {
  const base = threeRank(cards);
  if (base.name === "Three of a kind") return { name: "Trail", score: base.score + 8 };
  if (base.name === "Straight flush") return { name: "Pure sequence", score: base.score + 4 };
  if (base.name === "Straight") return { name: "Sequence", score: base.score };
  if (base.name === "Flush") return { name: "Color", score: base.score };
  return base;
}

function rows(title: string, groups: Array<[string, Card[]]>): RoundVisual {
  return {
    title,
    faces: groups.flatMap(([label, cards]) => [{ text: label }, ...cards.map((card) => cardFace(card, true))]),
  };
}

export function playInstant(id: Floor, bet: number, choice = ""): RoundResult {
  if (id === "sicbo") return sicbo(bet, choice);
  if (id === "craps") return craps(bet, choice);
  if (id === "threecard") return versusThree(bet, threeRank, true);
  if (id === "war") return war(bet);
  if (id === "dragon") return dragon(bet, choice);
  if (id === "andar") return andar(bet, choice);
  if (id === "teen") return versusThree(bet, teenRank, false);
  if (id === "stud") return stud(bet);
  if (id === "reddog") return redDog(bet);
  if (id === "paigow") return paiGow(bet);
  if (id === "bigsix" || id === "wheel") return spinWheel(bet, choice, id === "wheel");
  if (id === "limbo") return limbo(bet, Number(choice) || 2);
  if (id === "gems") return gems(bet);
  if (id === "coin") return coin(bet, choice);
  if (id === "bingo") return bingo(bet);
  if (id === "scratch") return scratch(bet);
  if (id === "fantan") return fanTan(bet, choice);
  if (id === "holdem") return community(bet, 2);
  if (id === "omaha") return community(bet, 4);
  if (id === "chuck") return chuck(bet, Number(choice) || 1);
  if (id === "redblack") return redBlack(bet, choice);
  if (id === "penalty") return penalty(bet, choice);
  if (id === "lightning") return lightning(bet, choice);
  if (id === "yacht") return yacht(bet);
  if (id === "keno") return keno(bet, choice.split(",").map(Number));
  return settle(bet, 0, "Closed", "That table is not open.", { title: "Closed", faces: [] });
}

function sicbo(bet: number, choice: string): RoundResult {
  const dice = [die(), die(), die()];
  const total = dice.reduce((sum, face) => sum + face, 0);
  const triple = dice.every((face) => face === dice[0]);
  const visual = { title: dice.join(" · "), faces: dice.map((face) => ({ text: String(face), hot: true })) };
  if (choice === "triple") return settle(bet, triple ? 31 : 0, triple ? "Triple" : "No triple", "Any triple pays 30 to 1.", visual);
  if (triple) return settle(bet, 0, "Triple", "Triples take small and big.", visual);
  const win = choice === "small" ? total <= 10 : total >= 11;
  return settle(bet, win ? 2 : 0, win ? "Hits" : "Miss", `Total ${total}.`, visual);
}

function craps(bet: number, choice: string): RoundResult {
  const rolls: number[] = [];
  const come = die() + die();
  rolls.push(come);
  const pass = choice !== "dont";
  const visual = () => ({ title: rolls.join(" → "), faces: rolls.map((roll) => ({ text: String(roll), hot: true })) });
  if (pass && (come === 7 || come === 11)) return settle(bet, 2, "Natural", `Come-out ${come}.`, visual());
  if (pass && (come === 2 || come === 3 || come === 12)) return settle(bet, 0, "Craps", `Come-out ${come}.`, visual());
  if (!pass && (come === 2 || come === 3)) return settle(bet, 2, "Don't wins", `Come-out ${come}.`, visual());
  if (!pass && come === 12) return settle(bet, 1, "Push", "Twelve pushes don't pass.", visual());
  if (!pass && (come === 7 || come === 11)) return settle(bet, 0, "Natural", `Come-out ${come}.`, visual());
  for (let i = 0; i < 40; i += 1) {
    const next = die() + die();
    rolls.push(next);
    if (next === come) return settle(bet, pass ? 2 : 0, pass ? "Point made" : "Point lost", `Point ${come}.`, visual());
    if (next === 7) return settle(bet, pass ? 0 : 2, pass ? "Seven out" : "Seven out", `Point was ${come}.`, visual());
  }
  return settle(bet, 1, "Push", "The dice stalled.", visual());
}

function versusThree(bet: number, rankOf: (cards: Card[]) => { name: string; score: number }, qualifyQueen: boolean): RoundResult {
  const deck = oneDeck();
  const player = deck.slice(0, 3);
  const dealer = deck.slice(3, 6);
  const yours = rankOf(player);
  const theirs = rankOf(dealer);
  const visual = rows(`${yours.name} vs ${theirs.name}`, [["You", player], ["Dealer", dealer]]);
  if (qualifyQueen && theirs.score < pack(1, [12])) return settle(bet, 2, "No qualify", "Dealer needed queen high.", visual);
  if (yours.score > theirs.score) return settle(bet, 2, yours.name, "Your three takes it.", visual);
  if (yours.score < theirs.score) return settle(bet, 0, theirs.name, "Dealer has the better three.", visual);
  return settle(bet, 1, "Push", "The hands match.", visual);
}

function war(bet: number): RoundResult {
  const deck = oneDeck();
  const player = deck[0]!;
  const dealer = deck[1]!;
  const faces = [cardFace(player, true), { text: "vs" }, cardFace(dealer)];
  if (rankValue(player.rank) === rankValue(dealer.rank)) {
    const yours = deck[5]!;
    const house = deck[4]!;
    faces.push({ text: "war" }, cardFace(yours, true), cardFace(house));
    if (rankValue(yours.rank) > rankValue(house.rank)) return settle(bet, 3, "War won", "The second card took it.", { title: "War", faces });
    if (rankValue(yours.rank) < rankValue(house.rank)) return settle(bet, 0, "War lost", "The dealer won the war.", { title: "War", faces });
    return settle(bet, 1, "Double tie", "Even the war copied.", { title: "War", faces });
  }
  const win = rankValue(player.rank) > rankValue(dealer.rank);
  return settle(bet, win ? 2 : 0, win ? "You take it" : "House card", "High card wins.", { title: "War", faces });
}

function dragon(bet: number, choice: string): RoundResult {
  const deck = oneDeck();
  const left = deck[0]!;
  const right = deck[1]!;
  const visual = rows("Dragon Tiger", [["Dragon", [left]], ["Tiger", [right]]]);
  const side = rankValue(left.rank) === rankValue(right.rank) ? "tie" : rankValue(left.rank) > rankValue(right.rank) ? "dragon" : "tiger";
  if (choice === "tie") return settle(bet, side === "tie" ? 9 : 0, side === "tie" ? "Tie" : "No tie", "Tie pays 8 to 1.", visual);
  if (side === "tie") return settle(bet, 0, "Tie", "A tie takes the side bets.", visual);
  return settle(bet, side === choice ? 2 : 0, `${side} wins`, "Higher card.", visual);
}

function andar(bet: number, choice: string): RoundResult {
  const deck = oneDeck();
  const joker = deck[0]!;
  let winner = "bahar";
  let match = deck[1]!;
  for (let i = 1; i < deck.length; i += 1) {
    if (deck[i]!.rank === joker.rank) {
      winner = i % 2 === 1 ? "bahar" : "andar";
      match = deck[i]!;
      break;
    }
  }
  return settle(bet, winner === choice ? 2 : 0, `${winner} matches`, "First matching rank.", rows("Joker", [["Joker", [joker]], ["Match", [match]]]));
}

function aceKingOrBetter(cards: Card[]): boolean {
  const score = eval5(cards);
  if (Math.floor(score / 16 ** 5) >= 1) return true;
  const high = Math.floor(score / 16 ** 4) % 16;
  const second = Math.floor(score / 16 ** 3) % 16;
  return high === 14 && second >= 13;
}

function stud(bet: number): RoundResult {
  const deck = oneDeck();
  const player = deck.slice(0, 5);
  const dealer = deck.slice(5, 10);
  const yours = eval5(player);
  const theirs = eval5(dealer);
  const visual = rows(`${handName(yours)} vs ${handName(theirs)}`, [["You", player], ["Dealer", dealer]]);
  if (!aceKingOrBetter(dealer)) return settle(bet, 2, "No qualify", "Dealer needed ace-king.", visual);
  if (yours > theirs) return settle(bet, yours >= pack(1, [0]) ? 3 : 2, handName(yours), "Ante and play both pay.", visual);
  if (yours < theirs) return settle(bet, 0, handName(theirs), "Dealer has the five.", visual);
  return settle(bet, 1, "Push", "The fives match.", visual);
}

function redDog(bet: number): RoundResult {
  const deck = oneDeck();
  const [a, b, c] = [deck[0]!, deck[1]!, deck[2]!];
  const low = Math.min(rankValue(a.rank), rankValue(b.rank));
  const high = Math.max(rankValue(a.rank), rankValue(b.rank));
  const visual = rows("Spread", [["Door", [a, b]], ["Third", [c]]]);
  if (a.rank === b.rank) return settle(bet, c.rank === a.rank ? 12 : 0, c.rank === a.rank ? "Trips" : "Pair misses", "A pair pays only if the third matches.", visual);
  const spread = high - low - 1;
  if (spread <= 0) return settle(bet, 1, "Consecutive", "No room. Push.", visual);
  const mid = rankValue(c.rank) > low && rankValue(c.rank) < high;
  const pay = spread === 1 ? 6 : spread === 2 ? 5 : spread === 3 ? 3 : 2;
  return settle(bet, mid ? pay : 0, mid ? "Between" : "Outside", `Spread ${spread}.`, visual);
}

function twoPower(cards: [Card, Card]): number {
  if (cards[0].rank === cards[1].rank) return pack(2, [rankValue(cards[0].rank)]);
  const vals = [rankValue(cards[0].rank), rankValue(cards[1].rank)].sort((a, b) => b - a);
  return pack(1, vals);
}

function legal(high: Card[], low: [Card, Card]): boolean {
  const frontPair = low[0].rank === low[1].rank;
  const back = eval5(high);
  const backHasPair = Math.floor(back / 16 ** 5) >= 1;
  if (frontPair && !backHasPair) return false;
  if (!frontPair && Math.floor(back / 16 ** 5) === 0) {
    const backHigh = Math.max(...high.map((card) => rankValue(card.rank)));
    if (Math.max(rankValue(low[0].rank), rankValue(low[1].rank)) > backHigh) return false;
  }
  return true;
}

function arrange(cards: Card[]): { high: Card[]; low: [Card, Card] } {
  let best: { high: Card[]; low: [Card, Card]; key: number } | null = null;
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const low: [Card, Card] = [cards[i]!, cards[j]!];
      const high = cards.filter((_, index) => index !== i && index !== j);
      if (!legal(high, low)) continue;
      const key = eval5(high);
      if (!best || key > best.key) best = { high, low, key };
    }
  }
  return best ?? { high: cards.slice(0, 5), low: [cards[5]!, cards[6]!] };
}

function paiGow(bet: number): RoundResult {
  const deck = oneDeck();
  const yours = arrange(deck.slice(0, 7));
  const theirs = arrange(deck.slice(7, 14));
  const highWin = eval5(yours.high) > eval5(theirs.high);
  const lowWin = twoPower(yours.low) > twoPower(theirs.low);
  const visual = rows("House way", [["Five", yours.high], ["Two", yours.low]]);
  if (highWin && lowWin) return settle(bet, 1.95, "Both hands", "Win both to take it.", visual);
  if (highWin || lowWin) return settle(bet, 1, "Split", "One each. Push.", visual);
  return settle(bet, 0, "Dealer", "The house held both.", visual);
}

function spinWheel(bet: number, choice: string, heavier: boolean): RoundResult {
  const bag = heavier ? ["1", "1", "1", "2", "2", "5", "5", "10", "20", "40", "40"] : ["1", "1", "1", "1", "1", "2", "2", "2", "5", "5", "10", "20", "40"];
  const hit = bag[Math.floor(Math.random() * bag.length)]!;
  return settle(bet, hit === choice ? Number(choice) + 1 : 0, hit === choice ? `${choice} hits` : `Shows ${hit}`, "A hit pays the number to one.", {
    title: hit,
    faces: [{ text: hit, hot: hit === choice }],
  });
}

function limbo(bet: number, target: number): RoundResult {
  const roll = Math.max(1, Math.floor((0.97 / Math.max(0.0001, Math.random())) * 100) / 100);
  return settle(bet, roll >= target ? target : 0, roll >= target ? "Cleared" : "Under", `Rolled ${roll.toFixed(2)}× against ${target}×.`, {
    title: `${roll.toFixed(2)}×`,
    faces: [{ text: `${roll.toFixed(2)}×`, hot: roll >= target }],
  });
}

function gems(bet: number): RoundResult {
  const colors = ["Ruby", "Gold", "Jade", "Ink", "Pearl", "Violet", "Ice"];
  const drawn = Array.from({ length: 5 }, () => colors[Math.floor(Math.random() * colors.length)]!);
  const counts = new Map<string, number>();
  for (const color of drawn) counts.set(color, (counts.get(color) ?? 0) + 1);
  const groups = [...counts.values()].sort((a, b) => b - a);
  const mult = groups[0] === 5 ? 40 : groups[0] === 4 ? 8 : groups[0] === 3 && groups[1] === 2 ? 4 : groups[0] === 3 ? 2.4 : groups[0] === 2 && groups[1] === 2 ? 1.6 : 0;
  return settle(bet, mult, mult ? "Pattern" : "Scatter", drawn.join(" · "), {
    title: "Stones",
    faces: drawn.map((color) => ({ text: color, hot: (counts.get(color) ?? 0) > 1 })),
  });
}

function coin(bet: number, choice: string): RoundResult {
  const side = Math.random() < 0.5 ? "heads" : "tails";
  return settle(bet, side === choice ? 1.96 : 0, side === choice ? "Called it" : side, "Even money, with a shade for the house.", {
    title: side,
    faces: [{ text: side, hot: side === choice }],
  });
}

function bingo(bet: number): RoundResult {
  const pool = Array.from({ length: 75 }, (_, index) => index + 1).sort(() => Math.random() - 0.5);
  const card = pool.slice(0, 25);
  card[12] = 0;
  const called = new Set(pool.slice(25, 43));
  const lines = [0, 5, 10, 15, 20].flatMap((start) => [[start, start + 1, start + 2, start + 3, start + 4]]);
  for (let col = 0; col < 5; col += 1) lines.push([col, col + 5, col + 10, col + 15, col + 20]);
  lines.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  const marked = (index: number) => card[index] === 0 || called.has(card[index]!);
  const hits = lines.filter((line) => line.every(marked)).length;
  const full = card.every((_, index) => marked(index));
  return settle(bet, full ? 40 : hits >= 2 ? 8 : hits === 1 ? 3 : 0, full ? "Full card" : hits ? `${hits} line${hits > 1 ? "s" : ""}` : "No line", "Eighteen calls. Center is free.", {
    title: "Card",
    faces: card.map((n, index) => ({ text: n === 0 ? "★" : String(n), hot: marked(index) })),
  });
}

function scratch(bet: number): RoundResult {
  const symbols = ["Star", "Seven", "Heart", "Crown", "Chip"];
  const cells = Array.from({ length: 9 }, () => symbols[Math.floor(Math.random() * symbols.length)]!);
  const counts = new Map<string, number>();
  for (const cell of cells) counts.set(cell, (counts.get(cell) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
  const pay: Record<string, number> = { Star: 12, Seven: 8, Heart: 4, Crown: 3, Chip: 2 };
  return settle(bet, best[1] >= 3 ? pay[best[0]]! : 0, best[1] >= 3 ? best[0]! : "No set", "Three of a kind pays.", {
    title: "Foil",
    faces: cells.map((cell) => ({ text: cell, hot: cell === best[0] && best[1] >= 3 })),
  });
}

function fanTan(bet: number, choice: string): RoundResult {
  const beads = 20 + Math.floor(Math.random() * 180);
  const rem = String(beads % 4 || 4);
  return settle(bet, rem === choice ? 4 : 0, rem === choice ? `Remainder ${rem}` : `It was ${rem}`, `${beads} beads. A hit pays 3 to 1.`, {
    title: rem,
    faces: [{ text: rem, hot: rem === choice }],
  });
}

function community(bet: number, holeCount: number): RoundResult {
  const deck = oneDeck();
  const player = deck.slice(0, holeCount);
  const dealer = deck.slice(holeCount, holeCount * 2);
  const board = deck.slice(holeCount * 2, holeCount * 2 + 5);
  const scoreOf = (hole: Card[]) => {
    if (holeCount === 2) return best5([...hole, ...board]);
    return Math.max(...combinations(hole, 2).flatMap((pair) => combinations(board, 3).map((three) => eval5([...pair, ...three]))));
  };
  const yours = scoreOf(player);
  const theirs = scoreOf(dealer);
  const visual = rows(handName(yours), [["You", player], ["Board", board]]);
  if (holeCount === 2 && theirs < pack(1, [0])) return settle(bet, 2, "No qualify", "Dealer needed a pair.", visual);
  if (yours > theirs) return settle(bet, 2, handName(yours), holeCount === 4 ? "Exactly two hole cards." : "Best five.", visual);
  if (yours < theirs) return settle(bet, 0, handName(theirs), "Dealer found better.", visual);
  return settle(bet, 1, "Push", "The hands match.", visual);
}

function chuck(bet: number, face: number): RoundResult {
  const dice = [die(), die(), die()];
  const hits = dice.filter((value) => value === face).length;
  return settle(bet, hits === 0 ? 0 : hits + 1, hits ? `${hits} hit${hits > 1 ? "s" : ""}` : "Miss", `Called ${face}.`, {
    title: dice.join(" · "),
    faces: dice.map((value) => ({ text: String(value), hot: value === face })),
  });
}

function redBlack(bet: number, choice: string): RoundResult {
  const n = Math.floor(Math.random() * 37);
  const reds = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const hit =
    (choice === "red" && reds.has(n)) ||
    (choice === "black" && n !== 0 && !reds.has(n)) ||
    (choice === "even" && n !== 0 && n % 2 === 0) ||
    (choice === "odd" && n % 2 === 1) ||
    (choice === "low" && n >= 1 && n <= 18) ||
    (choice === "high" && n >= 19);
  return settle(bet, hit ? 2 : 0, hit ? `${n} hits` : n === 0 ? "Zero" : `${n} misses`, "Outside bets pay even.", {
    title: String(n),
    faces: [{ text: String(n), hot: hit, bad: reds.has(n) }],
  });
}

function penalty(bet: number, choice: string): RoundResult {
  const corners = ["left", "center", "right"];
  const keeper = corners[Math.floor(Math.random() * 3)]!;
  const scored = keeper !== choice;
  return settle(bet, scored ? 2.4 : 0, scored ? "Goal" : "Saved", `You went ${choice}. Keeper went ${keeper}.`, {
    title: scored ? "Goal" : "Save",
    faces: corners.map((corner) => ({ text: corner, hot: corner === choice, bad: corner === keeper })),
  });
}

function lightning(bet: number, choice: string): RoundResult {
  const dice = [die(), die(), die()];
  const total = dice.reduce((sum, face) => sum + face, 0);
  const triple = new Set(dice).size === 1;
  const strike = Math.random() < 0.12;
  const visual = { title: `Total ${total}`, faces: dice.map((face) => ({ text: String(face), hot: strike })) };
  if (triple) return settle(bet, 0, "Triple", "Triples take the outside.", visual);
  const win = choice === "small" ? total <= 10 : total >= 11;
  return settle(bet, win ? (strike ? 4 : 2) : 0, win && strike ? "Lightning" : win ? "Hits" : "Miss", `Total ${total}.`, visual);
}

function yacht(bet: number): RoundResult {
  const dice = Array.from({ length: 5 }, die);
  const counts = new Map<number, number>();
  for (const face of dice) counts.set(face, (counts.get(face) ?? 0) + 1);
  const groups = [...counts.values()].sort((a, b) => b - a);
  const unique = [...new Set(dice)].sort((a, b) => a - b).join();
  const straight = unique === "1,2,3,4,5" || unique === "2,3,4,5,6";
  const mult = groups[0] === 5 ? 30 : groups[0] === 4 ? 8 : groups[0] === 3 && groups[1] === 2 ? 6 : straight ? 5 : groups[0] === 3 ? 2 : 0;
  const name = mult === 30 ? "Yacht" : mult === 8 ? "Four" : mult === 6 ? "Full house" : mult === 5 ? "Straight" : mult === 2 ? "Three" : "Nothing";
  return settle(bet, mult, name, dice.join(" · "), { title: name, faces: dice.map((face) => ({ text: String(face), hot: mult > 0 })) });
}

export function keno(bet: number, picks: number[]): RoundResult {
  const chosen = [...new Set(picks)].filter((n) => n >= 1 && n <= 40).slice(0, 6);
  if (chosen.length < 6) return settle(bet, 1, "Mark six", "Choose six stars first.", { title: "Keno", faces: [] });
  const bag = Array.from({ length: 40 }, (_, index) => index + 1).sort(() => Math.random() - 0.5).slice(0, 10);
  const hits = chosen.filter((n) => bag.includes(n)).length;
  const mult = [0, 0, 0, 1, 4, 18, 80][hits] ?? 0;
  return settle(bet, mult, `${hits} hits`, "Four returns the stake. Six pays 80.", {
    title: "Draw",
    faces: bag.map((n) => ({ text: String(n), hot: chosen.includes(n) })),
  });
}

const PLINKO: Record<string, number[]> = {
  low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  mid: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
  high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
};

export function dropPlinko(bet: number, risk: string): RoundResult {
  const table = PLINKO[risk] ?? PLINKO.mid!;
  let slot = 0;
  const path: string[] = [];
  for (let row = 0; row < 8; row += 1) {
    const right = Math.random() < 0.5;
    if (right) slot += 1;
    path.push(right ? "R" : "L");
  }
  const mult = table[Math.min(slot, table.length - 1)] ?? 0;
  return settle(bet, mult, `${mult}×`, path.join(" "), { title: `Slot ${slot + 1}`, faces: path.map((step) => ({ text: step, hot: step === "R" })) });
}

export function minesMultiplier(picks: number): number {
  let mult = 1;
  for (let i = 0; i < picks; i += 1) mult *= (25 - i) / (21 - i);
  return Math.floor(mult * 0.96 * 100) / 100;
}

export function towerMultiplier(floors: number): number {
  return Math.floor(1.42 ** floors * 100) / 100;
}

const DRAW_PAY: Record<string, number> = {
  "Royal flush": 800,
  "Straight flush": 50,
  "Four of a kind": 25,
  "Full house": 9,
  Flush: 6,
  Straight: 4,
  "Three of a kind": 3,
  "Two pair": 2,
  "Jacks or better": 1,
};

function namedFive(cards: Card[]): { name: string; mult: number } {
  const score = eval5(cards);
  const cat = Math.floor(score / 16 ** 5);
  if (cat === 8) {
    const high = Math.floor(score / 16 ** 4) % 16;
    return { name: high === 14 ? "Royal flush" : "Straight flush", mult: high === 14 ? 800 : 50 };
  }
  if (cat === 1) {
    const pair = Math.floor(score / 16 ** 4) % 16;
    return { name: pair >= 11 ? "Jacks or better" : "Nothing", mult: pair >= 11 ? 1 : 0 };
  }
  const name = handName(score);
  return { name, mult: DRAW_PAY[name] ?? 0 };
}

export function scoreDraw(cards: Card[], mode: "deuces" | "bonus"): { name: string; mult: number } {
  if (mode === "bonus") {
    const base = namedFive(cards);
    if (base.name !== "Four of a kind") return base;
    const counts = new Map<number, number>();
    for (const card of cards) counts.set(rankValue(card.rank), (counts.get(rankValue(card.rank)) ?? 0) + 1);
    const quad = [...counts.entries()].find(([, count]) => count === 4)?.[0] ?? 0;
    if (quad === 14) return { name: "Four aces", mult: 80 };
    if (quad >= 2 && quad <= 4) return { name: "Four 2s–4s", mult: 40 };
    return { name: "Four 5s–Kings", mult: 25 };
  }
  const wilds = cards.filter((card) => card.rank === "2").length;
  if (wilds === 4) return { name: "Four deuces", mult: 200 };
  const rest = cards.filter((card) => card.rank !== "2");
  const ranks: Rank[] = ["A", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let best = { name: "Nothing", mult: 0 };
  const walk = (left: number, built: Card[]) => {
    if (left === 0) {
      const scored = namedFive([...rest, ...built]);
      const wildPay: Record<string, number> = { "Royal flush": 25, "Straight flush": 9, "Four of a kind": 5, "Full house": 3, Flush: 2, Straight: 2, "Three of a kind": 1 };
      const mult = wilds ? (wildPay[scored.name] ?? 0) : scored.mult;
      if (mult > best.mult) best = { name: wilds && mult ? `${scored.name}` : scored.name, mult };
      return;
    }
    for (const rank of ranks) walk(left - 1, [...built, { rank, suit: rest[0]?.suit ?? "S" }]);
  };
  walk(wilds, []);
  return best;
}

export function freshFive(): { cards: Card[]; deck: Card[] } {
  const deck = oneDeck();
  return { cards: deck.slice(0, 5), deck: deck.slice(5) };
}
