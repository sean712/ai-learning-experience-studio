// Thin server wrapper for the "Rating service quality" poll (MM6.3).
// Metadata lives here so the exercise component stays a clean "use client"
// artifact (see the me6-3-game-theory wrapper for the same pattern).
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("mm6-3-product");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
