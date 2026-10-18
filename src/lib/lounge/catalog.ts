export type Floor =
  | "pokies"
  | "blackjack"
  | "roulette"
  | "baccarat"
  | "poker"
  | "crash"
  | "hilo"
  | "dice"
  | "keno"
  | "plinko"
  | "mines"
  | "sicbo"
  | "craps"
  | "threecard"
  | "war"
  | "dragon"
  | "andar"
  | "teen"
  | "stud"
  | "ride"
  | "reddog"
  | "paigow"
  | "bigsix"
  | "limbo"
  | "tower"
  | "gems"
  | "coin"
  | "bingo"
  | "scratch"
  | "deuces"
  | "fantan"
  | "pontoon"
  | "holdem"
  | "chuck"
  | "redblack"
  | "bonus"
  | "wheel"
  | "penalty"
  | "balloon"
  | "omaha"
  | "lightning"
  | "yacht";

export type GameFamily = "Live" | "Cards" | "Dice" | "Reels" | "Instant";

export type GameOption = { id: string; label: string; hint?: string };

export type LoungeGame = {
  id: Floor;
  kicker: string;
  name: string;
  copy: string;
  meta: string;
  art: string;
  pace: "live" | "private";
  family: GameFamily;
  classic: boolean;
  options?: GameOption[];
};

