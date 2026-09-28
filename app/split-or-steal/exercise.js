"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// A "select all that apply" grid for a classic prisoners' dilemma. The student
// ticks every outcome they think is a Nash equilibrium of the one-shot game. On
// checking, each of the four cells is marked correct or incorrect with a tick
// or a cross and colour, the cells that really are Nash equilibria are labelled,
// and the feedback explains the result. A read-only payoff matrix above the grid
// gives the numbers the student needs to reason it out.
// ---------------------------------------------------------------------------

// Ibrahim is the row player; Nick is the column player. Each key is an action.
const ROWS = ["Split", "Steal"]; // Ibrahim's announcement
const COLS = ["Split", "Steal"]; // Nick's announcement

// One entry per outcome, keyed by `${ibrahim}-${nick}`. `isNE` marks the three
// Nash equilibria of this game; `payoff` is (Ibrahim, Nick).
const CELL_INFO = {
  "Split-Split": { isNE: false, payoff: "(6800, 6800)" },
  "Split-Steal": { isNE: true, payoff: "(0, 13600)" },
  "Steal-Split": { isNE: true, payoff: "(13600, 0)" },
  "Steal-Steal": { isNE: true, payoff: "(0, 0)" },
};

const CELL_IDS = Object.keys(CELL_INFO);
const TOTAL = CELL_IDS.length; // four outcomes to classify
const STORAGE_KEY = "split-or-steal:v1";

