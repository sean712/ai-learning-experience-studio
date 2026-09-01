// Thin server wrapper for the "Setting communications objectives" poll
// (MM8.2.1). Metadata lives here so the exercise component stays a clean
// "use client" artifact (see the me6-3-game-theory wrapper for the pattern).
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("mm8-2-1-communications-objectives");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
