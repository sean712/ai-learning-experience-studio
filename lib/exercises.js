// Single source of truth for the exercises hosted by this site.
//
// The home page reads this list to build its menu, and each entry's `slug`
// matches a folder under `app/<slug>/` that renders the exercise.
//
// To add a new exercise:
//   1. Create `app/<slug>/exercise.js` and paste in your exercise component
//      (a "use client" React component with a default export).
//   2. Create `app/<slug>/page.js` as a thin wrapper (copy an existing one and
//      change the import and the metadata title).
//   3. Add an entry below with the same slug, plus a title and description.
//
// Keep the order here as the order you want exercises to appear in the menu.
export const exercises = [
  {
    slug: "history-of-ai",
    title: "History of AI",
    description:
      "Explore an interactive timeline of the key milestones in the development of artificial intelligence, from early neural networks to today.",
  },
  {
    slug: "knowledge-check",
    title: "AI foundations knowledge check",
    description:
      "Test your understanding of some landmark moments in the history of AI with a short set of multiple-choice questions and instant feedback.",
  },
];

// Helper used by exercise pages to look up their own metadata by slug.
export function getExercise(slug) {
  return exercises.find((exercise) => exercise.slug === slug);
}
