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
    slug: "mm8-2-1-communications-objectives",
    title: "Setting communications objectives",
    description:
      "For each advert, choose its objective (inform, persuade or remind) and its communication task in the AIDA model (attention, interest, desire or action).",
  },
  {
    slug: "mm4-4-positioning",
    title: "Positioning map",
    description:
      "Drag each car manufacturer onto a positioning map (sporty to conservative and affordable to exclusive), then compare your map with a suggested solution.",
  },
  {
    slug: "mm6-3-product",
    title: "Rating service quality",
    description:
      "Rate a company of your choice on the five SERVQUAL dimensions of service quality, from 1 (low) to 5 (high).",
  },
  {
    slug: "me10-7-international-balances",
    title: "International balances",
    description:
      "Drag each definition into the right place in a table of international balances, showing which term it relates to and whether it is on the plus or minus side.",
  },
  {
    slug: "me10-4-who-gains-from-trade",
    title: "Who gains from trade?",
    description:
      "Sort groups into winners, losers or those who may not be affected by trade, then read the feedback on who tends to gain and lose.",
  },
  {
    slug: "me9-2-what-is-money",
    title: "What is money?",
    description:
      "A quick poll: for a list of items, decide whether each definitely counts as money, maybe counts as money or probably doesn't.",
  },
  {
    slug: "me7-3-components-of-gdp",
    title: "Components of GDP",
    description:
      "Drag each category into the right place in a table of the three ways of measuring GDP: the expenditure, income and output measures.",
  },
  {
    slug: "me6-8-extensive-form",
    title: "Games in extensive form",
    description:
      "Drag the labels onto a game tree to build a game in extensive form, with 'Letters' moving first and 'Numbers' moving second.",
  },
  {
    slug: "me6-3-game-theory",
    title: "Setting up a payoff matrix",
    description:
      "Drag each strategy and payoff into the right place in a game theory matrix, with GM as the row player and its payoff written first.",
  },
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
