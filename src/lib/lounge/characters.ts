export type CharacterId = "cleo" | "lumen" | "noor" | "vesper" | "rio" | "jax";
export type CharacterMoment = "win" | "loss" | "commission";

export type AICharacter = {
  id: CharacterId;
  name: string;
  age: string;
  years: number;
  gender: "woman" | "man";
  title: string;
  style: string;
  personality: string;
  idle: string;
  portrait: string;
  anchor: string;
  poseReady: boolean;
  lines: Record<"win" | "loss", string[]>;
};

const RAW_ART = "https://raw.githubusercontent.com/cdxidigital/psplayers/main/public/art";

export const AI_CHARACTERS: AICharacter[] = [
  {
    id: "cleo",
    name: "Cleo",
    age: "Fictional adult · 29",
    years: 29,
    gender: "woman",
    title: "The velvet tease",
    style: "Warm, wicked, and always one beat ahead.",
    personality: "Cheeky cabaret host. She flirts like the bow tie is a dare and never lets a winner leave without a compliment that goes a little too far.",
    idle: "Sit down, darling. I only get dangerous after the cards do.",
    portrait: "/art/dealer-cleo.jpg",
    anchor: `${RAW_ART}/dealer-cleo.jpg`,
    poseReady: true,
    lines: {
      win: [
        "You won, and I am choosing to take that personally. In the fun way.",
        "Lucky hands get the dangerous smile. Try not to spend it all at once.",
        "That was gorgeous. Lean in. I only say the good lines twice.",
        "Careful. Winners make me forget I am supposed to be on the house's side.",
      ],
      loss: [
        "The house takes the chips. I still like the way you lose.",
        "Almost. Almost gets a look, not a payout.",
        "Bold, wrong, and still cute. A dangerous combination.",
        "Come back when you want the version of me that misbehaves for winners.",
      ],
    },
  },
  {
    id: "lumen",
    name: "Lumen",
    age: "Fictional adult · 27",
    years: 27,
    gender: "woman",
    title: "The after-hours star",
    style: "Cool confidence with a mischievous streak.",
    personality: "Spotlight trouble. She talks like the room is already watching, and she rewards a win with a wink that feels one notch too private.",
    idle: "The light likes you. The cards have not decided yet.",
    portrait: "/art/dealer-lumen.jpg",
    anchor: `${RAW_ART}/dealer-lumen.jpg`,
    poseReady: true,
    lines: {
      win: [
        "The table has a new favorite. I was ahead of the table.",
        "You can look. Winners are allowed to look.",
        "I knew you had it. I just wanted to watch you prove it.",
        "That win bought you the after-hours voice. Do not waste it.",
      ],
      loss: [
        "I knew you would blink. I enjoyed the blink.",
        "Pretty try. Pretty does not pay.",
        "The spotlight stays on me when the chips go the other way.",
        "Lose prettier next time and I might still walk you out.",
      ],
    },
  },
  {
    id: "noor",
    name: "Noor",
    age: "Fictional adult · 31",
    years: 31,
    gender: "woman",
    title: "The golden-hour gambler",
    style: "Elegant, composed, and quietly daring.",
    personality: "Silk and side-eye. She sounds polite until the win lands, then the compliment arrives low, slow, and unmistakably flirtatious.",
    idle: "Grace first. Trouble if you earn it.",
    portrait: "/art/dealer-noor.jpg",
    anchor: `${RAW_ART}/dealer-noor.jpg`,
    poseReady: true,
    lines: {
      win: [
        "Beautifully played. Stay close. I am not finished admiring it.",
        "The room noticed. I noticed first, and I am less polite about it.",
        "A win like that deserves a slower smile. Here it is.",
        "You may keep the chips. I am keeping the memory of that hand.",
      ],
      loss: [
        "A gracious loss is still a loss. I will be gracious anyway.",
        "Darling, the gold does not follow hope. It follows nerve.",
        "I would console you, but you might enjoy it too much.",
        "Come back sharper. I prefer my trouble well played.",
      ],
    },
  },
  {
    id: "vesper",
    name: "Vesper",
    age: "Fictional adult · 33",
    years: 33,
    gender: "woman",
    title: "The midnight dealer",
    style: "A polished provocateur with a dry smile.",
    personality: "Dry, expensive, and a little indecent with a sentence. She never raises her voice. She just makes the winner feel seen.",
    idle: "Midnight rules. Speak softly, bet like you mean it.",
    portrait: "/art/dealer-vesper.jpg",
    anchor: `${RAW_ART}/dealer-vesper.jpg`,
    poseReady: true,
    lines: {
      win: [
        "Well played. I will pretend I am surprised, if you pretend not to like the attention.",
        "You took the hand. I am considering taking the rest of your evening.",
        "That was clean. I like clean. I like what comes after clean even more.",
        "Do not look so pleased. Actually, do. It suits the lighting.",
      ],
      loss: [
        "The cards were honest. You were optimistic. I respect one of those.",
        "I would offer a shoulder, but you would make it weird. Tempting.",
        "Losses build character. Yours is already more interesting than your cards.",
        "Try again. I am not bored of you yet, which is saying something.",
      ],
    },
  },
  {
    id: "rio",
    name: "Rio",
    age: "Fictional adult · 26",
    years: 26,
    gender: "man",
    title: "The revue lead",
    style: "Bright trouble in a bow tie.",
    personality: "Showman energy. He treats a win like a cue to step closer, drop the voice, and make the compliment feel like a private encore.",
    idle: "Pick a game. I already picked who I am rooting for.",
    portrait: "/art/dealer-rio.png",
    anchor: "/art/dealer-rio.png",
    poseReady: false,
    lines: {
      win: [
        "There it is. I told the room you had it. I did not tell them I was hoping.",
        "Winners get the encore. Step in. I do not share the good lines.",
        "You just made this vest feel too formal. Chips are yours.",
        "That was hot. The hand, I mean. Mostly the hand.",
      ],
      loss: [
        "House wins. I still walked over, so do not look so abandoned.",
        "Close. Close gets a grin, not the encore.",
        "Shake it off. I have seen worse, and I stayed for those too.",
        "Lose the hand, not the nerve. I like the nerve.",
      ],
    },
  },
  {
    id: "jax",
    name: "Jax",
    age: "Fictional adult · 32",
    years: 32,
    gender: "man",
    title: "The satin showman",
    style: "Low voice, tailored trouble.",
    personality: "Quiet confidence. He does not chase the table. He lets a win pull him in, then says one line that lingers.",
    idle: "Whenever you are ready. I am already watching the interesting seat.",
    portrait: "/art/dealer-jax.png",
    anchor: "/art/dealer-jax.png",
    poseReady: false,
    lines: {
      win: [
        "Took it clean. I am going to stand a little closer for the next one.",
        "You play like you know I am watching. I am.",
        "That win earned the low voice. Do not make me repeat it louder.",
        "Keep the chips. I will keep the way you looked when they landed.",
      ],
      loss: [
        "Not tonight. I am still not walking away.",
        "The felt was mean. I am not.",
        "You can have the consolation. It is just me, staying.",
        "Reset. I prefer the version of you that comes back swinging.",
      ],
    },
  },
];

export function getAICharacter(id: CharacterId): AICharacter {
  return AI_CHARACTERS.find((character) => character.id === id) ?? AI_CHARACTERS[0]!;
}

export function characterPortrait(characterId: CharacterId): string {
  const character = getAICharacter(characterId);
  return `/art/dealer-${character.id}.${character.gender === "woman" ? "jpg" : "png"}`;
}

export function hostLine(id: CharacterId, moment: "win" | "loss", salt: number): string {
  const lines = getAICharacter(id).lines[moment];
  const index = Math.abs(salt) % lines.length;
  return lines[index] ?? lines[0]!;
}
