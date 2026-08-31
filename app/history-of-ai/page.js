// Thin server wrapper for the "History of AI" exercise.
//
// Page-level metadata lives here (server components can export `metadata`,
// client components cannot), which keeps the exercise component itself a clean,
// self-contained "use client" artifact that can be migrated to the
// institutional system unchanged.
import { getExercise } from "@/lib/exercises";
import Exercise from "./exercise";

const details = getExercise("history-of-ai");

export const metadata = {
  title: details.title,
  description: details.description,
};

export default function Page() {
  return <Exercise />;
}