export const CATALOG: LoungeGame[] = [
  { id: "pokies", kicker: "Three reel", name: "Neon 77", copy: "Five lines, a wild star, and sevens that pay anywhere.", meta: "From 10 chips", art: "/art/pokies.jpg", pace: "live", family: "Reels", classic: true },
  { id: "blackjack", kicker: "Six decks", name: "The Velvet Hand", copy: "Dealer stands on 17. Blackjack pays three to two.", meta: "From 50 chips", art: "/art/blackjack.jpg", pace: "live", family: "Live", classic: true },
  { id: "roulette", kicker: "Single zero", name: "Midnight Wheel", copy: "European wheel. Straights, dozens, and the outside.", meta: "Chips from 10", art: "/art/roulette.jpg", pace: "live", family: "Live", classic: true },
  { id: "baccarat", kicker: "Punto banco", name: "The Gold Shoe", copy: "Player, banker, or the tie. Commission on the banker.", meta: "From 25 chips", art: "/art/baccarat.jpg", pace: "live", family: "Live", classic: true },
  { id: "poker", kicker: "Jacks or better", name: "Royal Velvet", copy: "Five cards. Hold the star hand. A royal pays 800.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: true },
  { id: "crash", kicker: "Cash out", name: "Star Crash", copy: "The star climbs. Take the multiplier before it breaks.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: true },
  { id: "hilo", kicker: "One deck", name: "Higher", copy: "Call the next card. A tie drops the climb.", meta: "From 10 chips", art: "/art/hilo.jpg", pace: "private", family: "Cards", classic: true },
  { id: "dice", kicker: "Two dice", name: "Pink Dice", copy: "Low, high, seven, or any pair.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: true },
  { id: "keno", kicker: "Pick six", name: "Star Keno", copy: "Mark six stars. Ten are drawn. Four or better pays.", meta: "From 10 chips", art: "/art/pokies.jpg", pace: "private", family: "Reels", classic: false },
  { id: "plinko", kicker: "Eight rows", name: "Velvet Drop", copy: "Drop a chip through the pins. Risk sets the edges.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: false, options: [{ id: "low", label: "Low" }, { id: "mid", label: "Mid" }, { id: "high", label: "High" }] },
  { id: "mines", kicker: "Five by five", name: "Silk Mines", copy: "Reveal silk. Avoid four mines. Cash whenever you like.", meta: "From 10 chips", art: "/art/hilo.jpg", pace: "private", family: "Instant", classic: false },
  { id: "sicbo", kicker: "Three dice", name: "Sic Bo", copy: "Small, big, or any triple. Triples pay thirty to one.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: false, options: [{ id: "small", label: "Small 4–10" }, { id: "big", label: "Big 11–17" }, { id: "triple", label: "Any triple" }] },
  { id: "craps", kicker: "Pass line", name: "Come Out", copy: "Pass or don't pass. The point has to repeat.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: false, options: [{ id: "pass", label: "Pass" }, { id: "dont", label: "Don't pass" }] },
  { id: "threecard", kicker: "Three cards", name: "Three Card", copy: "Your three against the dealer. Queen high qualifies.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "war", kicker: "One card", name: "Casino War", copy: "High card takes it. A tie burns three and goes to war.", meta: "From 10 chips", art: "/art/blackjack.jpg", pace: "private", family: "Cards", classic: false },
  { id: "dragon", kicker: "One each", name: "Dragon Tiger", copy: "Dragon, tiger, or the tie. Higher card wins.", meta: "From 10 chips", art: "/art/baccarat.jpg", pace: "private", family: "Cards", classic: false, options: [{ id: "dragon", label: "Dragon" }, { id: "tiger", label: "Tiger" }, { id: "tie", label: "Tie · 8 to 1" }] },
  { id: "andar", kicker: "Match the joker", name: "Andar Bahar", copy: "A joker is dealt. Andar and bahar race to match it.", meta: "From 10 chips", art: "/art/baccarat.jpg", pace: "private", family: "Cards", classic: false, options: [{ id: "andar", label: "Andar" }, { id: "bahar", label: "Bahar" }] },
  { id: "teen", kicker: "Three cards", name: "Teen Patti", copy: "Trail, sequence, color, pair, or high. Beat the dealer.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "stud", kicker: "Five cards", name: "Caribbean Stud", copy: "Dealer qualifies with ace-king. A winning pair pays up.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "ride", kicker: "Three bets", name: "Let It Ride", copy: "Three equal bets. Pull one, pull another, then the river.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "reddog", kicker: "The spread", name: "Red Dog", copy: "Two cards set a spread. The third has to land between.", meta: "From 10 chips", art: "/art/hilo.jpg", pace: "private", family: "Cards", classic: false },
  { id: "paigow", kicker: "Seven cards", name: "Pai Gow", copy: "House-way sets a five and a two. Win both to take the pot.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "bigsix", kicker: "Money wheel", name: "Big Six", copy: "Bet a segment. Ones are common. Forty is rare.", meta: "From 10 chips", art: "/art/roulette.jpg", pace: "private", family: "Live", classic: false, options: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "5", label: "5" }, { id: "10", label: "10" }, { id: "20", label: "20" }, { id: "40", label: "40" }] },
  { id: "limbo", kicker: "Set a target", name: "Limbo", copy: "Name a multiplier. The roll has to clear it.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: false, options: [{ id: "1.5", label: "1.50×" }, { id: "2", label: "2×" }, { id: "3", label: "3×" }, { id: "5", label: "5×" }, { id: "10", label: "10×" }] },
  { id: "tower", kicker: "Four floors", name: "The Tower", copy: "Three doors a floor. One is trouble. Climb or cash.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: false },
  { id: "gems", kicker: "Five stones", name: "Diamonds", copy: "Five gems drop. Matches pay, from a pair up to five of a kind.", meta: "From 10 chips", art: "/art/pokies.jpg", pace: "private", family: "Instant", classic: false },
  { id: "coin", kicker: "Two sides", name: "The Toss", copy: "Call heads or tails. Even money, a little house shade.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Instant", classic: false, options: [{ id: "heads", label: "Heads" }, { id: "tails", label: "Tails" }] },
  { id: "bingo", kicker: "Five by five", name: "Pink Bingo", copy: "One card, eighteen calls. A line pays. The full card sings.", meta: "From 10 chips", art: "/art/pokies.jpg", pace: "private", family: "Reels", classic: false },
  { id: "scratch", kicker: "Nine cells", name: "Gold Scratch", copy: "Scratch the foil. Three of a kind pays on the spot.", meta: "From 10 chips", art: "/art/pokies.jpg", pace: "private", family: "Reels", classic: false },
  { id: "deuces", kicker: "Deuces wild", name: "Deuces Wild", copy: "Twos are wild. Four deuces is the loud hand.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "fantan", kicker: "Beads", name: "Fan Tan", copy: "A pile of beads, divided by four. Bet the remainder.", meta: "From 10 chips", art: "/art/baccarat.jpg", pace: "private", family: "Live", classic: false, options: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }] },
  { id: "pontoon", kicker: "British 21", name: "Pontoon", copy: "Twist or stick. A pontoon pays two to one. Five cards do too.", meta: "From 10 chips", art: "/art/blackjack.jpg", pace: "private", family: "Cards", classic: false },
  { id: "holdem", kicker: "Two hole cards", name: "Hold'em", copy: "You and the dealer take the best five. Dealer needs a pair.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "chuck", kicker: "Pick a face", name: "Chuck-a-Luck", copy: "Three dice. One match pays even. Three matches pay three to one.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: false, options: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" }, { id: "4", label: "4" }, { id: "5", label: "5" }, { id: "6", label: "6" }] },
  { id: "redblack", kicker: "Outside bet", name: "Red or Black", copy: "A single-zero spin. Color, even, or the high side.", meta: "From 10 chips", art: "/art/roulette.jpg", pace: "private", family: "Live", classic: false, options: [{ id: "red", label: "Red" }, { id: "black", label: "Black" }, { id: "even", label: "Even" }, { id: "odd", label: "Odd" }, { id: "low", label: "1–18" }, { id: "high", label: "19–36" }] },
  { id: "bonus", kicker: "Bonus quads", name: "Bonus Poker", copy: "Jacks or better, with a sweeter four of a kind.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "wheel", kicker: "Forty to one", name: "Money Wheel", copy: "A heavier wheel. The joker pays like a forty.", meta: "From 10 chips", art: "/art/roulette.jpg", pace: "private", family: "Live", classic: false, options: [{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "5", label: "5" }, { id: "10", label: "10" }, { id: "20", label: "20" }, { id: "40", label: "40" }] },
  { id: "penalty", kicker: "Three corners", name: "The Kick", copy: "Pick a corner. The keeper picks one. A goal pays seven to five.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: false, options: [{ id: "left", label: "Left" }, { id: "center", label: "Center" }, { id: "right", label: "Right" }] },
  { id: "balloon", kicker: "Pump or cash", name: "Balloon", copy: "Each pump lifts the pay. Cash before it pops.", meta: "From 10 chips", art: "/art/crash.jpg", pace: "private", family: "Instant", classic: false },
  { id: "omaha", kicker: "Four hole cards", name: "Omaha", copy: "Use exactly two of yours and three from the board.", meta: "From 10 chips", art: "/art/poker.jpg", pace: "private", family: "Cards", classic: false },
  { id: "lightning", kicker: "Boosted dice", name: "Lightning Dice", copy: "Small or big. A lightning strike doubles a win.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: false, options: [{ id: "small", label: "Small 4–10" }, { id: "big", label: "Big 11–17" }] },
  { id: "yacht", kicker: "Five dice", name: "Yacht", copy: "One throw, five dice. The house scores your best pattern.", meta: "From 10 chips", art: "/art/dice.jpg", pace: "private", family: "Dice", classic: false },
];

export const FAMILIES: Array<GameFamily | "All"> = ["All", "Live", "Cards", "Dice", "Reels", "Instant"];

export function getGame(id: Floor): LoungeGame {
  return CATALOG.find((game) => game.id === id) ?? CATALOG[0]!;
}
