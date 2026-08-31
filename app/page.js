// Home page: a simple menu of the available exercises. This is site chrome
// rather than an embedded exercise, so it is a server component and uses
// next/link for fast client-side navigation. It still follows the same house
// style as the exercises: British English, sentence case, a single-column
// layout, accessible colour contrast and full keyboard support.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { exercises } from "@/lib/exercises";

export default function HomePage() {
  return (
    // Using min-h-full (never min-h-screen) so the layout also behaves inside
    // an iframe, where the viewport height is set by the parent page.
    <main className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Page header */}
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">
            Interactive exercises
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            AI learning experience studio
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            Choose an exercise to begin. Each one opens on its own page so it can
            be embedded directly in a Canvas course.
          </p>
        </header>

        {/* Exercise menu. Presented as a single-column list of links. */}
        <nav aria-label="Exercises">
          <ul className="grid grid-cols-1 gap-4">
            {exercises.map((exercise) => (
              <li key={exercise.slug}>
                <Link
                  href={`/${exercise.slug}`}
                  // The whole card is a single focusable link. A clear focus
                  // ring and hover state make the target obvious for keyboard
                  // and pointer users alike.
                  className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {exercise.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {exercise.description}
                      </p>
                    </div>
                    {/* Decorative arrow; hidden from screen readers because the
                        link text already describes the destination. */}
                    <ArrowRight
                      className="mt-1 h-5 w-5 flex-none text-indigo-600 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Friendly empty state in case the menu is ever cleared out. */}
        {exercises.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            No exercises have been added yet.
          </p>
        )}
      </div>
    </main>
  );
}
