import { createServerFn } from "@tanstack/react-start";
import { AI_CHARACTERS, type CharacterId, type CharacterMoment } from "@/lib/lounge/characters";

type PoseRequest = { characterId: CharacterId; moment: CharacterMoment };
type PoseResult =
  | { ok: true; image: string }
  | { ok: false; message: string };

const VALID_IDS = new Set<CharacterId>(["cleo", "lumen", "noor", "vesper"]);
const VALID_MOMENTS = new Set<CharacterMoment>(["win", "loss", "commission"]);
const WINDOW_MS = 60 * 60 * 1000;
const MAX_IMAGES_PER_WINDOW = 12;
let windowStartedAt = 0;
let generatedInWindow = 0;

function validateRequest(input: unknown): PoseRequest {
  if (typeof input !== "object" || input === null) throw new Error("Invalid character request.");
  const candidate = input as Record<string, unknown>;
  if (
    typeof candidate.characterId !== "string" ||
    !VALID_IDS.has(candidate.characterId as CharacterId) ||
    typeof candidate.moment !== "string" ||
    !VALID_MOMENTS.has(candidate.moment as CharacterMoment)
  ) {
    throw new Error("Choose a character and a valid table moment.");
  }
  return {
    characterId: candidate.characterId as CharacterId,
    moment: candidate.moment as CharacterMoment,
  };
}

function promptFor(characterId: CharacterId, moment: CharacterMoment): string {
  const character = AI_CHARACTERS.find((item) => item.id === characterId)!;
  const momentPrompt: Record<CharacterMoment, string> = {
    win: "The player has just won the hand. Show the host celebrating the player's victory with a playful, flirtatious surrender pose: confident eye contact, a knowing smile, one hand resting on the velvet chair, and her tailored jacket worn open over a fully opaque satin camisole and high-waisted trousers. Make it a polished sensual fashion editorial, not a strip scene; she remains completely dressed and covered.",
    loss: "The player has just lost the hand. Show the host in a confident, teasing winner's pose, giving a knowing smile while keeping her elegant outfit on.",
    commission: "Create a fresh after-hours editorial pose: relaxed confidence, a flirtatious glance, and a luxurious opaque satin look.",
  };
  return [
    "Edit the supplied reference image into one polished, photorealistic premium lounge portrait.",
    `This is ${character.name}, a fictional, computer-generated adult character aged 25 or older. Treat the supplied game artwork as a fictional design asset and do not portray or imitate any real individual. Use the supplied reference as the identity anchor: preserve her same face, facial features, hair, skin tone, body proportions, and overall recognizable identity. Do not replace her with a different person.`,
    `Character direction: ${character.style}`,
    momentPrompt[moment],
    "Suggestive, playful, glamorous adult editorial styling only. Keep all intimate areas fully covered by opaque clothing. No nudity, no explicit sexual activity, no exposed intimate areas, no minors, no additional people, no text, and no logos. Tasteful cinematic lighting, flattering composition, upscale velvet-card-room setting.",
  ].join(" ");
}

// A small server-side ceiling protects the owner's image-generation quota. All
// calls remain user initiated; no generation runs on page load or in a loop.
export const generateCharacterPose = createServerFn({ method: "POST" })
  .validator(validateRequest)
  .handler(async ({ data }): Promise<PoseResult> => {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) return { ok: false, message: "AI character images are unavailable right now." };

    const now = Date.now();
    if (now - windowStartedAt >= WINDOW_MS) {
      windowStartedAt = now;
      generatedInWindow = 0;
    }
    if (generatedInWindow >= MAX_IMAGES_PER_WINDOW) {
      return { ok: false, message: "The portrait studio has reached its image limit for now. Try again later." };
    }
    generatedInWindow += 1;

    const character = AI_CHARACTERS.find((item) => item.id === data.characterId)!;
    let response: Response;
    try {
      response = await fetch("https://api.x.ai/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-imagine-image-2.0",
          prompt: promptFor(data.characterId, data.moment),
          image: { url: character.anchor, type: "image_url" },
          aspect_ratio: "3:2",
          resolution: "1k",
          quality: "low",
          response_format: "b64_json",
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      generatedInWindow = Math.max(0, generatedInWindow - 1);
      return { ok: false, message: "The portrait studio could not be reached. Your chips have not been spent." };
    }

    if (!response.ok) {
      generatedInWindow = Math.max(0, generatedInWindow - 1);
      return { ok: false, message: "The portrait could not be made. Your chips have not been spent." };
    }

    let body: { data?: Array<{ b64_json?: string; mime_type?: string }> };
    try {
      body = (await response.json()) as { data?: Array<{ b64_json?: string; mime_type?: string }> };
    } catch {
      generatedInWindow = Math.max(0, generatedInWindow - 1);
      return { ok: false, message: "The portrait service returned an unreadable result. Your chips have not been spent." };
    }
    const image = body.data?.[0]?.b64_json;
    if (!image || image.length > 12_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) {
      generatedInWindow = Math.max(0, generatedInWindow - 1);
      return { ok: false, message: "The portrait service returned an invalid image. Your chips have not been spent." };
    }
    const mime = body.data?.[0]?.mime_type;
    const contentType = mime === "image/webp" || mime === "image/png" ? mime : "image/jpeg";
    return { ok: true, image: `data:${contentType};base64,${image}` };
  });