const SplitOrSteal = () => {
  // Map of cell id to whether the student has ticked it as a Nash equilibrium.
  const [selections, setSelections] = useState({});
  // Whether the answers have been checked (reveals correctness and feedback).
  const [submitted, setSubmitted] = useState(false);
  // The most recent action, announced politely to screen reader users.
  const [announcement, setAnnouncement] = useState("");

  // Load any saved ticks once, after mount (avoids a hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = {};
        for (const id of CELL_IDS) {
          if (saved[id] === true) next[id] = true;
        }
        setSelections(next);
      }
    } catch {
      // localStorage may be unavailable; just start with an empty grid.
    }
  }, []);

  // Persist ticks whenever they change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    } catch {
      // Ignore storage failures.
    }
  }, [selections]);

  const selectedCount = CELL_IDS.filter((id) => selections[id]).length;
  // A cell is correct when the tick matches whether it really is an equilibrium.
  const correctCount = CELL_IDS.filter(
    (id) => Boolean(selections[id]) === CELL_INFO[id].isNE
  ).length;
  const allCorrect = submitted && correctCount === TOTAL;

  // Toggle a tick. Changing the grid clears the marking so the student can check
  // again once they are happy.
  const handleToggle = (cellId) => {
    setSelections((prev) => ({ ...prev, [cellId]: !prev[cellId] }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAnnouncement(
      `You correctly classified ${correctCount} of ${TOTAL} outcomes. Feedback is shown below.`
    );
  };

  const handleReset = () => {
    setSelections({});
    setSubmitted(false);
    setAnnouncement("The exercise has been reset. All ticks have been cleared.");
  };

  return (
    // min-h-full (never min-h-screen) so the exercise fills a Canvas iframe.
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Question */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Split or steal
          </h1>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">
            <p>
              Two people are playing a game, Ibrahim and Nick. The game host
              offers them £13,600. Each player has to announce at the same time
              whether they want to &apos;Split&apos; or &apos;Steal&apos;. The
              players cannot communicate about what they are going to do. The
              possible outcomes are:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Both players announce &apos;Split&apos; and they share the money equally.</li>
              <li>Both players announce &apos;Steal&apos; and they get nothing.</li>
              <li>
                One player announces &apos;Split&apos; and the other announces
                &apos;Steal&apos;. The player that announces steal wins all the
                money.
              </li>
            </ul>
          </div>
        </header>

        {/* Read-only payoff matrix so the student has the numbers to reason with.
            Each cell shows Ibrahim's payoff first, then Nick's. */}
        <section aria-label="Payoff matrix" className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Payoffs</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <caption className="sr-only">
                Payoff matrix. Each cell shows Ibrahim&apos;s payoff first, then
                Nick&apos;s payoff, in pounds.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-3 text-sm font-semibold text-white">
                    Payoffs (Ibrahim, Nick)
                  </th>
                  {COLS.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="bg-slate-800 p-3 text-center text-sm font-semibold text-white"
                    >
                      Nick {col.toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row}>
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-3 text-left text-sm font-semibold text-white"
                    >
                      Ibrahim {row.toLowerCase()}
                    </th>
                    {COLS.map((col) => (
                      <td
                        key={col}
                        className="border border-slate-200 bg-white p-3 text-center text-sm font-medium text-slate-800"
                      >
                        {CELL_INFO[`${row}-${col}`].payoff}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* The interactive grid. The student ticks every outcome they think is a
            Nash equilibrium of this one-shot game with no co-ordination. */}
        <section aria-label="Nash equilibrium grid" className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Which outcomes are Nash equilibria?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
            Tick every cell you think is a Nash equilibrium of this one-shot game
            with no co-ordination, then check your answers.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <caption className="sr-only">
                For each outcome, tick the box if you think it is a Nash
                equilibrium.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="bg-slate-800 p-3 text-sm font-semibold text-white">
                    <span className="sr-only">Outcome</span>
                  </th>
                  {COLS.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="bg-slate-800 p-3 text-center text-sm font-semibold text-white"
                    >
                      Nick {col.toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row}>
                    <th
                      scope="row"
                      className="border-b border-slate-700 bg-slate-800 p-3 text-left text-sm font-semibold text-white"
                    >
                      Ibrahim {row.toLowerCase()}
                    </th>
                    {COLS.map((col) => {
                      const id = `${row}-${col}`;
                      const info = CELL_INFO[id];
                      const chosen = Boolean(selections[id]);
                      const isCorrect = chosen === info.isNE;
                      const showTick = submitted && isCorrect;
                      const showCross = submitted && !isCorrect;

                      // Cell background: green when the tick matches the truth,
                      // red when it does not.
                      let cellClass = "bg-white";
                      if (submitted && isCorrect) cellClass = "bg-emerald-50";
                      else if (submitted) cellClass = "bg-rose-50";

                      // A full description for screen readers, updated on submit.
                      let aria = `Ibrahim ${row.toLowerCase()}, Nick ${col.toLowerCase()}: tick if this is a Nash equilibrium`;
                      if (submitted) {
                        aria =
                          `Ibrahim ${row.toLowerCase()}, Nick ${col.toLowerCase()}. ` +
                          `${info.isNE ? "This is a Nash equilibrium." : "This is not a Nash equilibrium."} ` +
                          `You ${chosen ? "ticked" : "did not tick"} it; ${isCorrect ? "correct." : "incorrect."}`;
                      }

                      return (
                        <td
                          key={col}
                          className={`border border-slate-200 p-0 text-center ${cellClass}`}
                        >
                          <label className="flex cursor-pointer flex-col items-center gap-2 p-4">
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={chosen}
                                onChange={() => handleToggle(id)}
                                aria-label={aria}
                                className="h-6 w-6 accent-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                              />
                              {showTick && (
                                <CheckCircle2 className="h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
                              )}
                              {showCross && (
                                <XCircle className="h-5 w-5 flex-none text-rose-700" aria-hidden="true" />
                              )}
                            </span>
                            {/* After checking, state the truth for this cell. */}
                            {submitted && (
                              <span
                                aria-hidden="true"
                                className={`text-xs font-medium ${
                                  info.isNE ? "text-emerald-800" : "text-slate-500"
                                }`}
                              >
                                {info.isNE ? "Nash equilibrium" : "Not an equilibrium"}
                              </span>
                            )}
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Check answers
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            Clear
          </button>
          <p className="text-sm text-slate-600" aria-live="polite">
            {selectedCount} ticked
          </p>
        </div>

        {/* Feedback shown after checking. */}
        {submitted && (
          <div
            role="region"
            aria-label="Feedback"
            className={`mt-6 rounded-xl border-2 p-5 ${
              allCorrect ? "border-emerald-600 bg-emerald-50" : "border-slate-300 bg-slate-100"
            }`}
          >
            <h2 className="text-lg font-bold text-slate-900">Feedback</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-800 sm:text-base">
              <p className="font-semibold">
                You correctly classified {correctCount} of {TOTAL} outcomes. The
                cells that are Nash equilibria are labelled in the grid.
              </p>
              <p>
                There are three potential Nash equilibria of this classic
                prisoners&apos; dilemma situation: (split, steal), (steal, split)
                or (steal, steal). Neither player has a strictly dominant
                strategy. We know that they won&apos;t settle on (split, split).
                Now go to the next exercise to see what happens if they can
                coordinate.
              </p>
            </div>
          </div>
        )}

        {/* Visually hidden live region announcing each action. */}
        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>
      </div>
    </div>
  );
};

export default SplitOrSteal;
