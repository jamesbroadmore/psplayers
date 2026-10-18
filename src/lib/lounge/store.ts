import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Floor } from "@/lib/lounge/catalog";
import type { CharacterId } from "@/lib/lounge/characters";

export type GameId = Floor | "comp";

export type Ledger = {
  id: string;
  at: number;
  game: GameId;
  note: string;
  delta: number;
  balance: number;
};

type State = {
  balance: number;
  ofAge: boolean;
  muted: boolean;
  toggleMute: () => void;
  reset: () => void;
  hostId: CharacterId;
  hostMoment: "win" | "loss" | null;
  hostBeat: number;
  setHost: (id: CharacterId) => void;
  noteHost: (moment: "win" | "loss" | null) => void;
};

export const useCasino = create<State>()(
  persist(
    (set, get) => ({
      balance: STARTING_CHIPS,
      ofAge: false,
      muted: false,
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      reset: () => set({ balance: STARTING_CHIPS, ledger: [] }),
      hostId: "cleo",
      hostMoment: null,
      hostBeat: 0,
      setHost: (hostId) => set({ hostId }),
      noteHost: (hostMoment) => set((state) => ({ hostMoment, hostBeat: state.hostBeat + 1 })),
    }),
    { name: "pp-players-v1" },
  ),
);

export function formatChips(n: number): string {
  return new Intl.NumberFormat("en-AU").format(n);
}

export function formatDelta(n: number): string {
  const body = formatChips(Math.abs(n));
  if (n > 0) return `+${body}`;
  if (n < 0) return `−${body}`;
  return "0";
}
