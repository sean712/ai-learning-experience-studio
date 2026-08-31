// Thin server wrapper for the "What is money?" poll (ME9.2).
// Metadata lives here so the exercise component stays a clean "use client"
// artifact (see the me6-3-game-theory wrapper for the same pattern).
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("me9-2-what-is-money");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
