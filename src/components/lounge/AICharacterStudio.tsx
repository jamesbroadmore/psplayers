import { useEffect, useState } from "react";
import { generateCharacterPose } from "@/lib/lounge/character.server";
import {
  AI_CHARACTERS,
  getAICharacter,
  type CharacterId,
  type CharacterMoment,
} from "@/lib/lounge/characters";
import { formatChips, useCasino } from "@/lib/lounge/store";

const COMMISSION_COST = 150;

const TABLE_LINES: Record<CharacterId, Record<"win" | "loss", string>> = {
  cleo: {
    win: "A lucky hand, darling. Try not to look too pleased.",
    loss: "That was almost charming. Almost.",
  },
  lumen: {
    win: "The table has a new favorite. Enjoy the view from the top.",
    loss: "I knew you would blink first.",
  },
  noor: {
    win: "Beautifully played. The room noticed.",
    loss: "A gracious loss is still a loss.",
  },
  vesper: {
    win: "Well played. I will pretend I am surprised.",
    loss: "The cards were honest. You were optimistic.",
  },
};

export function AICharacterStudio({
  moment,
  roundId,
}: {
  moment: "win" | "loss" | null;
  roundId: number;
}) {
  const [characterId, setCharacterId] = useState<CharacterId>("cleo");
  const [image, setImage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [freeRewardAvailable, setFreeRewardAvailable] = useState(false);
  const character = getAICharacter(characterId);
  const balance = useCasino((state) => state.balance);

  useEffect(() => {
    if (moment) {
      setFreeRewardAvailable(true);
      setMessage("");
    }
  }, [moment, roundId]);

  async function createPose(requestMoment: CharacterMoment, paid: boolean) {
    if (pending) return;
    if (paid && !useCasino.getState().apply("poker", "AI character pose", -COMMISSION_COST)) {
      setMessage("Not enough chips for a commissioned pose.");
      return;
    }

    setPending(true);
    setMessage("The character is setting the scene…");
    try {
      const result = await generateCharacterPose({ data: { characterId, moment: requestMoment } });
      if (!result.ok) {
        if (paid) useCasino.getState().apply("poker", "Pose commission refunded", COMMISSION_COST);
        setMessage(result.message);
        return;
      }
      setImage(result.image);
      setMessage(`${character.name}'s pose is ready.`);
      if (requestMoment === "win" || requestMoment === "loss") setFreeRewardAvailable(false);
    } catch {
      if (paid) useCasino.getState().apply("poker", "Pose commission refunded", COMMISSION_COST);
      setMessage("The portrait could not be made. Any commission chips have been refunded.");
    } finally {
      setPending(false);
    }
  }

  function claimOutcomePose() {
    if (!moment || !freeRewardAvailable || pending) return;
    void createPose(moment, false);
  }

  const outcomeLabel = moment === "win" ? "winner's reward" : "consolation pose";

  return (
    <section className="mt-6 overflow-hidden rounded-card border border-gold/40 bg-midnight" aria-labelledby="character-studio-title">
      <div className="border-b border-line px-4 py-4 sm:px-6">
        <p className="text-xs font-semibold tracking-brand text-pink">AI CHARACTER STUDIO</p>
        <h3 id="character-studio-title" className="mt-1 font-display text-xl text-gold">Pick your table companion</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">
          Each fictional adult character uses a fixed portrait as an identity reference. Win or lose to unlock one optional post-hand pose, or commission another for {formatChips(COMMISSION_COST)} chips.
        </p>
      </div>

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {AI_CHARACTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={characterId === option.id}
                disabled={pending}
                onClick={() => {
                  setCharacterId(option.id);
                  setImage(null);
                  setMessage("");
                }}
                className={`overflow-hidden rounded-md border text-left transition-colors ${characterId === option.id ? "border-gold bg-gold/10" : "border-line bg-graphite hover:border-gold/60"}`}
              >
                <img src={`/art/dealer-${option.id}.jpg`} alt="" className="h-24 w-full object-cover" />
                <span className="block px-2.5 py-2">
                  <span className="block text-sm font-semibold text-ink">{option.name}</span>
                  <span className="mt-0.5 block text-xs text-mist">{option.title}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-line bg-graphite/70 p-3">
            <p className="font-display text-lg text-gold">{character.name}</p>
            <p className="text-xs font-semibold tracking-brand text-pink">{character.age.toUpperCase()}</p>
            <p className="mt-2 text-sm text-mist">{character.style}</p>
          </div>

          {moment && (
            <div className="mt-3 flex gap-3 rounded-md border border-pink/40 bg-pink/5 p-3" aria-live="polite">
              <span className="mt-0.5 size-2 shrink-0 rounded-full bg-pink" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold tracking-brand text-pink">{moment === "win" ? "TABLE REACTION" : "AFTER THE HAND"}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">&ldquo;{TABLE_LINES[characterId][moment]}&rdquo;</p>
              </div>
            </div>
          )}

          {moment && freeRewardAvailable && (
            <button
              type="button"
              onClick={claimOutcomePose}
              disabled={pending}
              className="mt-3 min-h-11 w-full rounded-full bg-pink px-4 text-sm font-semibold text-midnight disabled:opacity-50"
            >
              Claim your {outcomeLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => void createPose("commission", true)}
            disabled={pending || balance < COMMISSION_COST}
            className="mt-3 min-h-11 w-full rounded-full border border-gold px-4 text-sm font-semibold text-gold hover:bg-gold hover:text-midnight disabled:opacity-40"
          >
            {pending ? "Creating pose…" : `Commission another pose · ${formatChips(COMMISSION_COST)} chips`}
          </button>
          <p className="mt-3 min-h-5 text-xs leading-relaxed text-mist" aria-live="polite">{message}</p>
          <p className="mt-1 text-xs leading-relaxed text-mist">
            Suggestive, fully covered adult glamour only. Generated images are temporary and stay in this table view.
          </p>
        </div>

        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-md border border-line bg-graphite lg:col-span-1">
          {image ? (
            <img src={image} alt={`${character.name} in an AI-generated table pose`} className="max-h-96 w-full object-contain" />
          ) : (
            <div className="px-6 py-8 text-center">
              <img src={`/art/dealer-${characterId}.jpg`} alt="" className="mx-auto max-h-56 rounded-md object-cover" />
              <p className="mt-3 text-xs text-mist">The reference portrait anchors each new pose to the same character.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
