// Thin server wrapper for the "AI foundations knowledge check" exercise.
// Metadata lives here so the exercise component can stay a clean "use client"
// artifact (see the history-of-ai wrapper for the same pattern).
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("knowledge-check");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
