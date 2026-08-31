// Thin server wrapper for the "Setting up a payoff matrix" exercise (ME6.3).
// Metadata lives here so the exercise component stays a clean "use client"
// artifact (see the history-of-ai wrapper for the same pattern).
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("me6-3-game-theory");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
